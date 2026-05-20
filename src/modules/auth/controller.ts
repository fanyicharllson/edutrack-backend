import { Request, Response } from 'express'
import { AuthService } from './service'
import { registerSchema, loginSchema, refreshSchema } from './schema'

const authService = new AuthService()

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - role
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 example: "john@example.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *               role:
 *                 type: string
 *                 enum: [PARENT, STUDENT]
 *                 example: "PARENT"
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                     accessToken:
 *                       type: string
 *                     refreshToken:
 *                       type: string
 *                 message:
 *                   type: string
 *       400:
 *         description: Validation error
 *       409:
 *         description: User already exists
 */
export async function register(req: Request, res: Response): Promise<void> {
  try {
    const validated = registerSchema.parse(req.body)
    const result = await authService.register(validated)

    res.status(201).json({
      success: true,
      data: result,
      message: 'User registered successfully',
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Registration failed'
    const statusCode = message.includes('already exists') ? 409 : 400

    res.status(statusCode).json({
      success: false,
      message,
      code: statusCode,
    })
  }
}

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Login a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
export async function login(req: Request, res: Response): Promise<void> {
  try {
    const validated = loginSchema.parse(req.body)
    const result = await authService.login(validated)

    res.status(200).json({
      success: true,
      data: result,
      message: 'Login successful',
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Login failed'

    res.status(401).json({
      success: false,
      message,
      code: 401,
    })
  }
}

/**
 * @swagger
 * /api/v1/auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *       401:
 *         description: Invalid refresh token
 */
export async function refresh(req: Request, res: Response): Promise<void> {
  try {
    const validated = refreshSchema.parse(req.body)
    const result = await authService.refresh(validated.refreshToken)

    res.status(200).json({
      success: true,
      data: result,
      message: 'Token refreshed successfully',
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Token refresh failed'

    res.status(401).json({
      success: false,
      message,
      code: 401,
    })
  }
}
