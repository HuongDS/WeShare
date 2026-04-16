import type { UserViewDto } from "../user/UserViewDto"

export interface TransactionSplitViewDto {
  transactionId: number
  debtor: UserViewDto
  owedAmount: number
}
