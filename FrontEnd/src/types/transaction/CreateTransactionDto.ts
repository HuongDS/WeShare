import type { SplitStrategyEnum } from "@/constants/SplitStrategyEnum"
import type { TransactionTypeEnumString } from "@/constants/TransactionTypeEnum"

export interface CreateTransactionDto {
  groupId: number
  payerId: number
  amount: number
  description?: string | null
  taskId?: number | null
  stategy: SplitStrategyEnum
  type: TransactionTypeEnumString
  splitAmounts?: Record<number, number> | null
  debtIds: number[]
}
