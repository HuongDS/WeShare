import type { SplitStrategyEnum } from "@/constants/SplitStrategyEnum"
import type { TransactionTypeEnumString } from "@/constants/TransactionTypeEnum"

export interface CreateTransactionDto {
  groupId: number
  payerId: number
  amount: number
  description?: string | null
  taskId?: number | null
  strategy?: number | SplitStrategyEnum
  stategy?: number | SplitStrategyEnum
  type: number | TransactionTypeEnumString
  splitAmounts?: Record<number, number> | null
  debtIds: number[]
  receiptUrl?: string
}
