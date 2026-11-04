import type { GroupRoleEnum } from "@/constants/GroupRoleEnum"
import type { UserViewDto } from "../user/UserViewDto"

export interface GroupMemberDetailsViewDto {
  user: UserViewDto
  groupId: number
  role: GroupRoleEnum
  balance: number
}
