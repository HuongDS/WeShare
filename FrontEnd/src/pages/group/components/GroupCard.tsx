import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { MoreHorizontal, Pencil, Trash2, Loader2, ArrowRight } from "lucide-react"
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
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useDeleteGroup } from "@/hooks/group/useGroup"
import { useAppSelector } from "@/store/hooks"
import type { GroupViewDto } from "@/types/group/GroupViewDto"
import { cn } from "@/lib/utils"

interface GroupCardProps {
  group: GroupViewDto
  onEdit: (group: GroupViewDto) => void
}

export default function GroupCard({ group, onEdit }: GroupCardProps) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const navigate = useNavigate()
  const { deleteGroup } = useDeleteGroup()
  const currentUserId = Number(useAppSelector((state) => state.auth.user?.userId))
  const isAdmin = group.members?.some(
    (member) => member.userId === currentUserId && member.role === "Leader"
  )

  const members = group.members || []
  const memberCount = members.length
  const previewMembers = members.slice(0, 4)
  const extraCount = Math.max(0, memberCount - 4)

  const handleDelete = () => {
    deleteGroup.mutate(group.id, {
      onSuccess: () => setIsConfirmOpen(false),
    })
  }

  const getBadgeStyle = (type: string) => {
    switch (type?.toLowerCase()) {
      case "club":
        return "bg-linen-mist text-forest-ink dark:bg-emerald-950/50 dark:text-lime-voltage"
      case "travel":
        return "bg-blue-100 text-signal-blue dark:bg-blue-950/50 dark:text-blue-300"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <div
      onClick={() => navigate(`/groups/${group.id}`)}
      className="group relative flex flex-col justify-between rounded-3xl border border-border/80 bg-card p-6 shadow-xs hover:shadow-xl hover:border-forest-ink/40 dark:hover:border-lime-voltage/40 transition-all duration-300 cursor-pointer"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          navigate(`/groups/${group.id}`)
        }
      }}
    >
      <div>
        {/* Top Header: Badge + More actions */}
        <div className="flex items-center justify-between gap-2">
          <Badge
            className={cn(
              "rounded-full px-3 py-1 text-xs font-bold tracking-tight shadow-none",
              getBadgeStyle(group.type)
            )}
          >
            {group.type === "None" ? "General Group" : group.type}
          </Badge>

          {isAdmin && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full hover:bg-muted text-muted-foreground"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-36 rounded-2xl p-1.5 shadow-lg">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    onEdit(group)
                  }}
                  className="rounded-xl text-xs gap-2 py-2 cursor-pointer"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit Group
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsConfirmOpen(true)
                  }}
                  className="rounded-xl text-xs gap-2 py-2 text-destructive focus:text-destructive cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Group Title & Description */}
        <div className="mt-4 space-y-1.5">
          <h3 className="text-xl font-black tracking-tight text-foreground group-hover:text-forest-ink dark:group-hover:text-lime-voltage transition-colors truncate">
            {group.name}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {group.description || "Smart expense sharing and task coordination hub."}
          </p>
        </div>
      </div>

      {/* Bottom Section: Members Stack & Explore Action */}
      <div className="mt-6 pt-4 border-t border-border/60 flex items-center justify-between">
        {/* Member Avatar Stack */}
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2.5 overflow-hidden">
            {previewMembers.map((m, idx) => (
              <Avatar key={idx} className="h-7 w-7 border-2 border-background ring-1 ring-border/40">
                <AvatarFallback className="bg-forest-ink text-lime-voltage text-[10px] font-bold">
                  {`U${m.userId}`}
                </AvatarFallback>
              </Avatar>
            ))}
            {extraCount > 0 && (
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground border-2 border-background ring-1 ring-border/40">
                +{extraCount}
              </div>
            )}
          </div>
          <span className="text-xs font-semibold text-muted-foreground ml-1">
            {memberCount} member{memberCount === 1 ? "" : "s"}
          </span>
        </div>

        {/* Explore Pill Button */}
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-foreground group-hover:bg-forest-ink group-hover:text-lime-voltage dark:group-hover:bg-lime-voltage dark:group-hover:text-forest-ink transition-all">
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent className="rounded-3xl p-6">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold">Delete this group?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              This action cannot be undone. All expense logs and task records in this group will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 mt-4">
            <AlertDialogCancel disabled={deleteGroup.isPending} className="rounded-full text-xs">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteGroup.isPending}
              className="rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 text-xs font-bold"
            >
              {deleteGroup.isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                  Deleting...
                </>
              ) : (
                "Delete Group"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
