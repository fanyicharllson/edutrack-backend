import { prisma } from '../../lib/prisma'
import eventBus from '../../events/eventBus'
import * as insightService from '../notifications/insightService'
import { spend, getMyTransactions, getMyBalance } from './service'

jest.mock('../../lib/prisma', () => ({
  prisma: {
    student: { findFirst: jest.fn() },
    wallet: { update: jest.fn() },
    transaction: { create: jest.fn(), aggregate: jest.fn() },
  },
}))
jest.mock('../../events/eventBus', () => ({ emit: jest.fn() }))
jest.mock('../notifications/insightService', () => ({
  generateSpendingInsight: jest.fn().mockResolvedValue("You've used 20% of your monthly limit."),
}))

const mockStudent = {
  id: 1, userId: 2, parentId: 1,
  user: { id: 2, name: 'Jane', email: 'jane@example.com' },
  parent: { id: 1, email: 'parent@example.com' },
  wallet: { id: 1, totalBudget: 100000, monthlyLimit: 50000, currentBalance: 80000 },
}

describe('TransactionService', () => {
  beforeEach(() => jest.clearAllMocks())

  describe('spend', () => {
    it('should log expense successfully', async () => {
      ;(prisma.student.findFirst as jest.Mock).mockResolvedValue(mockStudent)
      ;(prisma.wallet.update as jest.Mock).mockResolvedValue({
        ...mockStudent.wallet, currentBalance: 75000,
      })
      ;(prisma.transaction.create as jest.Mock).mockResolvedValue({
        id: 1, walletId: 1, amount: 5000, type: 'SPEND', description: 'Lunch', createdAt: new Date(),
      })
      ;(prisma.transaction.aggregate as jest.Mock).mockResolvedValue({ _sum: { amount: 10000 } })

      const result = await spend(2, 5000, 'Lunch')

      expect(result.newBalance).toBe(75000)
      expect(result.transaction.type).toBe('SPEND')
      expect(result.insight).toBeDefined()
      expect(eventBus.emit).toHaveBeenCalledWith('student:spent', expect.objectContaining({
        email: 'parent@example.com', amount: 5000,
      }))
    })

    it('should emit limit:exceeded when over monthly limit', async () => {
      ;(prisma.student.findFirst as jest.Mock).mockResolvedValue(mockStudent)
      ;(prisma.wallet.update as jest.Mock).mockResolvedValue({
        ...mockStudent.wallet, currentBalance: 75000,
      })
      ;(prisma.transaction.create as jest.Mock).mockResolvedValue({
        id: 1, walletId: 1, amount: 5000, type: 'SPEND', description: 'Lunch', createdAt: new Date(),
      })
      ;(prisma.transaction.aggregate as jest.Mock).mockResolvedValue({ _sum: { amount: 60000 } })

      await spend(2, 5000, 'Lunch')

      expect(eventBus.emit).toHaveBeenCalledWith('limit:exceeded', expect.objectContaining({
        email: 'parent@example.com',
        monthlyLimit: 50000,
        spent: 60000,
      }))
    })

    it('should throw if student not found', async () => {
      ;(prisma.student.findFirst as jest.Mock).mockResolvedValue(null)
      await expect(spend(99, 5000, 'Lunch')).rejects.toThrow('Student profile not found')
    })

    it('should throw if wallet not found', async () => {
      ;(prisma.student.findFirst as jest.Mock).mockResolvedValue({ ...mockStudent, wallet: null })
      await expect(spend(2, 5000, 'Lunch')).rejects.toThrow('Wallet not found')
    })

    it('should throw if insufficient balance', async () => {
      ;(prisma.student.findFirst as jest.Mock).mockResolvedValue({
        ...mockStudent,
        wallet: { ...mockStudent.wallet, currentBalance: 1000 },
      })
      await expect(spend(2, 5000, 'Lunch')).rejects.toThrow('Insufficient balance')
    })

    it('should not emit events if no parent email', async () => {
      ;(prisma.student.findFirst as jest.Mock).mockResolvedValue({ ...mockStudent, parent: null })
      ;(prisma.wallet.update as jest.Mock).mockResolvedValue({ ...mockStudent.wallet, currentBalance: 75000 })
      ;(prisma.transaction.create as jest.Mock).mockResolvedValue({
        id: 1, walletId: 1, amount: 5000, type: 'SPEND', description: 'Lunch', createdAt: new Date(),
      })
      ;(prisma.transaction.aggregate as jest.Mock).mockResolvedValue({ _sum: { amount: 5000 } })

      await spend(2, 5000, 'Lunch')

      expect(eventBus.emit).not.toHaveBeenCalled()
    })
  })

  describe('getMyTransactions', () => {
    it('should return transactions', async () => {
      ;(prisma.student.findFirst as jest.Mock).mockResolvedValue({
        ...mockStudent,
        wallet: {
          ...mockStudent.wallet,
          transactions: [
            { id: 1, amount: 5000, type: 'SPEND', description: 'Lunch', createdAt: new Date() },
          ],
        },
      })

      const result = await getMyTransactions(2)

      expect(result.transactions).toHaveLength(1)
    })

    it('should throw if student not found', async () => {
      ;(prisma.student.findFirst as jest.Mock).mockResolvedValue(null)
      await expect(getMyTransactions(99)).rejects.toThrow('Student profile not found')
    })

    it('should return empty array if no wallet', async () => {
      ;(prisma.student.findFirst as jest.Mock).mockResolvedValue({ ...mockStudent, wallet: null })
      const result = await getMyTransactions(2)
      expect(result.transactions).toHaveLength(0)
    })
  })

  describe('getMyBalance', () => {
    it('should return balance info', async () => {
      ;(prisma.student.findFirst as jest.Mock).mockResolvedValue(mockStudent)
      ;(prisma.transaction.aggregate as jest.Mock).mockResolvedValue({ _sum: { amount: 10000 } })

      const result = await getMyBalance(2)

      expect(result.currentBalance).toBe(80000)
      expect(result.spentThisMonth).toBe(10000)
      expect(result.remainingThisMonth).toBe(40000)
    })

    it('should throw if student not found', async () => {
      ;(prisma.student.findFirst as jest.Mock).mockResolvedValue(null)
      await expect(getMyBalance(99)).rejects.toThrow('Student profile not found')
    })

    it('should throw if wallet not found', async () => {
      ;(prisma.student.findFirst as jest.Mock).mockResolvedValue({ ...mockStudent, wallet: null })
      await expect(getMyBalance(2)).rejects.toThrow('Wallet not found')
    })
  })
})
