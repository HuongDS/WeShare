import { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { ArrowRight, Loader2, Minus, Plus, Search, X } from "lucide-react"
import {
  useAddGroupMembers,
  useCreateGroup,
  useRemoveGroupMembers,
  useUpdateGroup,
} from "@/hooks/group/useGroup"
import { useOtherUserProfile, useSearchUsers } from "@/hooks/user/useUser"
import { useAppSelector } from "@/store/hooks"
import type { GroupTypeEnum } from "@/constants/GroupTypeEnum"
import type { GroupViewDto } from "@/types/group/GroupViewDto"
import type { UserViewDto } from "@/types/user/UserViewDto"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import MemberListItem from "./MemberListItem"

const groupFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Tên nhóm là bắt buộc")
    .max(50, "Tên nhóm tối đa 50 ký tự"),
  description: z
    .string()
    .trim()
    .max(200, "Mô tả tối đa 200 ký tự")
    .optional(),
  type: z.enum(["None", "Club", "Travel"]),
})

type GroupFormValues = z.infer<typeof groupFormSchema>

interface GroupFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "create" | "edit"
  initialData?: GroupViewDto | null
}

const groupTypeOptions: Array<{
  value: GroupTypeEnum
  label: string
  dotClass: string
  badgeClass: string
}> = [
  {
    value: "None",
    label: "Thông thường",
    dotClass: "bg-slate-400",
    badgeClass: "bg-slate-100 text-slate-700",
  },
  {
    value: "Club",
    label: "Câu lạc bộ",
    dotClass: "bg-emerald-500",
    badgeClass: "bg-emerald-100 text-emerald-700",
  },
  {
    value: "Travel",
    label: "Du lịch",
    dotClass: "bg-blue-500",
    badgeClass: "bg-blue-100 text-blue-700",
  },
]

const mapGroupType = (type: GroupTypeEnum | number | string): GroupTypeEnum => {
  if (typeof type === "number") {
    return type === 1 ? "Club" : type === 2 ? "Travel" : "None"
  }
  return type as GroupTypeEnum
}

interface ReviewMemberNameProps {
  userId: number
  className?: string
}

const ReviewMemberName = ({ userId, className }: ReviewMemberNameProps) => {
  const { getOtherUserProfile } = useOtherUserProfile(String(userId))
  const name = getOtherUserProfile.data?.data?.fullName

  if (getOtherUserProfile.isLoading) {
    return (
      <span className={cn("text-muted-foreground", className)}>Đang tải...</span>
    )
  }

  return <span className={className}>{name || `Thành viên #${userId}`}</span>
}

