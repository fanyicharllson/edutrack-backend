import { prisma } from '../../lib/prisma'
import eventBus from '../../events/eventBus'
import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { AuthService } from './service'

jest.mock('../../lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}))
jest.mock('../../events/eventBus', () => ({ emit: jest.fn() }))
jest.mock('bcryptjs')
jest.mock('jsonwebtoken')

describe('AuthService', () => {
  let authService: AuthService

  beforeEach(() => {
    authService = new AuthService()
    jest.clearAllMocks()
  })

  describe('register', () => {
    const userData = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      role: 'PARENT' as const,
    }

    it('should register a new user successfully', async () => {
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(null)
      ;(bcryptjs.hash as jest.Mock).mockResolvedValue('hashed_password')
      ;(prisma.user.create as jest.Mock).mockResolvedValue({
        id: 1, ...userData, password: 'hashed_password', createdAt: new Date(),
      })
      ;(jwt.sign as jest.Mock).mockReturnValue('token')

      const result = await authService.register(userData)

      expect(result.user.email).toBe(userData.email)
      expect(result.accessToken).toBe('token')
      expect(result.refreshToken).toBe('token')
      expect(result.user).not.toHaveProperty('password')
      expect(eventBus.emit).toHaveBeenCalledWith('user:registered', expect.any(Object))
    })

    it('should throw if user already exists', async () => {
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 1 })
      await expect(authService.register(userData)).rejects.toThrow('User already exists')
    })
  })

  describe('login', () => {
    const loginData = { email: 'john@example.com', password: 'password123' }
    const mockUser = {
      id: 1, name: 'John Doe', email: 'john@example.com',
      password: 'hashed_password', role: 'PARENT', createdAt: new Date(),
    }

    it('should login successfully', async () => {
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)
      ;(bcryptjs.compare as jest.Mock).mockResolvedValue(true)
      ;(jwt.sign as jest.Mock).mockReturnValue('token')

      const result = await authService.login(loginData)

      expect(result.user.email).toBe(loginData.email)
      expect(result.accessToken).toBe('token')
      expect(eventBus.emit).toHaveBeenCalledWith('user:loggedIn', expect.any(Object))
    })

    it('should throw if user not found', async () => {
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(null)
      await expect(authService.login(loginData)).rejects.toThrow('Invalid credentials')
    })

    it('should throw if password is wrong', async () => {
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)
      ;(bcryptjs.compare as jest.Mock).mockResolvedValue(false)
      await expect(authService.login(loginData)).rejects.toThrow('Invalid credentials')
    })
  })

  describe('refresh', () => {
    it('should refresh token successfully', async () => {
      ;(jwt.verify as jest.Mock).mockReturnValue({ userId: 1 })
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 1, role: 'PARENT' })
      ;(jwt.sign as jest.Mock).mockReturnValue('new_token')

      const result = await authService.refresh('valid_refresh_token')

      expect(result.accessToken).toBe('new_token')
      expect(result.refreshToken).toBe('new_token')
    })

    it('should throw if refresh token is invalid', async () => {
      ;(jwt.verify as jest.Mock).mockImplementation(() => { throw new Error('Invalid') })
      await expect(authService.refresh('bad_token')).rejects.toThrow('Invalid refresh token')
    })

    it('should throw if user not found during refresh', async () => {
      ;(jwt.verify as jest.Mock).mockReturnValue({ userId: 99 })
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(null)
      await expect(authService.refresh('valid_token')).rejects.toThrow('Invalid refresh token')
    })
  })
})
