import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { MoreHorizontal, Pencil, Trash2, Users, Loader2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useDeleteGroup } from "@/hooks/group/useGroup"
import { useAppSelector } from "@/store/hooks"
import type { GroupViewDto } from "@/types/group/GroupViewDto"

interface GroupCardProps {
  group: GroupViewDto
  onEdit: (group: GroupViewDto) => void
}

const formatGroupDescription = (group: GroupViewDto) => {
  const label = group.type === "None" ? "General group" : group.type
  const members = group.members?.length || 0
  return `${label} · ${members} member${members === 1 ? "" : "s"}`
}

const groupTypeBorder = {
  None: "border-t-slate-300",
  Club: "border-t-emerald-400",
  Travel: "border-t-blue-400",
} as const

const groupTypeRibbon = {
  None: "bg-slate-500",
  Club: "bg-emerald-500",
  Travel: "bg-blue-500",
} as const

export default function GroupCard({ group, onEdit }: GroupCardProps) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const navigate = useNavigate()
  const { deleteGroup } = useDeleteGroup()
  const currentUserId = Number(
    useAppSelector((state) => state.auth.user?.userId)
  )
  const isAdmin = group.members?.some(
    (member) => member.userId === currentUserId && member.role === "Leader"
  )

  const handleDelete = () => {
    deleteGroup.mutate(group.id, {
      onSuccess: () => setIsConfirmOpen(false),
    })
  }

  const cardContent = (
    <Card
      className={`relative cursor-pointer overflow-hidden border border-t-4 border-border/70 transition-all hover:-translate-y-0.5 hover:shadow-lg ${groupTypeBorder[group.type] || "border-t-slate-300"}`}
      onClick={() => navigate(`/groups/${group.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          navigate(`/groups/${group.id}`)
        }
      }}
    >
      <div
        className={`pointer-events-none absolute top-6 -right-12 w-40 rotate-45 py-1 text-center text-xs font-bold text-white shadow-sm ${groupTypeRibbon[group.type] || "bg-slate-500"}`}
      >
        {group.type === "None" ? "General" : group.type}
      </div>
      <CardHeader className="gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle className="text-lg font-semibold text-foreground">
            {group.name}
          </CardTitle>
        </div>
        <CardDescription>{formatGroupDescription(group)}</CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          {group.members?.length || 0} members
        </div>
        {isAdmin && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={(event) => event.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(event) => {
                  event.stopPropagation()
                  onEdit(group)
                }}
              >
                <Pencil className="h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={(event) => {
                  event.stopPropagation()
                  setIsConfirmOpen(true)
                }}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </CardContent>

      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this group?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone and will remove the group
              permanently.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteGroup.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteGroup.isPending}
              className="gap-2"
            >
              {deleteGroup.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Deleting
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )

  if (!isAdmin) {
    return cardContent
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{cardContent}</ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onSelect={() => onEdit(group)}>
          <Pencil className="h-4 w-4" />
          Edit
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem
          onSelect={() => setIsConfirmOpen(true)}
          className="text-destructive"
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}
