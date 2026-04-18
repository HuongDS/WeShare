import type { GroupRoleEnum } from "@/constants/GroupRoleEnum"

export interface GroupMemberViewDto {
  userId: number
  groupId: number
  role: GroupRoleEnum
  balance: number
}
