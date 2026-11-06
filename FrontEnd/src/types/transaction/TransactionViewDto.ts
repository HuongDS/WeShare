import type { SplitStrategyEnum } from "@/constants/SplitStrategyEnum"
import type { UserViewDto } from "../user/UserViewDto"
import type { TransactionSplitViewDto } from "./TransactionSplitViewDto"

export interface TransactionTaskSummary {
  id: number
  title: string
  status?: string
}

export interface TransactionViewDto {
  id: number
  groupId: number
  payer: UserViewDto
  amount: number
  description?: string | null
  taskId?: number | null
  task?: TransactionTaskSummary | null
  splitStrategy: SplitStrategyEnum
  transactionSplits: TransactionSplitViewDto[]
  createdAt: Date
  ProofUrl?: string
}
