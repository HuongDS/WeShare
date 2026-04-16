import type { SplitStrategyEnum } from "@/constants/SplitStrategyEnum"

export interface UpdateTransactionDto {
  id: number
  description: string
  amount?: number
  splitAmounts?: Record<number, number> | null
  strategy: SplitStrategyEnum
  debtIds: number[]
}
