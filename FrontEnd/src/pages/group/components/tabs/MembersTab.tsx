import { useMemo, useState } from "react"
import { MoreHorizontal, Search, UserPlus } from "lucide-react"
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
import PageLoader from "@/components/PageLoader"
import { useQueryClient } from "@tanstack/react-query"

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

  const queryClient = useQueryClient()
  const currentUserId = Number(
    useAppSelector((state) => state.auth.user?.userId)
  )
  const { removeMembers } = useRemoveGroupMembers()
  const isLeader = group.members?.some(
    (member) => member.userId === currentUserId && member.role === "Leader"
  )

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

        {isLeader && (
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={toggleSelectAll}>
              {isAllSelected ? "Unselect All" : "Select All"}
            </Button>
            {selectedMemberIds.size > 0 && (
              <Button
                variant="destructive"
                onClick={() => setIsBulkRemoveConfirmOpen(true)}
                disabled={removeMembers.isPending}
              >
                Remove {selectedMemberIds.size} Selected
              </Button>
            )}
            <Button
              className="gap-2"
              onClick={() => setIsAddMemberModalOpen(true)}
            >
              <UserPlus className="h-4 w-4" />
              Add Member
            </Button>
          </div>
        )}
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

                        {isLeader && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon-sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>Change Role</DropdownMenuItem>
                              <DropdownMenuItem variant="destructive">
                                Remove
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
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon-sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>Change Role</DropdownMenuItem>
                                <DropdownMenuItem variant="destructive">
                                  Remove
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
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
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Members?</AlertDialogTitle>
            <AlertDialogDescription>
              You are removing {selectedMemberIds.size} member(s):{" "}
              {selectedMembers.map((member) => member.fullName).join(", ") ||
                "No members selected"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={removeMembers.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkRemove}
              disabled={removeMembers.isPending}
              className="text-destructive-foreground bg-destructive"
            >
              {removeMembers.isPending ? "Removing..." : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