export default function GroupFormModal({
  open,
  onOpenChange,
  mode,
  initialData,
}: GroupFormModalProps) {
  const { createGroup } = useCreateGroup()
  const { updateGroup } = useUpdateGroup()
  const { addMembers } = useAddGroupMembers()
  const { removeMembers } = useRemoveGroupMembers()
  const [step, setStep] = useState<1 | 2>(1)
  const [searchKey, setSearchKey] = useState("")
  const [searchPageIndex, setSearchPageIndex] = useState(1)
  const [membersToAdd, setMembersToAdd] = useState<number[]>([])
  const [membersToRemove, setMembersToRemove] = useState<number[]>([])
  const [addedUserMap, setAddedUserMap] = useState<Record<number, UserViewDto>>(
    {}
  )
  const searchPageSize = 6
  const currentUserId = Number(
    useAppSelector((state) => state.auth.user?.userId)
  )

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<GroupFormValues>({
    resolver: zodResolver(groupFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: "",
      type: initialData?.type || "None",
    },
  })

  const selectedType = watch("type")
  const currentName = watch("name")
  const currentDescription = watch("description")
  const isPending =
    createGroup.isPending ||
    updateGroup.isPending ||
    addMembers.isPending ||
    removeMembers.isPending

  const { searchUsers } = useSearchUsers(
    searchKey,
    searchPageSize,
    searchPageIndex
  )

  const currentMemberIds = useMemo(
    () => new Set(initialData?.members?.map((member) => member.userId) || []),
    [initialData]
  )

  const membersToAddSet = useMemo(() => new Set(membersToAdd), [membersToAdd])

  const membersToRemoveSet = useMemo(
    () => new Set(membersToRemove),
    [membersToRemove]
  )

  const toggleMemberToRemove = (userId: number) => {
    setMembersToRemove((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    )
    setMembersToAdd((prev) => prev.filter((id) => id !== userId))
  }

  const addUserToMembers = (user: UserViewDto) => {
    const numericId = Number(user.id)
    if (Number.isNaN(numericId)) {
      return
    }

    setMembersToAdd((prev) =>
      prev.includes(numericId) ? prev : [...prev, numericId]
    )
    setMembersToRemove((prev) => prev.filter((id) => id !== numericId))
    setAddedUserMap((prev) => ({ ...prev, [numericId]: user }))
  }

  const undoAddUser = (userId: number) => {
    setMembersToAdd((prev) => prev.filter((id) => id !== userId))
    setAddedUserMap((prev) => {
      const next = { ...prev }
      delete next[userId]
      return next
    })
  }

  useEffect(() => {
    if (!open) {
      reset({
        name: "",
        description: "",
        type: "None",
      })
      setSearchKey("")
      setSearchPageIndex(1)
      setMembersToAdd([])
      setMembersToRemove([])
      setAddedUserMap({})
      setStep(1)
      return
    }

    if (mode === "edit" && initialData) {
      reset({
        name: initialData.name,
        description: "",
        type: mapGroupType(initialData.type),
      })
      setMembersToAdd([])
      setMembersToRemove([])
      setSearchKey("")
      setSearchPageIndex(1)
      setAddedUserMap({})
      setStep(1)
    }

    if (mode === "create") {
      reset({
        name: "",
        description: "",
        type: "None",
      })
      setMembersToAdd([])
      setMembersToRemove([])
      setSearchKey("")
      setSearchPageIndex(1)
      setAddedUserMap({})
      setStep(1)
    }
  }, [open, mode, initialData, reset])

  const typeOption = useMemo(
    () => groupTypeOptions.find((option) => option.value === selectedType),
    [selectedType]
  )

  const onSubmit = async (values: GroupFormValues) => {
    const payload = {
      name: values.name.trim(),
      description: values.description?.trim() || "",
      type: values.type || "None",
    }

    if (step === 1) {
      setStep(2)
      return
    }

    if (mode === "create") {
      createGroup.mutate(
        {
          name: payload.name,
          type: payload.type,
        },
        {
          onSuccess: () => onOpenChange(false),
        }
      )
      return
    }

    if (initialData) {
      try {
        await updateGroup.mutateAsync({
          groupId: initialData.id,
          name: payload.name,
          type: payload.type,
        })

        if (membersToAdd.length > 0) {
          await addMembers.mutateAsync({
            groupId: initialData.id,
            memberIds: membersToAdd,
            userId: Number.isNaN(currentUserId) ? 0 : currentUserId,
          })
        }

        if (membersToRemove.length > 0) {
          await removeMembers.mutateAsync({
            groupId: initialData.id,
            memberIds: membersToRemove,
            userId: Number.isNaN(currentUserId) ? 0 : currentUserId,
          })
        }

        onOpenChange(false)
      } catch {
        // Errors are handled in the hook-level error handlers.
      }
    }
  }

  const searchResults = useMemo(() => {
    const users = searchUsers.data?.data?.items || []
    return users.filter((user) => {
      const numericId = Number(user.id)
      if (Number.isNaN(numericId)) {
        return false
      }

      if (membersToAddSet.has(numericId)) {
        return false
      }

      if (!currentMemberIds.has(numericId)) {
        return true
      }

      return membersToRemoveSet.has(numericId)
    })
  }, [
    searchUsers.data?.data?.items,
    currentMemberIds,
    membersToAddSet,
    membersToRemoveSet,
  ])

  const activeMembers = useMemo(
    () =>
      initialData?.members?.filter(
        (member) => !membersToRemoveSet.has(member.userId)
      ) || [],
    [initialData, membersToRemoveSet]
  )

  const removedMembers = useMemo(
    () =>
      initialData?.members?.filter((member) =>
        membersToRemoveSet.has(member.userId)
      ) || [],
    [initialData, membersToRemoveSet]
  )

  const addedMembers = useMemo(
    () => membersToAdd.map((userId) => addedUserMap[userId]).filter(Boolean),
    [membersToAdd, addedUserMap]
  )

  const reviewRows = useMemo(() => {
    if (!initialData) {
      return []
    }

    const previousDescription = ""
    return [
      {
        label: "Tên nhóm",
        oldValue: initialData.name,
        newValue: currentName?.trim() || "",
      },
      {
        label: "Mô tả",
        oldValue: previousDescription,
        newValue: currentDescription?.trim() || "",
      },
      {
        label: "Loại nhóm",
        oldValue: initialData.type,
        newValue: selectedType,
      },
    ].filter((row) => row.oldValue !== row.newValue)
  }, [currentDescription, currentName, initialData, selectedType])

  const hasChanges = useMemo(() => {
    if (mode !== "edit" || !initialData) {
      return true
    }

    const nameChanged = (currentName || "").trim() !== initialData.name
    const descriptionChanged = (currentDescription || "").trim() !== ""
    const typeChanged = selectedType !== mapGroupType(initialData.type)
    const membersChanged = membersToAdd.length > 0 || membersToRemove.length > 0

    return nameChanged || descriptionChanged || typeChanged || membersChanged
  }, [
    currentDescription,
    currentName,
    initialData,
    membersToAdd.length,
    membersToRemove.length,
    mode,
    selectedType,
  ])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] sm:max-w-[900px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Tạo nhóm mới" : "Chỉnh sửa thông tin nhóm"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Khởi tạo nhóm mới và mời bạn bè cùng tham gia."
              : "Cập nhật thông tin nhóm và đồng bộ với các thành viên."}
          </DialogDescription>
        </DialogHeader>

        <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>
          <div className="flex-1">
            {step === 1 && (
              <Tabs defaultValue="general" className="space-y-4">
                <TabsList className="bg-card">
                  <TabsTrigger value="general">Thông tin chung</TabsTrigger>
                  <TabsTrigger value="members">Thành viên</TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="name">Tên nhóm</Label>
                    <Input
                      id="name"
                      placeholder="Ví dụ: Chuyến đi Đà Lạt, Tiền phòng trọ..."
                      {...register("name")}
                    />
                    {errors.name && (
                      <p className="text-xs text-destructive">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Mô tả</Label>
                    <Input
                      id="description"
                      placeholder="Mô tả ngắn gọn về nhóm (không bắt buộc)"
                      {...register("description")}
                    />
                    {errors.description && (
                      <p className="text-xs text-destructive">
                        {errors.description.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Phân loại nhóm</Label>
                    <Select
                      value={selectedType}
                      onValueChange={(value) =>
                        setValue("type", value as GroupTypeEnum, {
                          shouldDirty: true,
                          shouldTouch: true,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn loại nhóm" />
                      </SelectTrigger>
                      <SelectContent>
                        {groupTypeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center gap-2">
                              <span
                                className={cn(
                                  "h-2.5 w-2.5 rounded-full",
                                  option.dotClass
                                )}
                              />
                              <Badge className={option.badgeClass}>
                                {option.label}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>

                <TabsContent value="members" className="space-y-5">
                  {mode !== "edit" || !initialData ? (
                    <div className="rounded-3xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                      Vui lòng lưu nhóm trước khi quản lý thành viên.
                    </div>
                  ) : (
                    <div className="max-h-[55vh] space-y-6 overflow-y-auto pr-2 pb-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-foreground">
                            Thành viên hiện tại
                          </p>
                          <Badge variant="outline">
                            {activeMembers.length + addedMembers.length} thành viên
                          </Badge>
                        </div>
                        <div className="grid gap-3 lg:grid-cols-2">
                          {activeMembers.map((member) => (
                            <div
                              key={member.userId}
                              className="flex items-center gap-3"
                            >
                              <div className="flex-1">
                                <MemberListItem
                                  userId={member.userId}
                                  role={member.role}
                                  action={
                                    member.role !== "Leader" ? (
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                        onClick={() =>
                                          toggleMemberToRemove(member.userId)
                                        }
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    ) : undefined
                                  }
                                />
                              </div>
                            </div>
                          ))}
                          {addedMembers.map((member) => (
                            <div
                              key={member.id}
                              className="flex items-center gap-3 rounded-2xl border border-border/60 p-3"
                            >
                              <Avatar>
                                <AvatarImage
                                  src={member.avatar}
                                  alt={member.fullName}
                                />
                                <AvatarFallback>
                                  {member.fullName.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold text-foreground">
                                  {member.fullName}
                                </p>
                                <p className="truncate text-xs text-muted-foreground">
                                  {member.email || "Chưa có email"}
                                </p>
                              </div>
                              <Button
                                type="button"
                                size="xs"
                                variant="secondary"
                                onClick={() => undoAddUser(Number(member.id))}
                              >
                                Hoàn tác
                              </Button>
                            </div>
                          ))}
                          {activeMembers.length === 0 &&
                            addedMembers.length === 0 && (
                              <div className="rounded-2xl border border-dashed border-border p-4 text-sm text-muted-foreground">
                                Chưa có thành viên nào.
                              </div>
                            )}
                        </div>
                        {removedMembers.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-xs font-semibold text-muted-foreground">
                              Danh sách chờ xóa
                            </p>
                            <div className="grid gap-3 lg:grid-cols-2">
                              {removedMembers.map((member) => (
                                <div
                                  key={member.userId}
                                  className="flex items-center gap-3 opacity-70"
                                >
                                  <div className="flex-1">
                                    <MemberListItem
                                      userId={member.userId}
                                      role={member.role}
                                    />
                                  </div>
                                  {member.role !== "Leader" && (
                                    <Button
                                      type="button"
                                      size="xs"
                                      variant="secondary"
                                      onClick={() =>
                                        toggleMemberToRemove(member.userId)
                                      }
                                    >
                                      Hoàn tác
                                    </Button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="space-y-4 rounded-3xl border border-border bg-muted/20 p-4">
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-foreground">
                            Tìm kiếm &amp; thêm
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Tìm thành viên mới để thêm vào nhóm.
                          </p>
                        </div>

                        <div className="relative">
                          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            value={searchKey}
                            onChange={(event) => {
                              setSearchKey(event.target.value)
                              setSearchPageIndex(1)
                            }}
                            placeholder="Tìm kiếm người dùng theo tên hoặc email"
                            className="pl-9"
                          />
                        </div>

                        <div className="space-y-3">
                          {searchKey.trim().length === 0 && (
                            <p className="text-xs text-muted-foreground">
                              Nhập tên hoặc email để tìm kiếm người dùng.
                            </p>
                          )}
                          {searchKey.trim().length > 0 &&
                            searchResults.map((user) => (
                              <div
                                key={user.id}
                                className="flex items-center gap-3 rounded-2xl border border-border/60 p-3"
                              >
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-sm font-semibold text-foreground">
                                    {user.fullName}
                                  </p>
                                  <p className="truncate text-xs text-muted-foreground">
                                    {user.email || "Chưa có email"}
                                  </p>
                                </div>
                                {membersToAddSet.has(Number(user.id)) ? (
                                  <Button
                                    type="button"
                                    size="xs"
                                    variant="secondary"
                                    onClick={() => undoAddUser(Number(user.id))}
                                  >
                                    Hoàn tác
                                  </Button>
                                ) : (
                                  <Button
                                    type="button"
                                    size="xs"
                                    variant="outline"
                                    onClick={() => addUserToMembers(user)}
                                  >
                                    Thêm
                                  </Button>
                                )}
                              </div>
                            ))}
                          {searchKey.trim().length > 0 &&
                            !searchUsers.isFetching &&
                            searchResults.length === 0 && (
                              <p className="text-xs text-muted-foreground">
                                Không tìm thấy kết quả phù hợp.
                              </p>
                            )}
                        </div>

                        {searchKey.trim().length > 0 && (
                          <div className="flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
                            <span>
                              Trang {searchPageIndex} /{" "}
                              {searchUsers.data?.data?.totalPages || 1}
                            </span>
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="xs"
                                disabled={searchPageIndex <= 1}
                                onClick={() =>
                                  setSearchPageIndex((prev) =>
                                    Math.max(1, prev - 1)
                                  )
                                }
                              >
                                Trước
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="xs"
                                disabled={
                                  searchPageIndex >=
                                  (searchUsers.data?.data?.totalPages || 1)
                                }
                                onClick={() =>
                                  setSearchPageIndex((prev) => prev + 1)
                                }
                              >
                                Sau
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            )}

            {step === 2 && (
              <div className="space-y-4 rounded-3xl border border-border bg-muted/30 p-4">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">
                    {mode === "create" ? "Xác nhận thông tin" : "Kiểm tra thay đổi"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Kiểm tra lại toàn bộ chi tiết trước khi lưu.
                  </p>
                </div>

                {mode === "create" && (
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Tên nhóm</p>
                      <p className="font-medium text-foreground">
                        {currentName?.trim() || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Mô tả
                      </p>
                      <p className="font-medium text-foreground">
                        {currentDescription?.trim() || "Chưa có mô tả"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Phân loại</p>
                      <div className="mt-1 flex items-center gap-2">
                        <span
                          className={cn(
                            "h-2.5 w-2.5 rounded-full",
                            typeOption?.dotClass
                          )}
                        />
                        <Badge className={typeOption?.badgeClass}>
                          {typeOption?.label || "Thông thường"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}

                {mode === "edit" && (
                  <div className="space-y-4 text-sm">
                    <div className="space-y-3">
                      {reviewRows.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          Không có thay đổi nào.
                        </p>
                      ) : (
                        reviewRows.map((row) => (
                          <div key={row.label} className="space-y-1">
                            <p className="text-xs text-muted-foreground">
                              {row.label}
                            </p>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-sm text-red-500 line-through">
                                {row.oldValue || "-"}
                              </span>
                              <ArrowRight className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm font-semibold text-emerald-600">
                                {row.newValue || "-"}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="space-y-2 rounded-3xl border border-border bg-muted/20 p-4">
                      <p className="text-xs font-semibold text-muted-foreground">
                        Thay đổi thành viên
                      </p>
                      {membersToAdd.length === 0 &&
                      membersToRemove.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          Không có thay đổi thành viên nào.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {membersToAdd.map((userId) => (
                            <div
                              key={`add-${userId}`}
                              className="flex items-center gap-2 text-sm text-emerald-600"
                            >
                              <Plus className="h-4 w-4" />
                              <ReviewMemberName
                                userId={userId}
                                className="font-semibold"
                              />
                            </div>
                          ))}
                          {membersToRemove.map((userId) => (
                            <div
                              key={`remove-${userId}`}
                              className="flex items-center gap-2 text-sm text-red-500"
                            >
                              <Minus className="h-4 w-4" />
                              <ReviewMemberName
                                userId={userId}
                                className="line-through"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            {step === 2 ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(1)}
              >
                Quay lại
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Hủy
              </Button>
            )}
            <div className="flex flex-col items-end gap-1">
              <Button
                type="submit"
                disabled={isPending || (mode === "edit" && !hasChanges)}
                className="gap-2"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Đang lưu...
                  </>
                ) : step === 1 ? (
                  mode === "create" ? (
                    "Tiếp tục kiểm tra"
                  ) : (
                    "Xem thay đổi"
                  )
                ) : mode === "create" ? (
                  "Xác nhận tạo nhóm"
                ) : (
                  "Lưu thay đổi"
                )}
              </Button>
              {mode === "edit" && !hasChanges && (
                <span className="text-xs text-muted-foreground">
                  Chưa có thay đổi nào để cập nhật.
                </span>
              )}
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
