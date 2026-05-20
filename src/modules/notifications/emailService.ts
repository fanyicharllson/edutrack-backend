import resend from '../../lib/resend'

const SENDER_EMAIL = 'noreply@teamnest.me'

export interface EmailPayload {
  to: string
  subject: string
  html: string
}

/**
 * Send email via Resend
 * @param payload Email payload with recipient, subject, and HTML content
 */
export async function sendEmail(payload: EmailPayload): Promise<void> {
  try {
    await resend.emails.send({
      from: SENDER_EMAIL,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
    })
  } catch (error) {
    console.error('Failed to send email:', error)
    throw error
  }
}

/**
 * Send welcome email to newly registered user
 * @param email User email address
 * @param name User name
 */
export async function sendWelcomeEmail(email: string, name: string): Promise<void> {
  const html = `
    <h1>Welcome to EduTrack, ${name}!</h1>
    <p>Thank you for registering with EduTrack, your personal finance tracker.</p>
    <p>You can now:</p>
    <ul>
      <li>Track your expenses</li>
      <li>Monitor your budget</li>
      <li>View transaction history</li>
    </ul>
    <p>Get started by logging in to your account and exploring your dashboard.</p>
    <p>Best regards,<br/>The EduTrack Team</p>
  `

  await sendEmail({
    to: email,
    subject: 'Welcome to EduTrack!',
    html,
  })
}

/**
 * Send wallet deposited notification
 * @param email User email address
 * @param amount Amount deposited
 * @param balance New balance
 */
export async function sendWalletDepositedEmail(
  email: string,
  amount: number,
  balance: number
): Promise<void> {
  const html = `
    <h2>Wallet Deposit Confirmation</h2>
    <p>A deposit of $${amount.toFixed(2)} has been added to your wallet.</p>
    <p><strong>New Balance:</strong> $${balance.toFixed(2)}</p>
    <p>Thank you for using EduTrack!</p>
  `

  await sendEmail({
    to: email,
    subject: `Wallet Deposit Confirmation: $${amount.toFixed(2)}`,
    html,
  })
}

/**
 * Send spending notification
 * @param email User email address
 * @param amount Amount spent
 * @param description Transaction description
 * @param balance Remaining balance
 */
export async function sendSpendingEmail(
  email: string,
  amount: number,
  description: string,
  balance: number
): Promise<void> {
  const html = `
    <h2>Transaction Confirmed</h2>
    <p>You spent $${amount.toFixed(2)} on ${description}.</p>
    <p><strong>Remaining Balance:</strong> $${balance.toFixed(2)}</p>
    <p>Keep track of your spending with EduTrack!</p>
  `

  await sendEmail({
    to: email,
    subject: `Transaction: $${amount.toFixed(2)} spent`,
    html,
  })
}

/**
 * Send budget limit exceeded notification
 * @param email User email address
 * @param monthlyLimit Monthly budget limit
 * @param spent Amount already spent
 */
export async function sendLimitExceededEmail(
  email: string,
  monthlyLimit: number,
  spent: number
): Promise<void> {
  const html = `
    <h2>Budget Limit Alert</h2>
    <p>You have exceeded your monthly budget limit!</p>
    <p><strong>Monthly Limit:</strong> $${monthlyLimit.toFixed(2)}</p>
    <p><strong>Amount Spent:</strong> $${spent.toFixed(2)}</p>
    <p><strong>Overspent:</strong> $${(spent - monthlyLimit).toFixed(2)}</p>
    <p>Please review your spending and adjust your budget if needed.</p>
  `

  await sendEmail({
    to: email,
    subject: 'Budget Limit Exceeded Alert',
    html,
  })
}
