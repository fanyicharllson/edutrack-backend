import { Request, Response } from "express";
import * as txService from "./service";

/**
 * @swagger
 * /api/v1/student/spend:
 *   post:
 *     summary: Log a student expense
 *     tags: [Student]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Expense logged
 */
export async function spend(req: Request, res: Response) {
  try {
    const { amount, description } = req.body;
    const userId = (req as any).user.id as number;
    const result = await txService.spend(userId, Number(amount), description);
    res.json({
      success: true,
      data: result,
      message: "Expense logged successfully",
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message, code: 400 });
  }
}

/**
 * @swagger
 * /api/v1/student/balance:
 *   get:
 *     summary: Get student balance
 *     tags: [Student]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Balance info
 */
export async function getBalance(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id as number;
    const result = await txService.getMyBalance(userId);
    res.json({ success: true, data: result, message: "Balance fetched" });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message, code: 400 });
  }
}

/**
 * @swagger
 * /api/v1/student/transactions:
 *   get:
 *     summary: Get student transaction history
 *     tags: [Student]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Transaction list
 */
export async function getTransactions(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id as number;
    const result = await txService.getMyTransactions(userId);
    res.json({ success: true, data: result, message: "Transactions fetched" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message, code: 500 });
  }
}
