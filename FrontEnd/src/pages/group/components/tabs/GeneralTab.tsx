import { useEffect, useMemo, useState } from "react"
import { useForm, useWatch } from "react-hook-form"
import { Info, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useGetGroup, useUpdateGroup } from "@/hooks/group/useGroup"
import { useOtherUserProfile } from "@/hooks/user/useUser"
import { useQueryClient } from "@tanstack/react-query"
import type { GroupRoleEnum } from "@/constants/GroupRoleEnum"
import type { GroupTypeEnum } from "@/constants/GroupTypeEnum"
import type { UpdateGroupDto } from "@/types/group/UpdateGroupDto"
import type { GroupViewDto } from "@/types/group/GroupViewDto"

interface GroupProfileFormValues {
  name: string
  description: string
  type: GroupTypeEnum
}

interface CompactMemberRowProps {
  userId: number
  role: GroupRoleEnum
}

interface GeneralTabProps {
  groupId: number
  group: GroupViewDto
  onOpenMembersTab: () => void
}

const getGroupTypeConfig = (rawType: string | number | undefined | null) => {
  const type = String(rawType ?? "").toLowerCase()

  switch (type) {
    case "1":
    case "club":
      return {
        label: "Club",
        badgeClass: "bg-emerald-100 text-emerald-700",
      }
    case "2":
    case "travel":
      return {
        label: "Travel",
        badgeClass: "bg-blue-100 text-blue-700",
      }
    case "0":
    case "none":
    case "general":
    default:
      return {
        label: "General",
        badgeClass: "bg-slate-100 text-slate-700",
      }
  }
}

const normalizeGroupType = (
  rawType: string | number | undefined | null
): GroupTypeEnum => {
  const type = String(rawType ?? "").toLowerCase()
  if (type === "1" || type === "club") {
    return "Club"
  }
  if (type === "2" || type === "travel") {
    return "Travel"
  }
  return "None"
}

const CompactMemberRow = ({ userId, role }: CompactMemberRowProps) => {
  const { getOtherUserProfile } = useOtherUserProfile(String(userId))
  const user = getOtherUserProfile.data?.data
  const fullName = user?.fullName || `User #${userId}`
  const initials = fullName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="flex items-center justify-between rounded-xl border border-border/60 px-3 py-2.5">
      <div className="flex min-w-0 items-center gap-3">
        <Avatar size="sm">
          <AvatarImage src={user?.avatar} alt={fullName} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <p className="truncate text-sm font-medium text-foreground">
          {fullName}
        </p>
      </div>
      <Badge variant="outline" className="text-[10px] uppercase">
        {role === "Leader" ? "Admin" : "Member"}
      </Badge>
    </div>
  )
}

