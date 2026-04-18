import type { GroupTypeEnum } from "@/constants/GroupTypeEnum"

export interface CreateGroupDto {
  name: string
  type: GroupTypeEnum
}
