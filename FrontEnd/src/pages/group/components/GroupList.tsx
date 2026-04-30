import { FolderOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { GroupViewDto } from "@/types/group/GroupViewDto"
import GroupCard from "./GroupCard"

interface GroupListProps {
  groups: GroupViewDto[]
  isLoading: boolean
  onEdit: (group: GroupViewDto) => void
  onCreate: () => void
}

const skeletonItems = Array.from({ length: 6 }, (_, index) => index)

export default function GroupList({
  groups,
  isLoading,
  onEdit,
  onCreate,
}: GroupListProps) {
  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {skeletonItems.map((item) => (
          <Card key={item} className="space-y-4 border border-border/60 p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="h-5 w-2/3 animate-pulse rounded-full bg-muted" />
              <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-full animate-pulse rounded-full bg-muted" />
              <div className="h-4 w-4/5 animate-pulse rounded-full bg-muted" />
            </div>
            <div className="h-4 w-1/3 animate-pulse rounded-full bg-muted" />
          </Card>
        ))}
      </div>
    )
  }

  if (!groups.length) {
    return (
      <Card className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
        <div className="rounded-full bg-muted p-4">
          <FolderOpen className="h-6 w-6 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-foreground">
            No groups yet
          </h3>
          <p className="text-sm text-muted-foreground">
            Create your first group to start collaborating.
          </p>
        </div>
        <Button size="sm" className="mt-2" onClick={onCreate}>
          Create your first group
        </Button>
      </Card>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {groups.map((group) => (
        <GroupCard key={group.id} group={group} onEdit={onEdit} />
      ))}
    </div>
  )
}
