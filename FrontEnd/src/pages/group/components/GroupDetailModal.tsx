import { Users } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import type { GroupViewDto } from "@/types/group/GroupViewDto"
import MemberListItem from "./MemberListItem"

interface GroupDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  group: GroupViewDto | null
}

const typeBadgeClass = {
  None: "bg-slate-100 text-slate-700",
  Club: "bg-emerald-100 text-emerald-700",
  Travel: "bg-blue-100 text-blue-700",
} as const

export default function GroupDetailModal({
  open,
  onOpenChange,
  group,
}: GroupDetailModalProps) {
  if (!group) {
    return null
  }

  const memberCount = group.members?.length || 0
  const description = (group as GroupViewDto & { description: string })
    .description

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <div className="flex flex-wrap items-center gap-3">
            <DialogTitle className="text-xl">{group.name}</DialogTitle>
            <Badge className={typeBadgeClass[group.type]}>
              {group.type === "None" ? "General" : group.type}
            </Badge>
          </div>
          <DialogDescription className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            {memberCount} member{memberCount === 1 ? "" : "s"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="rounded-3xl border border-border bg-muted/20 p-4">
            <p className="text-xs text-muted-foreground">Description</p>
            <p className="mt-1 text-sm text-foreground">
              {description?.trim() ? description : "No description provided"}
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold text-foreground">Members</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {group.members?.map((member) => (
                <MemberListItem
                  key={member.userId}
                  userId={member.userId}
                  role={member.role}
                />
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
