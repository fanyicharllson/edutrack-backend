import { prisma } from '../../lib/prisma'
import { linkStudent, getMyStudents } from './service'

jest.mock('../../lib/prisma', () => ({
  prisma: {
    user: { findUnique: jest.fn() },
    student: { findFirst: jest.fn(), create: jest.fn(), findMany: jest.fn() },
  },
}))

describe('UserService', () => {
  beforeEach(() => jest.clearAllMocks())

  describe('linkStudent', () => {
    const mockStudentUser = { id: 2, name: 'Jane', email: 'jane@example.com', role: 'STUDENT' }

    it('should link student successfully', async () => {
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockStudentUser)
      ;(prisma.student.findFirst as jest.Mock).mockResolvedValue(null)
      ;(prisma.student.create as jest.Mock).mockResolvedValue({
        id: 1, userId: 2, parentId: 1,
        user: { id: 2, name: 'Jane', email: 'jane@example.com' },
        wallet: { id: 1, totalBudget: 0, monthlyLimit: 0, currentBalance: 0 },
      })

      const result = await linkStudent(1, 'jane@example.com')

      expect(result.userId).toBe(2)
      expect(result.parentId).toBe(1)
      expect(prisma.student.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ userId: 2, parentId: 1 }),
      }))
    })

    it('should throw if student email not found', async () => {
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(null)
      await expect(linkStudent(1, 'notfound@example.com')).rejects.toThrow('Student not found')
    })

    it('should throw if user is not a STUDENT', async () => {
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue({ ...mockStudentUser, role: 'PARENT' })
      await expect(linkStudent(1, 'jane@example.com')).rejects.toThrow('User is not a student')
    })

    it('should throw if student already linked', async () => {
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockStudentUser)
      ;(prisma.student.findFirst as jest.Mock).mockResolvedValue({ id: 1 })
      await expect(linkStudent(1, 'jane@example.com')).rejects.toThrow('Student already linked')
    })
  })

  describe('getMyStudents', () => {
    it('should return list of students', async () => {
      const mockStudents = [
        {
          id: 1, userId: 2, parentId: 1,
          user: { id: 2, name: 'Jane', email: 'jane@example.com' },
          wallet: { id: 1, totalBudget: 100000, monthlyLimit: 50000, currentBalance: 80000 },
        },
      ]
      ;(prisma.student.findMany as jest.Mock).mockResolvedValue(mockStudents)

      const result = await getMyStudents(1)

      expect(result).toHaveLength(1)
      expect(result[0].user.email).toBe('jane@example.com')
    })

    it('should return empty array if no students', async () => {
      ;(prisma.student.findMany as jest.Mock).mockResolvedValue([])
      const result = await getMyStudents(1)
      expect(result).toHaveLength(0)
    })
  })
})
