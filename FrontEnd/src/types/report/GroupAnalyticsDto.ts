export interface CategorySpendingDto {
  label: string
  amount: number
  count: number
}

export interface MemberSpendingDto {
  userId: number
  fullName: string
  paid: number
  share: number
}

export interface GroupAnalyticsDto {
  totalSpending: number
  transactionCount: number
  byCategory: CategorySpendingDto[]
  byMember: MemberSpendingDto[]
}
