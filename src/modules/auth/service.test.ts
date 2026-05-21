// import request from 'supertest';
// import { prisma } from '../../lib/prisma'
// import eventBus from '../../events/eventBus'
// import bcryptjs from 'bcryptjs'
// import jwt from 'jsonwebtoken'
// import { AuthService } from './service'


// jest.mock('../../lib/prisma')
// jest.mock('../../events/eventBus')
// jest.mock('bcryptjs')
// jest.mock('jsonwebtoken')

// describe('AuthService', () => {
//   let authService: AuthService

//   beforeEach(() => {
//     authService = new AuthService()
//     jest.clearAllMocks()
//   })

//   describe('register', () => {
//     it('should register a new user successfully', async () => {
//       const userData = {
//         name: 'John Doe',
//         email: 'fanyicharllson@gmail.com',
//         password: 'password123',
//         role: 'PARENT' as const,
//       }

//       const hashedPassword = 'hashed_password'
//       ;(bcryptjs.hash as jest.Mock).mockResolvedValue(hashedPassword)
//       ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(null)
//       ;(prisma.user.create as jest.Mock).mockResolvedValue({
//         id: 1,
//         ...userData,
//         password: hashedPassword,
//         createdAt: new Date(),
//       })
//       ;(jwt.sign as jest.Mock).mockReturnValue('token')

//       const result = await authService.register(userData)

//       expect(result.user.email).toBe(userData.email)
//       expect(result.accessToken).toBe('token')
//       expect(result.refreshToken).toBe('token')
//       expect(eventBus.emit).toHaveBeenCalledWith('user:registered', expect.any(Object))
//     })

//     it('should throw error if user already exists', async () => {
//       const userData = {
//         name: 'John Doe',
//         email: 'fanyicharllson@gmail.com',
//         password: 'password123',
//         role: 'PARENT' as const,
//       }

//       ;(prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 1 })

//       await expect(authService.register(userData)).rejects.toThrow('User already exists')
//     })
//   })

//   describe('login', () => {
//     it('should login user successfully', async () => {
//       const loginData = {
//         email: 'fanyicharllson@gmail.com',
//         password: 'password123',
//       }

//       const user = {
//         id: 1,
//         name: 'John Doe',
//         email: loginData.email,
//         password: 'hashed_password',
//         role: 'PARENT',
//         createdAt: new Date(),
//       }

//       ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(user)
//       ;(bcryptjs.compare as jest.Mock).mockResolvedValue(true)
//       ;(jwt.sign as jest.Mock).mockReturnValue('token')

//       const result = await authService.login(loginData)

//       expect(result.user.email).toBe(loginData.email)
//       expect(result.accessToken).toBe('token')
//       expect(eventBus.emit).toHaveBeenCalledWith('user:loggedIn', expect.any(Object))
//     })

//     it('should throw error if user not found', async () => {
//       const loginData = {
//         email: 'fanyicharllson@gmail.com',
//         password: 'password123',
//       }

//       ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(null)

//       await expect(authService.login(loginData)).rejects.toThrow('Invalid credentials')
//     })

//     it('should throw error if password is invalid', async () => {
//       const loginData = {
//         email: 'fanyicharllson@gmail.com',
//         password: 'password123',
//       }

//       ;(prisma.user.findUnique as jest.Mock).mockResolvedValue({
//         id: 1,
//         email: loginData.email,
//         password: 'hashed_password',
//       })
//       ;(bcryptjs.compare as jest.Mock).mockResolvedValue(false)

//       await expect(authService.login(loginData)).rejects.toThrow('Invalid credentials')
//     })
//   })

//   describe('refresh', () => {
//     it('should refresh token successfully', async () => {
//       const refreshToken = 'valid_refresh_token'

//       ;(jwt.verify as jest.Mock).mockReturnValue({ userId: 1 })
//       ;(prisma.user.findUnique as jest.Mock).mockResolvedValue({
//         id: 1,
//         role: 'PARENT',
//       })
//       ;(jwt.sign as jest.Mock).mockReturnValue('new_token')

//       const result = await authService.refresh(refreshToken)

//       expect(result.accessToken).toBe('new_token')
//       expect(result.refreshToken).toBe('new_token')
//     })

//     it('should throw error if refresh token is invalid', async () => {
//       ;(jwt.verify as jest.Mock).mockImplementation(() => {
//         throw new Error('Invalid token')
//       })

//       await expect(authService.refresh('invalid_token')).rejects.toThrow('Invalid refresh token')
//     })
//   })
// })

