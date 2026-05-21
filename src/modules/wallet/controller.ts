import { Request, Response } from 'express'
import * as walletService from './service'

/**
 * @swagger
 * /api/v1/parent/deposit:
 *   post:
 *     summary: Deposit money to student wallet
 *     tags: [Parent]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               studentId:
 *                 type: integer
 *               amount:
 *                 type: number
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Deposit successful
 */
export async function deposit(req: Request, res: Response) {
  try {
    const { studentId, amount, description } = req.body
    const parentId = (req as any).user.userId as number
    const result = await walletService.deposit(parentId, Number(studentId), Number(amount), description)
    res.json({ success: true, data: result, message: 'Deposit successful' })
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message, code: 400 })
  }
}

/**
 * @swagger
 * /api/v1/parent/set-limit:
 *   post:
 *     summary: Set monthly spending limit for student
 *     tags: [Parent]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               studentId:
 *                 type: integer
 *               monthlyLimit:
 *                 type: number
 *     responses:
 *       200:
 *         description: Limit updated
 */
export async function setLimit(req: Request, res: Response) {
  try {
    const { studentId, monthlyLimit } = req.body
    const parentId = (req as any).user.userId as number
    const result = await walletService.setLimit(parentId, Number(studentId), Number(monthlyLimit))
    res.json({ success: true, data: result, message: 'Monthly limit updated' })
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message, code: 400 })
  }
}

/**
 * @swagger
 * /api/v1/parent/transactions/{studentId}:
 *   get:
 *     summary: Get student spending history
 *     tags: [Parent]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Transaction history
 */
export async function getStudentTransactions(req: Request, res: Response) {
  try {
    const { studentId } = req.params
    const parentId = (req as any).user.userId as number
    const result = await walletService.getStudentTransactions(parentId, Number(studentId))
    res.json({ success: true, data: result, message: 'Transactions fetched' })
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message, code: 400 })
  }
}
