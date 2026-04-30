import { useMemo, useState } from "react"
import { Minus, Plus, Search, UserPlus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useSearchUsers } from "@/hooks/user/useUser"
import { useAddGroupMembers } from "@/hooks/group/useGroup"
import { useAppSelector } from "@/store/hooks"
import { useQueryClient } from "@tanstack/react-query"
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
import type { UserViewDto } from "@/types/user/UserViewDto"

interface AddMemberModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  groupId: number
  existingMemberIds: number[]
}

export default function AddMemberModal({
  open,
  onOpenChange,
  groupId,
  existingMemberIds,
}: AddMemberModalProps) {
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState("")
  const [stagedUsers, setStagedUsers] = useState<UserViewDto[]>([])
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const currentUserId = Number(
    useAppSelector((state) => state.auth.user?.userId)
  )
  const { addMembers } = useAddGroupMembers()

  const { searchUsers } = useSearchUsers(searchQuery, 10, 1)

  const existingMembersSet = useMemo(
    () => new Set(existingMemberIds),
    [existingMemberIds]
  )

  const stagedIdsSet = useMemo(
    () =>
      new Set(
        stagedUsers
          .map((user) => Number(user.id))
          .filter((id) => !Number.isNaN(id))
      ),
    [stagedUsers]
  )

  const searchResults = useMemo(() => {
    const users = searchUsers.data?.data?.items || []
    return users.filter((user) => {
      const id = Number(user.id)
      return (
        !Number.isNaN(id) &&
        !existingMembersSet.has(id) &&
        !stagedIdsSet.has(id)
      )
    })
  }, [existingMembersSet, searchUsers.data, stagedIdsSet])

  const addToStage = (user: UserViewDto) => {
    setStagedUsers((prev) => {
      const exists = prev.some((item) => item.id === user.id)
      return exists ? prev : [...prev, user]
    })
  }

  const removeFromStage = (userId: string) => {
    setStagedUsers((prev) => prev.filter((user) => user.id !== userId))
  }

  const handleConfirmAdd = async () => {
    if (!groupId || Number.isNaN(currentUserId) || stagedUsers.length === 0) {
      return
    }

    const memberIds = stagedUsers
      .map((user) => Number(user.id))
      .filter((id) => !Number.isNaN(id))

    try {
      await addMembers.mutateAsync({
        groupId,
        memberIds,
        userId: currentUserId,
      })

      await queryClient.invalidateQueries({
        queryKey: ["groupMembers", groupId],
      })
      await queryClient.invalidateQueries({ queryKey: ["group", groupId] })
      setIsConfirmOpen(false)
      onOpenChange(false)
      setSearchQuery("")
      setStagedUsers([])
    } catch {
      // Errors are handled by hook-level handlers.
    }
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setSearchQuery("")
      setStagedUsers([])
      setIsConfirmOpen(false)
    }
    onOpenChange(nextOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Add Member</DialogTitle>
          <DialogDescription>
            Search users, stage selections, then confirm bulk addition.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="pl-9"
                placeholder="Search by name or email"
              />
            </div>

            <div className="rounded-lg border border-border/60 p-3">
              <p className="mb-2 text-xs font-semibold text-muted-foreground uppercase">
                Search Results
              </p>
              {!searchQuery.trim() ? (
                <p className="text-sm text-muted-foreground">
                  Enter a keyword to find users.
                </p>
              ) : searchUsers.isFetching ? (
                <p className="text-sm text-muted-foreground">
                  Searching users...
                </p>
              ) : searchResults.length === 0 ? (
                <p className="text-sm text-muted-foreground">No users found.</p>
              ) : (
                <div className="max-h-80 space-y-2 overflow-y-auto">
                  {searchResults.map((user) => {
                    const fullName = user.fullName || "Unknown user"
                    const initials = fullName
                      .split(" ")
                      .map((part) => part[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()

                    return (
                      <div
                        key={user.id}
                        className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <Avatar size="sm">
                            <AvatarImage src={user.avatar} alt={fullName} />
                            <AvatarFallback>{initials}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-foreground">
                              {fullName}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              {user.email || "No email"}
                            </p>
                          </div>
                        </div>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => addToStage(user)}
                          disabled={addMembers.isPending}
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div className="rounded-lg border border-border/60 p-3">
              <p className="mb-2 text-xs font-semibold text-muted-foreground uppercase">
                Staged for Addition ({stagedUsers.length})
              </p>

              {stagedUsers.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No users staged yet.
                </p>
              ) : (
                <div className="max-h-80 space-y-2 overflow-y-auto">
                  {stagedUsers.map((user) => {
                    const fullName = user.fullName || "Unknown user"
                    const initials = fullName
                      .split(" ")
                      .map((part) => part[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()

                    return (
                      <div
                        key={`staged-${user.id}`}
                        className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <Avatar size="sm">
                            <AvatarImage src={user.avatar} alt={fullName} />
                            <AvatarFallback>{initials}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-foreground">
                              {fullName}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              {user.email || "No email"}
                            </p>
                          </div>
                        </div>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeFromStage(user.id)}
                          disabled={addMembers.isPending}
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <Button
              className="w-full gap-2"
              disabled={stagedUsers.length === 0 || addMembers.isPending}
              onClick={() => setIsConfirmOpen(true)}
            >
              <UserPlus className="h-4 w-4" />
              Review & Add ({stagedUsers.length})
            </Button>
          </div>
        </div>

        <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Addition</AlertDialogTitle>
              <AlertDialogDescription>
                You are about to add {stagedUsers.length} users to the group.
                Proceed?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={addMembers.isPending}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmAdd}
                disabled={addMembers.isPending || stagedUsers.length === 0}
              >
                {addMembers.isPending ? "Adding..." : "Confirm"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DialogContent>
    </Dialog>
  )
}
