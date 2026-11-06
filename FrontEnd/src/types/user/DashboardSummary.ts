export interface DashboardActivity {
  id: number
  title: string
  description: string
  category: "Expense" | "Payment" | "Settlement" | "Group" | "Task" | string
  amount?: number
  groupName?: string
  groupId?: number
  payerName?: string
  payerAvatar?: string
  createdAt: string
}

export interface DashboardSummary {
  totalSpent: number
  totalOwe: number
  totalOwedToYou: number
  netBalance: number
  totalGroups: number
  pendingTasksCount: number
  recentActivities: DashboardActivity[]
}
