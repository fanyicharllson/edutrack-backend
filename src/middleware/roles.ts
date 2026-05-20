import { Response, NextFunction } from 'express'
import type { AuthRequest } from './auth'

export function isParent(req: AuthRequest, res: Response, next: NextFunction): void {
  if (req.user?.role !== 'PARENT') {
    res.status(403).json({
      success: false,
      message: 'Only parents can access this resource',
      code: 403,
    })
    return
  }
  next()
}

export function isStudent(req: AuthRequest, res: Response, next: NextFunction): void {
  if (req.user?.role !== 'STUDENT') {
    res.status(403).json({
      success: false,
      message: 'Only students can access this resource',
      code: 403,
    })
    return
  }
  next()
}
