import request from 'supertest'
import app from '../../app'
import { prisma } from '../../lib/prisma'
import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'


jest.mock('../../../lib/prisma')
jest.mock('../../../events/eventBus')
jest.mock('bcryptjs')
jest.mock('jsonwebtoken')

describe('Auth Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/v1/auth/register', () => {
    it('should register user successfully', async () => {
      const userData = {
        name: 'John Doe',
        email: 'fanyicharllson@gmail.com',
        password: 'password123',
        role: 'PARENT',
      }

      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(null)
      ;(bcryptjs.hash as jest.Mock).mockResolvedValue('hashed_password')
      ;(prisma.user.create as jest.Mock).mockResolvedValue({
        id: 1,
        ...userData,
        password: 'hashed_password',
        createdAt: new Date(),
      })
      ;(jwt.sign as jest.Mock).mockReturnValue('token')

      const response = await request(app).post('/api/v1/auth/register').send(userData)

      expect(response.status).toBe(201)
      expect(response.body.success).toBe(true)
      expect(response.body.data.user.email).toBe(userData.email)
      expect(response.body.data.accessToken).toBeDefined()
      expect(response.body.data.refreshToken).toBeDefined()
    })

    it('should reject duplicate email', async () => {
      const userData = {
        name: 'John Doe',
        email: 'fanyicharllson@gmail.com',
        password: 'password123',
        role: 'PARENT',
      }

      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 1 })

      const response = await request(app).post('/api/v1/auth/register').send(userData)

      expect(response.status).toBe(409)
      expect(response.body.success).toBe(false)
    })

    it('should validate required fields', async () => {
      const response = await request(app).post('/api/v1/auth/register').send({
        name: 'John',
      })

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
    })
  })

  describe('POST /api/v1/auth/login', () => {
    it('should login user successfully', async () => {
      const loginData = {
        email: 'fanyicharllson@gmail.com',
        password: 'password123',
      }

      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 1,
        name: 'John Doe',
        email: loginData.email,
        password: 'hashed_password',
        role: 'PARENT',
        createdAt: new Date(),
      })
      ;(bcryptjs.compare as jest.Mock).mockResolvedValue(true)
      ;(jwt.sign as jest.Mock).mockReturnValue('token')

      const response = await request(app).post('/api/v1/auth/login').send(loginData)

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data.accessToken).toBeDefined()
    })

    it('should reject invalid credentials', async () => {
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(null)

      const response = await request(app).post('/api/v1/auth/login').send({
        email: 'fanyicharllson@gmail.com',
        password: 'password123',
      })

      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
    })
  })

  describe('POST /api/v1/auth/refresh', () => {
    it('should refresh token successfully', async () => {
      ;(jwt.verify as jest.Mock).mockReturnValue({ userId: 1 })
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 1,
        role: 'PARENT',
      })
      ;(jwt.sign as jest.Mock).mockReturnValue('token')

      const response = await request(app).post('/api/v1/auth/refresh').send({
        refreshToken: 'valid_refresh_token',
      })

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data.accessToken).toBeDefined()
    })

    it('should reject invalid refresh token', async () => {
      const response = await request(app).post('/api/v1/auth/refresh').send({
        refreshToken: '',
      })

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
    })
  })
})
