import type { UserViewDto } from "../user/UserViewDto"

export interface GroupDebtViewDto {
  id: number
  groupId: number
  fromUser: UserViewDto
  toUser: UserViewDto
  amount: number
  updated_At: Date
}
