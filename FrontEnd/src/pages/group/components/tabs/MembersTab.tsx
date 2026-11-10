import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { MoreHorizontal, Search, UserPlus, Share2, Crown, LogOut, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  useGetGroupMembers,
  useRemoveGroupMembers,
} from "@/hooks/group/useGroup"
import { useAppSelector } from "@/store/hooks"
import type { GroupViewDto } from "@/types/group/GroupViewDto"
import AddMemberModal from "@/pages/group/components/AddMemberModal"
import GroupInviteModal from "@/pages/group/components/GroupInviteModal"
import PageLoader from "@/components/PageLoader"
import { useQueryClient } from "@tanstack/react-query"
import { groupApi } from "@/api/groupApi"
import { toast } from "sonner"

interface MembersTabProps {
  group: GroupViewDto
}

export default function MembersTab({ group }: MembersTabProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<"ALL" | "Leader" | "Member">(
    "ALL"
  )
  const [sortBy, setSortBy] = useState<"name" | "email">("name")
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false)
  const [isBulkRemoveConfirmOpen, setIsBulkRemoveConfirmOpen] = useState(false)
  const [selectedMemberIds, setSelectedMemberIds] = useState<Set<string>>(
    new Set()
  )
  const [viewMode, setViewMode] = useState<"card" | "table">("card")

  const navigate = useNavigate()
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [transferTargetMember, setTransferTargetMember] = useState<{ userId: number; fullName: string } | null>(null)
  const [isTransferConfirmOpen, setIsTransferConfirmOpen] = useState(false)
  const [isTransferring, setIsTransferring] = useState(false)
  const [removeTargetMember, setRemoveTargetMember] = useState<{ userId: number; fullName: string } | null>(null)
  const [isRemoveSingleConfirmOpen, setIsRemoveSingleConfirmOpen] = useState(false)
  const [isLeaveConfirmOpen, setIsLeaveConfirmOpen] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)

  const queryClient = useQueryClient()
  const currentUserId = Number(
    useAppSelector((state) => state.auth.user?.userId)
  )
  const { removeMembers } = useRemoveGroupMembers()
  const isLeader = group.members?.some(
    (member) => member.userId === currentUserId && member.role === "Leader"
  )

  const currentMemberInfo = useMemo(() => {
    return group.members?.find((m) => m.userId === currentUserId)
  }, [group.members, currentUserId])

  const handleTransferLeader = async () => {
    if (!transferTargetMember) return
    setIsTransferring(true)
    try {
      await groupApi.transferLeader(group.id, transferTargetMember.userId)
      toast.success(`Đã chuyển quyền Trưởng nhóm cho ${transferTargetMember.fullName}!`)
      setIsTransferConfirmOpen(false)
      setTransferTargetMember(null)
      await queryClient.invalidateQueries({ queryKey: ["group", group.id] })
      await queryClient.invalidateQueries({ queryKey: ["groupMembers", group.id] })
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || "Không thể chuyển quyền Trưởng nhóm.")
    } finally {
      setIsTransferring(false)
    }
  }

  const handleLeaveGroup = async () => {
    if (currentMemberInfo && Math.abs(currentMemberInfo.balance) > 0.001) {
      toast.error(`Bạn còn số dư công nợ (${currentMemberInfo.balance.toLocaleString()} đ). Vui lòng thanh toán hết nợ trước khi rời nhóm.`)
      return
    }

    setIsLeaving(true)
    try {
      await groupApi.leaveGroup(group.id)
      toast.success("Bạn đã rời nhóm thành công.")
      setIsLeaveConfirmOpen(false)
      await queryClient.invalidateQueries({ queryKey: ["groups"] })
      navigate("/groups")
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || "Không thể rời nhóm.")
    } finally {
      setIsLeaving(false)
    }
  }

  const handleRemoveSingle = async () => {
    if (!removeTargetMember) return
    try {
      await removeMembers.mutateAsync({
        groupId: group.id,
        memberIds: [removeTargetMember.userId],
        userId: currentUserId,
      })
      toast.success(`Đã xóa ${removeTargetMember.fullName} khỏi nhóm.`)
      setIsRemoveSingleConfirmOpen(false)
      setRemoveTargetMember(null)
      await queryClient.invalidateQueries({ queryKey: ["groupMembers", group.id] })
      await queryClient.invalidateQueries({ queryKey: ["group", group.id] })
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || "Không thể xóa thành viên.")
    }
  }

  const { members: groupMemberProfiles } = useGetGroupMembers(group.id)

  const memberRoleMap = useMemo(() => {
    return new Map(group.members.map((member) => [member.userId, member.role]))
  }, [group.members])

  const membersWithProfile = useMemo(() => {
    const rawProfiles = groupMemberProfiles.data?.data || []

    return rawProfiles
      .map((profile) => {
        const userId = Number(profile.id)
        if (Number.isNaN(userId)) {
          return null
        }

        return {
          userId,
          fullName: profile.fullName || `User #${userId}`,
          email: profile.email || "",
          avatar: profile.avatar || "",
          role: memberRoleMap.get(userId) || "Member",
        }
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
  }, [groupMemberProfiles.data, memberRoleMap])

  const filteredMembers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    const filtered = membersWithProfile.filter((member) => {
      const matchesQuery =
        !query ||
        member.fullName.toLowerCase().includes(query) ||
        member.email.toLowerCase().includes(query)

      const matchesRole = roleFilter === "ALL" || member.role === roleFilter

      return matchesQuery && matchesRole
    })

    const sorted = [...filtered]
    if (sortBy === "email") {
      sorted.sort((a, b) => (a.email || "").localeCompare(b.email || ""))
      return sorted
    }

    sorted.sort((a, b) => a.fullName.localeCompare(b.fullName))
    return sorted
  }, [membersWithProfile, roleFilter, searchQuery, sortBy])

  const selectableMemberIds = useMemo(() => {
    return filteredMembers
      .filter((member) => member.userId !== currentUserId)
      .map((member) => String(member.userId))
  }, [filteredMembers, currentUserId])

  const isAllSelected =
    selectableMemberIds.length > 0 &&
    selectableMemberIds.every((id) => selectedMemberIds.has(id))

  const selectedMembers = useMemo(() => {
    return filteredMembers.filter((member) =>
      selectedMemberIds.has(String(member.userId))
    )
  }, [filteredMembers, selectedMemberIds])

  const toggleSelectedMember = (userId: number) => {
    if (userId === currentUserId) {
      return
    }

    const id = String(userId)
    setSelectedMemberIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const toggleSelectAll = () => {
    setSelectedMemberIds((prev) => {
      const next = new Set(prev)

      if (isAllSelected) {
        selectableMemberIds.forEach((id) => next.delete(id))
      } else {
        selectableMemberIds.forEach((id) => next.add(id))
      }

      return next
    })
  }

  const handleBulkRemove = async () => {
    if (!isLeader || selectedMemberIds.size === 0) {
      return
    }

    const memberIds = Array.from(selectedMemberIds)
      .map((id) => Number(id))
      .filter((id) => !Number.isNaN(id) && id !== currentUserId)

    if (memberIds.length === 0 || Number.isNaN(currentUserId)) {
      return
    }

    try {
      await removeMembers.mutateAsync({
        groupId: group.id,
        memberIds,
        userId: currentUserId,
      })
      setSelectedMemberIds(new Set())
      setIsBulkRemoveConfirmOpen(false)
      await queryClient.invalidateQueries({
        queryKey: ["groupMembers", group.id],
      })
      await queryClient.invalidateQueries({ queryKey: ["group", group.id] })
    } catch {
      // Errors are handled by hook-level handlers.
    }
  }

  return (
    <>
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search by name or email"
              className="pl-9"
            />
          </div>

          <Select
            value={roleFilter}
            onValueChange={(value) =>
              setRoleFilter(value as "ALL" | "Leader" | "Member")
            }
          >
            <SelectTrigger className="sm:w-44">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Roles</SelectItem>
              <SelectItem value="Leader">Leader</SelectItem>
              <SelectItem value="Member">Member</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={sortBy}
            onValueChange={(value) => setSortBy(value as "name" | "email")}
          >
            <SelectTrigger className="sm:w-40">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="email">Email</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={viewMode}
            onValueChange={(value) => setViewMode(value as "card" | "table")}
          >
            <SelectTrigger className="sm:w-40">
              <SelectValue placeholder="View" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="card">Card</SelectItem>
              <SelectItem value="table">Table</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setIsInviteModalOpen(true)}
            className="rounded-full border-border/80 text-xs font-semibold px-4 h-9 gap-1.5"
          >
            <Share2 className="h-3.5 w-3.5 text-lime-voltage dark:text-lime-voltage" />
            <span>Mời Link / QR</span>
          </Button>

          {isLeader && (
            <>
              <Button
                variant="outline"
                onClick={toggleSelectAll}
                className="rounded-full text-xs font-semibold px-3 h-9"
              >
                {isAllSelected ? "Bỏ chọn" : "Chọn tất cả"}
              </Button>
              {selectedMemberIds.size > 0 && (
                <Button
                  variant="destructive"
                  onClick={() => setIsBulkRemoveConfirmOpen(true)}
                  disabled={removeMembers.isPending}
                  className="rounded-full text-xs font-semibold px-3 h-9"
                >
                  Xóa {selectedMemberIds.size} đã chọn
                </Button>
              )}
              <Button
                className="rounded-full bg-lime-voltage hover:bg-lime-voltage/90 text-forest-ink font-bold text-xs px-4 h-9 gap-1.5 shadow-xs"
                onClick={() => setIsAddMemberModalOpen(true)}
              >
                <UserPlus className="h-3.5 w-3.5 stroke-[2.5]" />
                <span>Thêm thành viên</span>
              </Button>
            </>
          )}

          <Button
            variant="ghost"
            onClick={() => setIsLeaveConfirmOpen(true)}
            className="rounded-full text-destructive hover:bg-destructive/10 text-xs font-semibold px-3.5 h-9 gap-1.5"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Rời nhóm</span>
          </Button>
        </div>
      </div>

      {groupMemberProfiles.isPending || groupMemberProfiles.isFetching ? (
        <Card>
          <CardContent className="pt-6">
            <PageLoader />
          </CardContent>
        </Card>
      ) : filteredMembers.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-sm text-muted-foreground">
            No members found.
          </CardContent>
        </Card>
      ) : (
        <>
          {viewMode === "card" ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredMembers.map((member) => {
                const initials = member.fullName
                  .split(" ")
                  .map((part) => part[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()
                const isMe = member.userId === currentUserId

                return (
                  <Card key={`members-card-${member.userId}`} className="p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        {isLeader && !isMe && (
                          <Checkbox
                            checked={selectedMemberIds.has(
                              String(member.userId)
                            )}
                            onCheckedChange={() =>
                              toggleSelectedMember(member.userId)
                            }
                          />
                        )}
                        <Avatar>
                          <AvatarImage
                            src={member.avatar}
                            alt={member.fullName}
                          />
                          <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-foreground">
                            {member.fullName}
                          </p>
                          <p className="truncate text-sm text-muted-foreground">
                            {member.email || "No email"}
                          </p>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        <Badge
                          variant={
                            member.role === "Leader" ? "default" : "secondary"
                          }
                        >
                          {member.role}
                        </Badge>

                        {isLeader && !isMe && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon-sm" className="rounded-full">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-2xl p-1.5 shadow-xl">
                              <DropdownMenuItem
                                onClick={() => {
                                  setTransferTargetMember({
                                    userId: member.userId,
                                    fullName: member.fullName,
                                  })
                                  setIsTransferConfirmOpen(true)
                                }}
                                className="rounded-xl text-xs font-semibold gap-2 py-2 cursor-pointer"
                              >
                                <Crown className="h-3.5 w-3.5 text-amber-500" />
                                <span>Chuyển quyền Trưởng nhóm</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() => {
                                  setRemoveTargetMember({
                                    userId: member.userId,
                                    fullName: member.fullName,
                                  })
                                  setIsRemoveSingleConfirmOpen(true)
                                }}
                                className="rounded-xl text-xs font-semibold gap-2 py-2 cursor-pointer"
                              >
                                <span>Xóa khỏi nhóm</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    {isLeader && <TableHead className="w-12">Select</TableHead>}
                    <TableHead>Member</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    {isLeader && (
                      <TableHead className="w-16">Actions</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.map((member) => {
                    const initials = member.fullName
                      .split(" ")
                      .map((part) => part[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()
                    const isMe = member.userId === currentUserId

                    return (
                      <TableRow key={`members-row-${member.userId}`}>
                        {isLeader && (
                          <TableCell>
                            {!isMe && (
                              <Checkbox
                                checked={selectedMemberIds.has(
                                  String(member.userId)
                                )}
                                onCheckedChange={() =>
                                  toggleSelectedMember(member.userId)
                                }
                              />
                            )}
                          </TableCell>
                        )}
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar>
                              <AvatarImage
                                src={member.avatar}
                                alt={member.fullName}
                              />
                              <AvatarFallback>{initials}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">
                              {member.fullName}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{member.email || "No email"}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              member.role === "Leader" ? "default" : "secondary"
                            }
                          >
                            {member.role}
                          </Badge>
                        </TableCell>
                        {isLeader && (
                          <TableCell>
                            {!isMe && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon-sm" className="rounded-full">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="rounded-2xl p-1.5 shadow-xl">
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setTransferTargetMember({
                                        userId: member.userId,
                                        fullName: member.fullName,
                                      })
                                      setIsTransferConfirmOpen(true)
                                    }}
                                    className="rounded-xl text-xs font-semibold gap-2 py-2 cursor-pointer"
                                  >
                                    <Crown className="h-3.5 w-3.5 text-amber-500" />
                                    <span>Chuyển quyền Trưởng nhóm</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    variant="destructive"
                                    onClick={() => {
                                      setRemoveTargetMember({
                                        userId: member.userId,
                                        fullName: member.fullName,
                                      })
                                      setIsRemoveSingleConfirmOpen(true)
                                    }}
                                    className="rounded-xl text-xs font-semibold gap-2 py-2 cursor-pointer"
                                  >
                                    <span>Xóa khỏi nhóm</span>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </TableCell>
                        )}
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </>
      )}

      <AddMemberModal
        open={isAddMemberModalOpen}
        onOpenChange={setIsAddMemberModalOpen}
        groupId={group.id}
        existingMemberIds={group.members.map((member) => member.userId)}
      />

      <AlertDialog
        open={isBulkRemoveConfirmOpen}
        onOpenChange={setIsBulkRemoveConfirmOpen}
      >
        <AlertDialogContent className="rounded-3xl p-6">
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa thành viên?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn đang chọn xóa {selectedMemberIds.size} thành viên:{" "}
              {selectedMembers.map((member) => member.fullName).join(", ") ||
                "Không có thành viên nào"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={removeMembers.isPending} className="rounded-full">
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkRemove}
              disabled={removeMembers.isPending}
              className="rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {removeMembers.isPending ? "Đang xóa..." : "Xác nhận xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Single Remove Confirmation */}
      <AlertDialog
        open={isRemoveSingleConfirmOpen}
        onOpenChange={setIsRemoveSingleConfirmOpen}
      >
        <AlertDialogContent className="rounded-3xl p-6">
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa thành viên khỏi nhóm?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa{" "}
              <strong className="text-foreground">{removeTargetMember?.fullName}</strong>{" "}
              khỏi nhóm? Hành động này yêu cầu thành viên không còn nợ hoặc được nợ.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={removeMembers.isPending} className="rounded-full">
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveSingle}
              disabled={removeMembers.isPending}
              className="rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {removeMembers.isPending ? "Đang xóa..." : "Xóa thành viên"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Transfer Leader Confirmation */}
      <AlertDialog
        open={isTransferConfirmOpen}
        onOpenChange={setIsTransferConfirmOpen}
      >
        <AlertDialogContent className="rounded-3xl p-6">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-amber-500" />
              <span>Chuyển quyền Trưởng nhóm?</span>
            </AlertDialogTitle>
            <AlertDialogDescription>
              Bạn sắp chuyển toàn bộ quyền quản trị nhóm cho{" "}
              <strong className="text-foreground">{transferTargetMember?.fullName}</strong>.
              Sau khi chuyển, vai trò của bạn sẽ trở thành <strong>Thành viên</strong> thông thường.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isTransferring} className="rounded-full">
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleTransferLeader}
              disabled={isTransferring}
              className="rounded-full bg-amber-500 hover:bg-amber-600 text-white font-bold"
            >
              {isTransferring ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                  <span>Đang chuyển...</span>
                </>
              ) : (
                "Xác nhận bàn giao"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Leave Group Confirmation */}
      <AlertDialog
        open={isLeaveConfirmOpen}
        onOpenChange={setIsLeaveConfirmOpen}
      >
        <AlertDialogContent className="rounded-3xl p-6">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive flex items-center gap-2">
              <LogOut className="h-5 w-5" />
              <span>Rời khỏi nhóm?</span>
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              {currentMemberInfo && Math.abs(currentMemberInfo.balance) > 0.001 ? (
                <span className="block text-destructive font-medium">
                  ⚠️ Số dư công nợ hiện tại của bạn là{" "}
                  <strong>{currentMemberInfo.balance.toLocaleString()} đ</strong>.
                  Hệ thống không cho phép rời nhóm khi vẫn còn công nợ chưa quyết toán.
                </span>
              ) : isLeader && (group.members?.length || 0) > 1 ? (
                <span className="block text-amber-600 dark:text-amber-400 font-medium">
                  ⚠️ Bạn đang là Trưởng nhóm. Vui lòng chuyển quyền Trưởng nhóm cho một thành viên khác trước khi rời nhóm.
                </span>
              ) : (
                <span className="block">
                  Bạn có chắc muốn rời nhóm <strong className="text-foreground">{group.name}</strong>? Bạn sẽ không thể truy cập các nội dung của nhóm sau khi rời trừ khi được mời lại.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLeaving} className="rounded-full">
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLeaveGroup}
              disabled={
                isLeaving ||
                (currentMemberInfo ? Math.abs(currentMemberInfo.balance) > 0.001 : false) ||
                (isLeader && (group.members?.length || 0) > 1)
              }
              className="rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLeaving ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                  <span>Đang rời...</span>
                </>
              ) : (
                "Xác nhận rời nhóm"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Group Invite Modal (Link & QR Code) */}
      <GroupInviteModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        groupId={group.id}
        groupName={group.name}
      />
    </>
  )
}
