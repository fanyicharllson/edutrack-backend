import { prisma } from '../../lib/prisma'

export async function linkStudent(parentId: number, studentEmail: string) {
  const student = await prisma.user.findUnique({
    where: { email: studentEmail }
  })

  if (!student) throw new Error('Student not found')
  if (student.role !== 'STUDENT') throw new Error('User is not a student')

  const existing = await prisma.student.findFirst({
    where: { userId: student.id, parentId }
  })
  if (existing) throw new Error('Student already linked')

  const linked = await prisma.student.create({
    data: {
      userId: student.id,
      parentId,
      wallet: {
        create: {
          totalBudget: 0,
          monthlyLimit: 0,
          currentBalance: 0
        }
      }
    },
    include: { user: { select: { id: true, name: true, email: true } }, wallet: true }
  })

  return linked
}

export async function getMyStudents(parentId: number) {
  const students = await prisma.student.findMany({
    where: { parentId },
    include: {
      user: { select: { id: true, name: true, email: true } },
      wallet: true
    }
  })
  return students
}
