export interface SearchGroupResultItem {
  id: number
  name: string
  type: string
  memberCount: number
}

export interface SearchEventResultItem {
  id: number
  groupId: number
  groupName: string
  name: string
  location?: string
  eventDate?: string
}

export interface SearchTaskResultItem {
  id: number
  groupId: number
  groupName: string
  title: string
  status: string
  dueAt?: string
}

export interface SearchExpenseResultItem {
  id: number
  groupId: number
  groupName: string
  description: string
  amount: number
  payerName: string
  createdAt: string
}

export interface SearchMemberResultItem {
  userId: number
  fullName: string
  avatar?: string
  groupId: number
  groupName: string
}

export interface GlobalSearchResult {
  groups: SearchGroupResultItem[]
  events: SearchEventResultItem[]
  tasks: SearchTaskResultItem[]
  expenses: SearchExpenseResultItem[]
  members: SearchMemberResultItem[]
}
