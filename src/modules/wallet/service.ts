import { prisma } from '../../lib/prisma'
import eventBus from '../../events/eventBus'

export async function deposit(parentId: number, studentId: number, amount: number, description: string) {
  const student = await prisma.student.findFirst({
    where: { userId: studentId, parentId },
    include: { user: true, wallet: true, parent: true }
  })

  if (!student) throw new Error('Student not found or not linked to this parent')
  if (!student.wallet) throw new Error('Student wallet not found')

  const wallet = await prisma.wallet.update({
    where: { id: student.wallet.id },
    data: {
      currentBalance: { increment: amount },
      totalBudget: { increment: amount }
    }
  })

  const transaction = await prisma.transaction.create({
    data: { walletId: wallet.id, amount, type: 'DEPOSIT', description }
  })

  eventBus.emit('wallet:deposited', {
    email: student.user.email,
    amount,
    balance: wallet.currentBalance
  })

  return { transaction, newBalance: wallet.currentBalance }
}

export async function setLimit(parentId: number, studentId: number, monthlyLimit: number) {
  const student = await prisma.student.findFirst({
    where: { userId: studentId, parentId },
    include: { wallet: true }
  })

  if (!student) throw new Error('Student not found or not linked to this parent')
  if (!student.wallet) throw new Error('Student wallet not found')

  const wallet = await prisma.wallet.update({
    where: { id: student.wallet.id },
    data: { monthlyLimit }
  })

  return { monthlyLimit: wallet.monthlyLimit }
}

export async function getStudentTransactions(parentId: number, studentId: number) {
  const student = await prisma.student.findFirst({
    where: { userId: studentId, parentId },
    include: {
      wallet: { include: { transactions: { orderBy: { createdAt: 'desc' } } } }
    }
  })

  if (!student) throw new Error('Student not found or not linked to this parent')

  const transactions = student.wallet?.transactions || []
  const totalSpent = transactions
    .filter(t => t.type === 'SPEND')
    .reduce((sum, t) => sum + t.amount, 0)

  return {
    transactions,
    summary: {
      totalSpent,
      monthlyLimit: student.wallet?.monthlyLimit || 0,
      remaining: (student.wallet?.monthlyLimit || 0) - totalSpent
    }
  }
}
