import { Request, Response } from 'express'
import * as userService from './service'

/**
 * @swagger
 * /api/v1/parent/link-student:
 *   post:
 *     summary: Link a student to parent account
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
 *               studentEmail:
 *                 type: string
 *     responses:
 *       200:
 *         description: Student linked successfully
 */
export async function linkStudent(req: Request, res: Response) {
  try {
    const { studentEmail } = req.body
    const parentId = (req as any).user.userId as number
    const student = await userService.linkStudent(parentId, studentEmail)
    res.json({ success: true, data: { student }, message: 'Student linked successfully' })
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message, code: 400 })
  }
}

/**
 * @swagger
 * /api/v1/parent/students:
 *   get:
 *     summary: Get all linked students
 *     tags: [Parent]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of students
 */
export async function getMyStudents(req: Request, res: Response) {
  try {
    const parentId = (req as any).user.userId as number
    const students = await userService.getMyStudents(parentId)
    res.json({ success: true, data: { students }, message: 'Students fetched' })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message, code: 500 })
  }
}
