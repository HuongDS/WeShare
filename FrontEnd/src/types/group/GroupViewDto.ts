import type { GroupTypeEnum } from "@/constants/GroupTypeEnum"
import type { GroupMemberViewDto } from "./GroupMemberViewDto"

export interface GroupViewDto {
  id: number
  name: string
  type: GroupTypeEnum
  members: GroupMemberViewDto[]
  description: string
}
