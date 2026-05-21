import { prisma } from "../../lib/prisma";
import eventBus from "../../events/eventBus";

export async function spend(
  userId: number,
  amount: number,
  description: string,
) {
  const student = await prisma.student.findFirst({
    where: { userId },
    include: { user: true, wallet: true, parent: true },
  });

  if (!student) throw new Error("Student profile not found");
  if (!student.wallet) throw new Error("Wallet not found");
  if (student.wallet.currentBalance < amount)
    throw new Error("Insufficient balance");

  const wallet = await prisma.wallet.update({
    where: { id: student.wallet.id },
    data: { currentBalance: { decrement: amount } },
  });

  const transaction = await prisma.transaction.create({
    data: { walletId: wallet.id, amount, type: "SPEND", description },
  });

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const monthlySpend = await prisma.transaction.aggregate({
    where: {
      walletId: wallet.id,
      type: "SPEND",
      createdAt: { gte: startOfMonth },
    },
    _sum: { amount: true },
  });

  const totalSpent = monthlySpend._sum.amount || 0;

  if (student.parent?.email) {
    eventBus.emit("student:spent", {
      email: student.parent.email,
      amount,
      description,
      balance: wallet.currentBalance,
    });

    if (
      student.wallet.monthlyLimit > 0 &&
      totalSpent > student.wallet.monthlyLimit
    ) {
      eventBus.emit("limit:exceeded", {
        email: student.parent.email,
        monthlyLimit: student.wallet.monthlyLimit,
        spent: totalSpent,
      });
    }
  }

  const percentage =
    student.wallet.monthlyLimit > 0
      ? Math.round((totalSpent / student.wallet.monthlyLimit) * 100)
      : 0;
  const insight = `You've used ${percentage}% of your monthly limit so far.`;

  return { transaction, newBalance: wallet.currentBalance, insight };
}

export async function getMyTransactions(userId: number) {
  const student = await prisma.student.findFirst({
    where: { userId },
    include: {
      wallet: { include: { transactions: { orderBy: { createdAt: "desc" } } } },
    },
  });

  if (!student) throw new Error("Student profile not found");
  return { transactions: student.wallet?.transactions || [] };
}

export async function getMyBalance(userId: number) {
  const student = await prisma.student.findFirst({
    where: { userId },
    include: { wallet: true },
  });

  if (!student) throw new Error("Student profile not found");
  if (!student.wallet) throw new Error("Wallet not found");

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const monthlySpend = await prisma.transaction.aggregate({
    where: {
      walletId: student.wallet.id,
      type: "SPEND",
      createdAt: { gte: startOfMonth },
    },
    _sum: { amount: true },
  });

  const spentThisMonth = monthlySpend._sum.amount || 0;

  return {
    currentBalance: student.wallet.currentBalance,
    totalBudget: student.wallet.totalBudget,
    monthlyLimit: student.wallet.monthlyLimit,
    spentThisMonth,
    remainingThisMonth: student.wallet.monthlyLimit - spentThisMonth,
  };
}
