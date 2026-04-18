import type { GroupTypeEnum } from "@/constants/GroupTypeEnum"

export interface UpdateGroupDto {
  groupId: number
  type: GroupTypeEnum
  name: string
}
