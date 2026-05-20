import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../../lib/prisma'
import eventBus from '../../events/eventBus'
import type { RegisterRequest, LoginRequest } from './schema'

const ACCESS_TOKEN_EXPIRY = '15m'
const REFRESH_TOKEN_EXPIRY = '7d'

export class AuthService {
  async register(data: RegisterRequest) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    })

    if (existingUser) {
      throw new Error('User already exists')
    }

    const hashedPassword = await bcryptjs.hash(data.password, 10)

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: data.role as 'PARENT' | 'STUDENT',
      },
    })

    const { password: _, ...userWithoutPassword } = user

    eventBus.emit('user:registered', {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    })

    const accessToken = this.generateAccessToken(user.id, user.role)
    const refreshToken = this.generateRefreshToken(user.id)

    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    }
  }

  async login(data: LoginRequest) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    })

    if (!user) {
      throw new Error('Invalid credentials')
    }

    const isPasswordValid = await bcryptjs.compare(data.password, user.password)
    if (!isPasswordValid) {
      throw new Error('Invalid credentials')
    }

    const { password: _, ...userWithoutPassword } = user

    const accessToken = this.generateAccessToken(user.id, user.role)
    const refreshToken = this.generateRefreshToken(user.id)

    eventBus.emit('user:loggedIn', {
      userId: user.id,
      email: user.email,
    })

    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    }
  }

  async refresh(refreshToken: string) {
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'refresh-secret') as {
        userId: number
      }

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      })

      if (!user) {
        throw new Error('User not found')
      }

      const accessToken = this.generateAccessToken(user.id, user.role)
      const newRefreshToken = this.generateRefreshToken(user.id)

      return {
        accessToken,
        refreshToken: newRefreshToken,
      }
    } catch {
      throw new Error('Invalid refresh token')
    }
  }

  private generateAccessToken(userId: number, role: string): string {
    return jwt.sign(
      { userId, role },
      process.env.JWT_ACCESS_SECRET || 'access-secret',
      { expiresIn: ACCESS_TOKEN_EXPIRY }
    )
  }

  private generateRefreshToken(userId: number): string {
    return jwt.sign(
      { userId },
      process.env.JWT_REFRESH_SECRET || 'refresh-secret',
      { expiresIn: REFRESH_TOKEN_EXPIRY }
    )
  }
}
