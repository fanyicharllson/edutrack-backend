import { linkStudent, getMyStudents } from './controller'
import * as userService from './service'

jest.mock('../../lib/prisma', () => ({ prisma: {} }))
jest.mock('../../events/eventBus', () => ({ emit: jest.fn() }))
jest.mock('./service')

const mockRes = () => {
  const res: any = {}
  res.status = jest.fn().mockReturnValue(res)
  res.json = jest.fn().mockReturnValue(res)
  return res
}

describe('UserController', () => {
  beforeEach(() => jest.clearAllMocks())

  describe('linkStudent', () => {
    it('should return 200 on success', async () => {
      const mockStudent = { id: 1, userId: 2, parentId: 1 }
      ;(userService.linkStudent as jest.Mock).mockResolvedValue(mockStudent)

      const req: any = { body: { studentEmail: 'jane@example.com' }, user: { userId: 1 } }
      const res = mockRes()

      await linkStudent(req, res)

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }))
    })

    it('should return 400 on error', async () => {
      ;(userService.linkStudent as jest.Mock).mockRejectedValue(new Error('Student not found'))

      const req: any = { body: { studentEmail: 'bad@example.com' }, user: { userId: 1 } }
      const res = mockRes()

      await linkStudent(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
    })
  })

  describe('getMyStudents', () => {
    it('should return 200 with students', async () => {
      ;(userService.getMyStudents as jest.Mock).mockResolvedValue([{ id: 1 }])

      const req: any = { user: { userId: 1 } }
      const res = mockRes()

      await getMyStudents(req, res)

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }))
    })

    it('should return 500 on error', async () => {
      ;(userService.getMyStudents as jest.Mock).mockRejectedValue(new Error('DB error'))

      const req: any = { user: { userId: 1 } }
      const res = mockRes()

      await getMyStudents(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
    })
  })
})