export default function GeneralTab({
  groupId,
  group,
  onOpenMembersTab,
}: GeneralTabProps) {
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)
  const [isReviewing, setIsReviewing] = useState(false)
  const { updateGroup } = useUpdateGroup()

  const { group: refreshedGroup } = useGetGroup(groupId)
  const groupData = refreshedGroup.data?.data || group

  const config = useMemo(
    () => getGroupTypeConfig(groupData?.type),
    [groupData?.type]
  )

  const {
    register,
    control,
    setValue,
    trigger,
    reset,
    formState: { errors },
  } = useForm<GroupProfileFormValues>({
    defaultValues: {
      name: "",
      description: "",
      type: "None",
    },
  })

  useEffect(() => {
    if (!groupData) {
      return
    }
    reset({
      name: groupData.name || "",
      description: groupData.description || "",
      type: normalizeGroupType(groupData.type),
    })
  }, [groupData, reset])

  const watchedName = useWatch({ control, name: "name" })
  const watchedDescription = useWatch({ control, name: "description" })
  const watchedType = useWatch({ control, name: "type" })
  const members = useMemo(() => groupData?.members || [], [groupData?.members])

  const originalValues: GroupProfileFormValues = {
    name: groupData?.name || "",
    description: groupData?.description || "",
    type: normalizeGroupType(groupData?.type),
  }

  const changedFields = {
    name: watchedName?.trim() !== originalValues.name.trim(),
    description:
      (watchedDescription || "").trim() !== originalValues.description.trim(),
    type: watchedType !== originalValues.type,
  }

  const hasChanges =
    changedFields.name || changedFields.description || changedFields.type

  const handleCancelEdit = () => {
    reset(originalValues)
    setIsEditing(false)
    setIsReviewing(false)
  }

  const handleReviewChanges = async () => {
    const isValid = await trigger(["name", "description", "type"])
    if (!isValid) {
      return
    }
    setIsReviewing(true)
  }

  const handleConfirmUpdate = async () => {
    if (!hasChanges || updateGroup.isPending) {
      return
    }

    try {
      await updateGroup.mutateAsync({
        groupId,
        name: (watchedName || "").trim(),
        type: watchedType || "None",
        description: (watchedDescription || "").trim(),
      } as UpdateGroupDto & { description: string })

      await queryClient.invalidateQueries({ queryKey: ["group", groupId] })
      setIsEditing(false)
      setIsReviewing(false)
    } catch {
      // Errors are already handled in hook-level onError.
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 pt-4 md:grid-cols-3">
      <Card className="md:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Group Profile</CardTitle>
          {!isEditing && (
            <Button size="sm" onClick={() => setIsEditing(true)}>
              Edit Group
            </Button>
          )}
          {isEditing && !isReviewing && (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={handleCancelEdit}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleReviewChanges}>
                Review Changes
              </Button>
            </div>
          )}
          {isEditing && isReviewing && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsReviewing(false)}
              >
                Back to Edit
              </Button>
              <Button
                size="sm"
                disabled={!hasChanges || updateGroup.isPending}
                onClick={handleConfirmUpdate}
              >
                {updateGroup.isPending ? "Updating..." : "Confirm Update"}
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-5">
          {!isEditing && (
            <>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Info className="h-4 w-4" />
                  Group Name
                </div>
                <p className="text-sm font-semibold text-foreground">
                  {groupData.name}
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Tag className="h-4 w-4" />
                  Type
                </div>
                <p className="text-sm leading-relaxed text-foreground">
                  {config.label}
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Info className="h-4 w-4" />
                  Description
                </div>
                <p className="text-sm leading-relaxed text-foreground">
                  {groupData.description?.trim() || "No description provided"}
                </p>
              </div>
            </>
          )}

          {isEditing && !isReviewing && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="group-name">Group Name</Label>
                <Input
                  id="group-name"
                  {...register("name", {
                    required: "Group name is required",
                    maxLength: {
                      value: 50,
                      message: "Name must be 50 characters or fewer",
                    },
                  })}
                />
                {errors.name && (
                  <p className="text-xs text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="group-description">Description</Label>
                <Input
                  id="group-description"
                  {...register("description", {
                    maxLength: {
                      value: 200,
                      message: "Description must be 200 characters or fewer",
                    },
                  })}
                />
                {errors.description && (
                  <p className="text-xs text-destructive">
                    {errors.description.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={watchedType}
                  onValueChange={(value) =>
                    setValue("type", value as GroupTypeEnum, {
                      shouldDirty: true,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select group type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="None">General</SelectItem>
                    <SelectItem value="Club">Club</SelectItem>
                    <SelectItem value="Travel">Travel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {isEditing && isReviewing && (
            <div className="space-y-4">
              {!hasChanges && (
                <p className="text-sm text-muted-foreground">
                  No changes detected. Go back and update at least one field.
                </p>
              )}

              {changedFields.name && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Group Name</p>
                  <div className="text-sm">
                    <span className="text-muted-foreground line-through">
                      {originalValues.name}
                    </span>
                    <span className="mx-2 text-muted-foreground">-&gt;</span>
                    <span className="font-medium text-emerald-600">
                      {watchedName}
                    </span>
                  </div>
                </div>
              )}

              {changedFields.type && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Type</p>
                  <div className="text-sm">
                    <span className="text-muted-foreground line-through">
                      {originalValues.type === "None"
                        ? "General"
                        : originalValues.type}
                    </span>
                    <span className="mx-2 text-muted-foreground">-&gt;</span>
                    <span className="font-medium text-emerald-600">
                      {watchedType === "None" ? "General" : watchedType}
                    </span>
                  </div>
                </div>
              )}

              {changedFields.description && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Description</p>
                  <div className="text-sm">
                    <span className="text-muted-foreground line-through">
                      {originalValues.description || "No description provided"}
                    </span>
                    <span className="mx-2 text-muted-foreground">-&gt;</span>
                    <span className="font-medium text-emerald-600">
                      {watchedDescription || "No description provided"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="col-span-1">
        <CardHeader>
          <CardTitle className="text-lg">Members Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {members.slice(0, 4).map((member) => (
              <CompactMemberRow
                key={`general-compact-${member.userId}`}
                userId={member.userId}
                role={member.role}
              />
            ))}
          </div>
          <Button
            variant="outline"
            className="mt-4 w-full"
            onClick={onOpenMembersTab}
          >
            View All Members
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
