import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export interface AuthRequest extends Request {
  user?: {
    userId: number
    role: string
  }
}

export function authMiddleware(req: AuthRequest & { headers: Record<string, string | string[] | undefined> }, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers['authorization'] as string | undefined
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Missing or invalid authorization header',
        code: 401,
      })
      return
    }

    const token = authHeader.slice(7)
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'access-secret') as {
      userId: number
      role: string
    }

    req.user = decoded
    next()
  } catch {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
      code: 401,
    })
  }
}
