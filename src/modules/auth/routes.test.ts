import request from 'supertest'
import app from '../../app'
import { prisma } from '../../lib/prisma'
import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'

jest.mock('../../lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}))
jest.mock('../../events/eventBus', () => ({ emit: jest.fn() }))
jest.mock('../../modules/notifications/listener', () => ({
  initializeNotificationListeners: jest.fn(),
}))
jest.mock('bcryptjs')
jest.mock('jsonwebtoken')

describe('Auth Routes', () => {
  beforeEach(() => jest.clearAllMocks())

  describe('POST /api/v1/auth/register', () => {
    const userData = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      role: 'PARENT',
    }

    it('should register user successfully', async () => {
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(null)
      ;(bcryptjs.hash as jest.Mock).mockResolvedValue('hashed_password')
      ;(prisma.user.create as jest.Mock).mockResolvedValue({
        id: 1, ...userData, password: 'hashed_password', createdAt: new Date(),
      })
      ;(jwt.sign as jest.Mock).mockReturnValue('token')

      const res = await request(app).post('/api/v1/auth/register').send(userData)

      expect(res.status).toBe(201)
      expect(res.body.success).toBe(true)
      expect(res.body.data.user.email).toBe(userData.email)
      expect(res.body.data.accessToken).toBeDefined()
      expect(res.body.data.refreshToken).toBeDefined()
    })

    it('should reject duplicate email', async () => {
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 1 })

      const res = await request(app).post('/api/v1/auth/register').send(userData)

      expect(res.status).toBe(409)
      expect(res.body.success).toBe(false)
    })

    it('should reject missing fields', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({ name: 'John' })

      expect(res.status).toBe(400)
      expect(res.body.success).toBe(false)
    })

    it('should reject invalid role', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        ...userData, role: 'ADMIN',
      })

      expect(res.status).toBe(400)
      expect(res.body.success).toBe(false)
    })
  })

  describe('POST /api/v1/auth/login', () => {
    it('should login successfully', async () => {
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 1, name: 'John', email: 'john@example.com',
        password: 'hashed', role: 'PARENT', createdAt: new Date(),
      })
      ;(bcryptjs.compare as jest.Mock).mockResolvedValue(true)
      ;(jwt.sign as jest.Mock).mockReturnValue('token')

      const res = await request(app).post('/api/v1/auth/login').send({
        email: 'john@example.com', password: 'password123',
      })

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.accessToken).toBeDefined()
    })

    it('should reject invalid credentials', async () => {
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(null)

      const res = await request(app).post('/api/v1/auth/login').send({
        email: 'john@example.com', password: 'wrong',
      })

      expect(res.status).toBe(401)
      expect(res.body.success).toBe(false)
    })
  })

  describe('POST /api/v1/auth/refresh', () => {
    it('should refresh token successfully', async () => {
      ;(jwt.verify as jest.Mock).mockReturnValue({ userId: 1 })
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 1, role: 'PARENT' })
      ;(jwt.sign as jest.Mock).mockReturnValue('new_token')

      const res = await request(app).post('/api/v1/auth/refresh').send({
        refreshToken: 'valid_token',
      })

      expect(res.status).toBe(200)
      expect(res.body.data.accessToken).toBeDefined()
    })

    it('should reject missing refresh token', async () => {
      const res = await request(app).post('/api/v1/auth/refresh').send({})

      expect(res.status).toBe(401)
      expect(res.body.success).toBe(false)
    })
  })
})
