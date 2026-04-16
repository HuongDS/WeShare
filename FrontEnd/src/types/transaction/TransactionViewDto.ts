import type { SplitStrategyEnum } from "@/constants/SplitStrategyEnum"
import type { UserViewDto } from "../user/UserViewDto"
import type { TransactionSplitViewDto } from "./TransactionSplitViewDto"

export interface TransactionViewDto {
  id: number
  groupId: number
  payer: UserViewDto
  amount: number
  description?: string | null
  task?: number | null // Assuming task is represented by its ID, adjust if it's a different type
  splitStrategy: SplitStrategyEnum
  transactionSplits: TransactionSplitViewDto[]
  createdAt: Date
}
