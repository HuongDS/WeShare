import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useGetGroups } from "@/hooks/group/useGroup"
import type { GroupTypeEnum } from "@/constants/GroupTypeEnum"
import type { GroupViewDto } from "@/types/group/GroupViewDto"
import GroupFormModal from "./components/GroupFormModal"
import GroupList from "./components/GroupList"

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
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
            Groups &amp; Events Hub
          </h1>
          <p className="text-sm text-muted-foreground">
            Create, organize, and manage your shared groups, tasks, and expenses.
          </p>
        </div>
        <Button
          onClick={openCreateForm}
          className="rounded-full bg-lime-voltage hover:bg-lime-voltage/90 text-forest-ink font-bold shadow-xs px-5 py-2.5 gap-2"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          Create Group
        </Button>
      </div>

      <Tabs
        value={selectedType}
        onValueChange={(value) =>
          setSelectedType(value as "ALL" | GroupTypeEnum)
        }
      >
        <TabsList className="rounded-full p-1 bg-muted/60 dark:bg-muted/30 border border-border/80 inline-flex">
          <TabsTrigger
            value="ALL"
            className="rounded-full data-[state=active]:bg-lime-voltage data-[state=active]:text-forest-ink data-[state=active]:font-bold data-[state=active]:shadow-xs px-5 py-1.5 transition-all text-xs sm:text-sm"
          >
            All Hubs
          </TabsTrigger>
          <TabsTrigger
            value="NONE"
            className="rounded-full data-[state=active]:bg-lime-voltage data-[state=active]:text-forest-ink data-[state=active]:font-bold data-[state=active]:shadow-xs px-5 py-1.5 transition-all text-xs sm:text-sm"
          >
            General
          </TabsTrigger>
          <TabsTrigger
            value="CLUB"
            className="rounded-full data-[state=active]:bg-lime-voltage data-[state=active]:text-forest-ink data-[state=active]:font-bold data-[state=active]:shadow-xs px-5 py-1.5 transition-all text-xs sm:text-sm"
          >
            Club
          </TabsTrigger>
          <TabsTrigger
            value="TRAVEL"
            className="rounded-full data-[state=active]:bg-lime-voltage data-[state=active]:text-forest-ink data-[state=active]:font-bold data-[state=active]:shadow-xs px-5 py-1.5 transition-all text-xs sm:text-sm"
          >
            Travel
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <GroupList
        groups={filteredGroups}
        isLoading={groups.isLoading}
        onEdit={openEditForm}
        onCreate={openCreateForm}
      />

      {totalPages > 1 && (
        <div className="flex items-center justify-between rounded-3xl border border-border/80 bg-card px-5 py-3 shadow-xs">
          <p className="text-xs sm:text-sm font-medium text-muted-foreground">
            Page {pageIndex + 1} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pageIndex === 0}
              onClick={() => setPageIndex(Math.max(0, pageIndex - 1))}
              className="rounded-full px-4 text-xs font-semibold"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pageIndex >= totalPages - 1}
              onClick={() => setPageIndex(pageIndex + 1)}
              className="rounded-full px-4 text-xs font-semibold"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <GroupFormModal
        open={isFormOpen}
        onOpenChange={handleFormOpenChange}
        mode={formMode}
        initialData={selectedGroup}
      />
    </div>
  )
}
