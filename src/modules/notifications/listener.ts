import eventBus from '../../events/eventBus'
import {
  sendWelcomeEmail,
  sendWalletDepositedEmail,
  sendSpendingEmail,
  sendLimitExceededEmail,
} from './emailService'

/**
 * Initialize all notification event listeners
 * This should be called once in app.ts to set up the event handlers
 */
export function initializeNotificationListeners(): void {
  /**
   * Listen for user registration and send welcome email
   */
  eventBus.on('user:registered', async (data: { email: string; name: string }) => {
    try {
      await sendWelcomeEmail(data.email, data.name)
      console.log(`Welcome email sent to ${data.email}`)
    } catch (error) {
      console.error(`Failed to send welcome email to ${data.email}:`, error)
    }
  })

  /**
   * Listen for wallet deposit events
   */
  eventBus.on(
    'wallet:deposited',
    async (data: { email: string; amount: number; balance: number }) => {
      try {
        await sendWalletDepositedEmail(data.email, data.amount, data.balance)
        console.log(`Deposit notification sent to ${data.email}`)
      } catch (error) {
        console.error(`Failed to send deposit email to ${data.email}:`, error)
      }
    }
  )

  /**
   * Listen for spending events
   */
  eventBus.on(
    'student:spent',
    async (data: { email: string; amount: number; description: string; balance: number }) => {
      try {
        await sendSpendingEmail(data.email, data.amount, data.description, data.balance)
        console.log(`Spending notification sent to ${data.email}`)
      } catch (error) {
        console.error(`Failed to send spending email to ${data.email}:`, error)
      }
    }
  )

  /**
   * Listen for budget limit exceeded events
   */
  eventBus.on(
    'limit:exceeded',
    async (data: { email: string; monthlyLimit: number; spent: number }) => {
      try {
        await sendLimitExceededEmail(data.email, data.monthlyLimit, data.spent)
        console.log(`Limit exceeded alert sent to ${data.email}`)
      } catch (error) {
        console.error(`Failed to send limit exceeded email to ${data.email}:`, error)
      }
    }
  )

  console.log('✅ Notification listeners initialized')
}
