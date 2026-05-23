import { prisma } from '../../lib/prisma'
import eventBus from '../../events/eventBus'
import { deposit, setLimit, getStudentTransactions } from './service'

jest.mock('../../lib/prisma', () => ({
  prisma: {
    student: { findFirst: jest.fn() },
    wallet: { update: jest.fn() },
    transaction: { create: jest.fn() },
  },
}))
jest.mock('../../events/eventBus', () => ({ emit: jest.fn() }))

const mockStudent = {
  id: 1, userId: 2, parentId: 1,
  user: { id: 2, name: 'Jane', email: 'jane@example.com' },
  parent: { id: 1, email: 'parent@example.com' },
  wallet: { id: 1, totalBudget: 100000, monthlyLimit: 50000, currentBalance: 80000 },
}

describe('WalletService', () => {
  beforeEach(() => jest.clearAllMocks())

  describe('deposit', () => {
    it('should deposit successfully', async () => {
      ;(prisma.student.findFirst as jest.Mock).mockResolvedValue(mockStudent)
      ;(prisma.wallet.update as jest.Mock).mockResolvedValue({
        ...mockStudent.wallet, currentBalance: 130000, totalBudget: 150000,
      })
      ;(prisma.transaction.create as jest.Mock).mockResolvedValue({
        id: 1, walletId: 1, amount: 50000, type: 'DEPOSIT', description: 'Test deposit', createdAt: new Date(),
      })

      const result = await deposit(1, 2, 50000, 'Test deposit')

      expect(result.newBalance).toBe(130000)
      expect(result.transaction.type).toBe('DEPOSIT')
      expect(eventBus.emit).toHaveBeenCalledWith('wallet:deposited', expect.objectContaining({
        email: 'jane@example.com', amount: 50000,
      }))
    })

    it('should throw if student not found', async () => {
      ;(prisma.student.findFirst as jest.Mock).mockResolvedValue(null)
      await expect(deposit(1, 99, 50000, 'Test')).rejects.toThrow('Student not found or not linked to this parent')
    })

    it('should throw if wallet not found', async () => {
      ;(prisma.student.findFirst as jest.Mock).mockResolvedValue({ ...mockStudent, wallet: null })
      await expect(deposit(1, 2, 50000, 'Test')).rejects.toThrow('Student wallet not found')
    })
  })

  describe('setLimit', () => {
    it('should set monthly limit successfully', async () => {
      ;(prisma.student.findFirst as jest.Mock).mockResolvedValue(mockStudent)
      ;(prisma.wallet.update as jest.Mock).mockResolvedValue({
        ...mockStudent.wallet, monthlyLimit: 75000,
      })

      const result = await setLimit(1, 2, 75000)

      expect(result.monthlyLimit).toBe(75000)
    })

    it('should throw if student not found', async () => {
      ;(prisma.student.findFirst as jest.Mock).mockResolvedValue(null)
      await expect(setLimit(1, 99, 75000)).rejects.toThrow('Student not found or not linked to this parent')
    })

    it('should throw if wallet not found', async () => {
      ;(prisma.student.findFirst as jest.Mock).mockResolvedValue({ ...mockStudent, wallet: null })
      await expect(setLimit(1, 2, 75000)).rejects.toThrow('Student wallet not found')
    })
  })

  describe('getStudentTransactions', () => {
    it('should return transactions and summary', async () => {
      const mockTransactions = [
        { id: 1, amount: 10000, type: 'SPEND', description: 'Lunch', createdAt: new Date() },
        { id: 2, amount: 5000, type: 'SPEND', description: 'Transport', createdAt: new Date() },
      ]
      ;(prisma.student.findFirst as jest.Mock).mockResolvedValue({
        ...mockStudent,
        wallet: { ...mockStudent.wallet, transactions: mockTransactions },
      })

      const result = await getStudentTransactions(1, 2)

      expect(result.transactions).toHaveLength(2)
      expect(result.summary.totalSpent).toBe(15000)
      expect(result.summary.remaining).toBe(35000)
    })

    it('should throw if student not found', async () => {
      ;(prisma.student.findFirst as jest.Mock).mockResolvedValue(null)
      await expect(getStudentTransactions(1, 99)).rejects.toThrow('Student not found or not linked to this parent')
    })

    it('should return empty transactions if wallet has none', async () => {
      ;(prisma.student.findFirst as jest.Mock).mockResolvedValue({
        ...mockStudent,
        wallet: { ...mockStudent.wallet, transactions: [] },
      })

      const result = await getStudentTransactions(1, 2)

      expect(result.transactions).toHaveLength(0)
      expect(result.summary.totalSpent).toBe(0)
    })
  })
})
