import { deposit, setLimit, getStudentTransactions } from './controller'
import * as walletService from './service'

jest.mock('../../lib/prisma', () => ({ prisma: {} }))
jest.mock('../../events/eventBus', () => ({ emit: jest.fn() }))
jest.mock('./service')

const mockRes = () => {
  const res: any = {}
  res.status = jest.fn().mockReturnValue(res)
  res.json = jest.fn().mockReturnValue(res)
  return res
}

describe('WalletController', () => {
  beforeEach(() => jest.clearAllMocks())

  describe('deposit', () => {
    it('should return 200 on success', async () => {
      ;(walletService.deposit as jest.Mock).mockResolvedValue({ transaction: {}, newBalance: 100000 })

      const req: any = { body: { studentId: 2, amount: 50000, description: 'Test' }, user: { userId: 1 } }
      const res = mockRes()

      await deposit(req, res)

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }))
    })

    it('should return 400 on error', async () => {
      ;(walletService.deposit as jest.Mock).mockRejectedValue(new Error('Student not found'))

      const req: any = { body: { studentId: 99, amount: 50000, description: 'Test' }, user: { userId: 1 } }
      const res = mockRes()

      await deposit(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
    })
  })

  describe('setLimit', () => {
    it('should return 200 on success', async () => {
      ;(walletService.setLimit as jest.Mock).mockResolvedValue({ monthlyLimit: 75000 })

      const req: any = { body: { studentId: 2, monthlyLimit: 75000 }, user: { userId: 1 } }
      const res = mockRes()

      await setLimit(req, res)

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }))
    })

    it('should return 400 on error', async () => {
      ;(walletService.setLimit as jest.Mock).mockRejectedValue(new Error('Not found'))

      const req: any = { body: { studentId: 99, monthlyLimit: 75000 }, user: { userId: 1 } }
      const res = mockRes()

      await setLimit(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
    })
  })

  describe('getStudentTransactions', () => {
    it('should return 200 on success', async () => {
      ;(walletService.getStudentTransactions as jest.Mock).mockResolvedValue({ transactions: [], summary: {} })

      const req: any = { params: { studentId: '2' }, user: { userId: 1 } }
      const res = mockRes()

      await getStudentTransactions(req, res)

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }))
    })

    it('should return 400 on error', async () => {
      ;(walletService.getStudentTransactions as jest.Mock).mockRejectedValue(new Error('Not found'))

      const req: any = { params: { studentId: '99' }, user: { userId: 1 } }
      const res = mockRes()

      await getStudentTransactions(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
    })
  })
})
