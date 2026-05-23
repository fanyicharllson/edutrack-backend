import { authMiddleware } from './auth'
import { isParent, isStudent } from './roles'
import jwt from 'jsonwebtoken'

jest.mock('jsonwebtoken')

const mockRes = () => {
  const res: any = {}
  res.status = jest.fn().mockReturnValue(res)
  res.json = jest.fn().mockReturnValue(res)
  return res
}

describe('authMiddleware', () => {
  const next = jest.fn()

  beforeEach(() => jest.clearAllMocks())

  it('should call next with valid token', () => {
    ;(jwt.verify as jest.Mock).mockReturnValue({ userId: 1, role: 'PARENT' })
    const req: any = { headers: { authorization: 'Bearer valid_token' } }
    const res = mockRes()

    authMiddleware(req, res, next)

    expect(next).toHaveBeenCalled()
    expect(req.user).toEqual({ userId: 1, role: 'PARENT' })
  })

  it('should return 401 if no authorization header', () => {
    const req: any = { headers: {} }
    const res = mockRes()

    authMiddleware(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
  })

  it('should return 401 if token does not start with Bearer', () => {
    const req: any = { headers: { authorization: 'Basic token' } }
    const res = mockRes()

    authMiddleware(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
  })

  it('should return 401 if token is invalid', () => {
    ;(jwt.verify as jest.Mock).mockImplementation(() => { throw new Error('Invalid') })
    const req: any = { headers: { authorization: 'Bearer bad_token' } }
    const res = mockRes()

    authMiddleware(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
  })
})

describe('isParent', () => {
  const next = jest.fn()

  beforeEach(() => jest.clearAllMocks())

  it('should call next if user is PARENT', () => {
    const req: any = { user: { userId: 1, role: 'PARENT' } }
    const res = mockRes()

    isParent(req, res, next)

    expect(next).toHaveBeenCalled()
  })

  it('should return 403 if user is not PARENT', () => {
    const req: any = { user: { userId: 2, role: 'STUDENT' } }
    const res = mockRes()

    isParent(req, res, next)

    expect(res.status).toHaveBeenCalledWith(403)
    expect(next).not.toHaveBeenCalled()
  })
})

describe('isStudent', () => {
  const next = jest.fn()

  beforeEach(() => jest.clearAllMocks())

  it('should call next if user is STUDENT', () => {
    const req: any = { user: { userId: 2, role: 'STUDENT' } }
    const res = mockRes()

    isStudent(req, res, next)

    expect(next).toHaveBeenCalled()
  })

  it('should return 403 if user is not STUDENT', () => {
    const req: any = { user: { userId: 1, role: 'PARENT' } }
    const res = mockRes()

    isStudent(req, res, next)

    expect(res.status).toHaveBeenCalledWith(403)
    expect(next).not.toHaveBeenCalled()
  })
})

import { errorHandler, ApiError } from './errorHandler'

describe('errorHandler', () => {
  const next = jest.fn()

  it('should handle ApiError with correct status', () => {
    const req: any = {}
    const res = mockRes()
    const err = new ApiError(404, 'Not found')

    errorHandler(err, req, res, next)

    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false, message: 'Not found', code: 404,
    }))
  })

  it('should handle generic Error with 500', () => {
    const req: any = {}
    const res = mockRes()
    const err = new Error('Something broke')

    errorHandler(err, req, res, next)

    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false, code: 500 }))
  })
})
