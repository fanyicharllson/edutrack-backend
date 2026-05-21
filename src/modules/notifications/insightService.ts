const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

export async function generateSpendingInsight(
  studentName: string,
  amount: number,
  description: string,
  currentBalance: number,
  monthlyLimit: number,
  totalSpent: number,
): Promise<string> {
  try {
    const response = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `You are a financial advisor for students. Respond with exactly 1-2 sentences of spending insight. No greetings, no names, no intro — just the insight directly.
Spent: ${amount} FCFA on "${description}".
Balance remaining: ${currentBalance} FCFA.
Monthly limit: ${monthlyLimit} FCFA.
Total spent this month: ${totalSpent} FCFA.
Be encouraging but honest.`,
              },
            ],
          },
        ],
        generationConfig: {
          maxOutputTokens: 200,
          temperature: 0.7,
        },
      }),
    });

    const data = (await response.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
      error?: { message?: string };
    };
    if (data.error) console.error('Gemini API error:', data.error.message)
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
    return text || buildFallbackInsight(amount, totalSpent, monthlyLimit, currentBalance)
  } catch (error) {
    console.error("Gemini insight failed:", error);
    return buildFallbackInsight(amount, totalSpent, monthlyLimit, currentBalance)
  }
}

function buildFallbackInsight(amount: number, totalSpent: number, monthlyLimit: number, currentBalance: number): string {
  const percentage = monthlyLimit > 0 ? Math.round((totalSpent / monthlyLimit) * 100) : 0
  const remaining = monthlyLimit > 0 ? monthlyLimit - totalSpent : 0

  if (monthlyLimit > 0 && totalSpent > monthlyLimit) {
    return `You've used ${percentage}% of your monthly limit and exceeded it by ${(totalSpent - monthlyLimit).toLocaleString()} FCFA. Try to reduce spending for the rest of the month.`
  }
  if (monthlyLimit > 0 && percentage >= 80) {
    return `You've used ${percentage}% of your monthly limit — only ${remaining.toLocaleString()} FCFA remaining. Spend carefully!`
  }
  if (monthlyLimit > 0) {
    return `You've used ${percentage}% of your monthly limit. You have ${remaining.toLocaleString()} FCFA left for this month.`
  }
  return `You spent ${amount.toLocaleString()} FCFA. Your current balance is ${currentBalance.toLocaleString()} FCFA.`
}
