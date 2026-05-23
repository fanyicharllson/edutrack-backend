import { spend, getBalance, getTransactions } from './controller'
import * as txService from './service'

jest.mock('../../lib/prisma', () => ({ prisma: {} }))
jest.mock('../../events/eventBus', () => ({ emit: jest.fn() }))
jest.mock('../notifications/insightService', () => ({ generateSpendingInsight: jest.fn() }))
jest.mock('./service')

const mockRes = () => {
  const res: any = {}
  res.status = jest.fn().mockReturnValue(res)
  res.json = jest.fn().mockReturnValue(res)
  return res
}

describe('TransactionController', () => {
  beforeEach(() => jest.clearAllMocks())

  describe('spend', () => {
    it('should return 200 on success', async () => {
      ;(txService.spend as jest.Mock).mockResolvedValue({
        transaction: {}, newBalance: 75000, insight: 'Good job!',
      })

      const req: any = { body: { amount: 5000, description: 'Lunch' }, user: { userId: 2 } }
      const res = mockRes()

      await spend(req, res)

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }))
    })

    it('should return 400 on error', async () => {
      ;(txService.spend as jest.Mock).mockRejectedValue(new Error('Insufficient balance'))

      const req: any = { body: { amount: 999999, description: 'Too much' }, user: { userId: 2 } }
      const res = mockRes()

      await spend(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
    })
  })

  describe('getBalance', () => {
    it('should return 200 with balance', async () => {
      ;(txService.getMyBalance as jest.Mock).mockResolvedValue({
        currentBalance: 80000, monthlyLimit: 50000, spentThisMonth: 10000, remainingThisMonth: 40000,
      })

      const req: any = { user: { userId: 2 } }
      const res = mockRes()

      await getBalance(req, res)

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }))
    })

    it('should return 400 on error', async () => {
      ;(txService.getMyBalance as jest.Mock).mockRejectedValue(new Error('Not found'))

      const req: any = { user: { userId: 99 } }
      const res = mockRes()

      await getBalance(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
    })
  })

  describe('getTransactions', () => {
    it('should return 200 with transactions', async () => {
      ;(txService.getMyTransactions as jest.Mock).mockResolvedValue({ transactions: [] })

      const req: any = { user: { userId: 2 } }
      const res = mockRes()

      await getTransactions(req, res)

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }))
    })

    it('should return 500 on error', async () => {
      ;(txService.getMyTransactions as jest.Mock).mockRejectedValue(new Error('DB error'))

      const req: any = { user: { userId: 99 } }
      const res = mockRes()

      await getTransactions(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
    })
  })
})
