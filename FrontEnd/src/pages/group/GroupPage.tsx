import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useGetGroups } from "@/hooks/group/useGroup"
import type { GroupTypeEnum } from "@/constants/GroupTypeEnum"
import type { GroupViewDto } from "@/types/group/GroupViewDto"
import GroupFormModal from "./components/GroupFormModal"
import GroupList from "./components/GroupList"
import GroupDetailModal from "./components/GroupDetailModal"

const mapFilterToString = (filter: string) => {
  if (filter === "NONE" || filter === "GENERAL") {
    return "none"
  }
  if (filter === "CLUB") {
    return "club"
  }
  if (filter === "TRAVEL") {
    return "travel"
  }
  return ""
}

const mapFilterToNumber = (filter: string) => {
  if (filter === "NONE" || filter === "GENERAL") {
    return 0
  }
  if (filter === "CLUB") {
    return 1
  }
  if (filter === "TRAVEL") {
    return 2
  }
  return -1
}

export default function GroupPage() {
  const [pageIndex, setPageIndex] = useState(0)
  const pageSize = 9

  const { groups } = useGetGroups(pageSize, pageIndex)
  const groupItems = groups.data?.data?.items || []
  const totalPages = groups.data?.data?.totalPages || 0

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<"create" | "edit">("create")
  const [selectedGroup, setSelectedGroup] = useState<GroupViewDto | null>(null)
  const [selectedType, setSelectedType] = useState<"ALL" | GroupTypeEnum>("ALL")
  const [detailGroup, setDetailGroup] = useState<GroupViewDto | null>(null)

  const openCreateForm = () => {
    setFormMode("create")
    setSelectedGroup(null)
    setIsFormOpen(true)
  }

  const openEditForm = (group: GroupViewDto) => {
    setFormMode("edit")
    setSelectedGroup(group)
    setIsFormOpen(true)
  }

  const openDetail = (group: GroupViewDto) => {
    setDetailGroup(group)
  }

  const handleFormOpenChange = (open: boolean) => {
    setIsFormOpen(open)
    if (!open) {
      setSelectedGroup(null)
      setFormMode("create")
    }
  }

  const filteredGroups = groupItems.filter((group) => {
    if (selectedType === "ALL") {
      return true
    }

    if (typeof group.type === "number") {
      return group.type === mapFilterToNumber(selectedType)
    }

    const groupTypeStr = String(group.type).toLowerCase()
    const mappedFilter = mapFilterToString(selectedType)
    return groupTypeStr === mappedFilter
  })

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">Groups</h1>
            <p className="text-sm text-muted-foreground">
              Create, organize, and manage your shared groups.
            </p>
          </div>
          <Button onClick={openCreateForm} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Group
          </Button>
        </div>

        <Tabs
          value={selectedType}
          onValueChange={(value) =>
            setSelectedType(value as "ALL" | GroupTypeEnum)
          }
        >
          <TabsList className="bg-card">
            <TabsTrigger value="ALL">All</TabsTrigger>
            <TabsTrigger value="NONE">General</TabsTrigger>
            <TabsTrigger value="CLUB">Club</TabsTrigger>
            <TabsTrigger value="TRAVEL">Travel</TabsTrigger>
          </TabsList>
        </Tabs>

        <GroupList
          groups={filteredGroups}
          isLoading={groups.isLoading}
          onEdit={openEditForm}
          onCreate={openCreateForm}
          onSelect={openDetail}
        />

        {totalPages > 1 && (
          <div className="flex items-center justify-between rounded-3xl border border-border bg-card px-4 py-3">
            <p className="text-sm text-muted-foreground">
              Page {pageIndex + 1} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pageIndex === 0}
                onClick={() => setPageIndex(Math.max(0, pageIndex - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={pageIndex >= totalPages - 1}
                onClick={() => setPageIndex(pageIndex + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      <GroupFormModal
        open={isFormOpen}
        onOpenChange={handleFormOpenChange}
        mode={formMode}
        initialData={selectedGroup}
      />

      <GroupDetailModal
        open={!!detailGroup}
        onOpenChange={(open) => {
          if (!open) {
            setDetailGroup(null)
          }
        }}
        group={detailGroup}
      />
    </div>
  )
}
