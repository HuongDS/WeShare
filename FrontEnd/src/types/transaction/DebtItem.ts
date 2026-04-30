/**
 * DebtItem represents a single debt obligation from payer to recipient
 * This is the core unit for item-first settlement architecture
 */
export interface DebtItem {
  id: string // Unique identifier (e.g., "tx:1:debtor:2")
  transactionId: number
  description: string
  amount: number
  recipientId: string
  recipientName: string
  recipientAvatar?: string
  groupId: number
  groupName: string
}
