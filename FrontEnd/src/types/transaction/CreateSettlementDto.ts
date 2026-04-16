import type { TransactionPaymentTypeEnum } from "@/constants/TransactionPaymentTypeEnum"

export interface CreateSettlementDto {
  groupId: number
  payerId: number
  amount: number
  description?: string | null
  taskId?: number | null
  receiverId: number
  proofUrl?: string
  paymentType: TransactionPaymentTypeEnum
}
