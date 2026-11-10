import { useState, useMemo, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { Plus, Search, X, KeyRound } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useGetGroups } from "@/hooks/group/useGroup"
import type { GroupTypeEnum } from "@/constants/GroupTypeEnum"
import type { GroupViewDto } from "@/types/group/GroupViewDto"
import GroupFormModal from "./components/GroupFormModal"
import GroupList from "./components/GroupList"
import JoinGroupModal from "./components/JoinGroupModal"

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

  const [searchParams, setSearchParams] = useSearchParams()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false)
  const [joinCode, setJoinCode] = useState("")
  const [formMode, setFormMode] = useState<"create" | "edit">("create")
  const [selectedGroup, setSelectedGroup] = useState<GroupViewDto | null>(null)
  const [selectedType, setSelectedType] = useState<"ALL" | GroupTypeEnum>("ALL")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const codeParam = searchParams.get("code")
    if (codeParam) {
      setJoinCode(codeParam)
      setIsJoinModalOpen(true)
    }
  }, [searchParams])

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

  const filteredGroups = useMemo(() => {
    return groupItems.filter((group) => {
      // Filter by type
      let matchesType = true
      if (selectedType !== "ALL") {
        if (typeof group.type === "number") {
          matchesType = group.type === mapFilterToNumber(selectedType)
        } else {
          const groupTypeStr = String(group.type).toLowerCase()
          const mappedFilter = mapFilterToString(selectedType)
          matchesType = groupTypeStr === mappedFilter
        }
      }

      // Filter by search name or description
      let matchesQuery = true
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase()
        matchesQuery =
          (group.name?.toLowerCase().includes(q) ?? false) ||
          (group.description?.toLowerCase().includes(q) ?? false)
      }

      return matchesType && matchesQuery
    })
  }, [groupItems, selectedType, searchQuery])

  const handleResetFilters = () => {
    setSelectedType("ALL")
    setSearchQuery("")
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
            Groups &amp; Events Hub
          </h1>
          <p className="text-sm text-muted-foreground">
            Create, organize, and manage your shared groups, tasks, and expenses.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            onClick={() => {
              setJoinCode("")
              setIsJoinModalOpen(true)
            }}
            className="rounded-full border-border/80 hover:bg-muted font-bold shadow-xs px-4 py-2.5 gap-2 text-xs sm:text-sm"
          >
            <KeyRound className="h-4 w-4" />
            Tham gia bằng mã
          </Button>
          <Button
            onClick={openCreateForm}
            className="rounded-full bg-lime-voltage hover:bg-lime-voltage/90 text-forest-ink font-bold shadow-xs px-5 py-2.5 gap-2 text-xs sm:text-sm"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            Create Group
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Type Tabs */}
        <Tabs
          value={selectedType}
          onValueChange={(value) =>
            setSelectedType(value as "ALL" | GroupTypeEnum)
          }
        >
          <TabsList className="rounded-full p-1 bg-muted/60 dark:bg-muted/30 border border-border/80 inline-flex flex-wrap h-auto">
            <TabsTrigger
              value="ALL"
              className="rounded-full data-[state=active]:bg-lime-voltage data-[state=active]:text-forest-ink data-[state=active]:font-bold data-[state=active]:shadow-xs px-4 sm:px-5 py-1.5 transition-all text-xs sm:text-sm"
            >
              All Hubs
            </TabsTrigger>
            <TabsTrigger
              value="NONE"
              className="rounded-full data-[state=active]:bg-lime-voltage data-[state=active]:text-forest-ink data-[state=active]:font-bold data-[state=active]:shadow-xs px-4 sm:px-5 py-1.5 transition-all text-xs sm:text-sm"
            >
              General
            </TabsTrigger>
            <TabsTrigger
              value="CLUB"
              className="rounded-full data-[state=active]:bg-lime-voltage data-[state=active]:text-forest-ink data-[state=active]:font-bold data-[state=active]:shadow-xs px-4 sm:px-5 py-1.5 transition-all text-xs sm:text-sm"
            >
              Club
            </TabsTrigger>
            <TabsTrigger
              value="TRAVEL"
              className="rounded-full data-[state=active]:bg-lime-voltage data-[state=active]:text-forest-ink data-[state=active]:font-bold data-[state=active]:shadow-xs px-4 sm:px-5 py-1.5 transition-all text-xs sm:text-sm"
            >
              Travel
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Search Input Filter */}
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search groups by name..."
            className="w-full rounded-full border border-border/80 bg-card py-2 pl-9 pr-8 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:border-forest-ink dark:focus:border-lime-voltage focus:outline-none transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Empty Search Result State */}
      {filteredGroups.length === 0 && !groups.isLoading && (
        <div className="flex flex-col items-center justify-center py-16 text-center rounded-3xl border border-border/80 bg-card p-6">
          <p className="text-base font-bold text-foreground">
            No groups match your search criteria
          </p>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm">
            {searchQuery
              ? `No groups found with "${searchQuery}" in ${selectedType === "ALL" ? "all categories" : selectedType.toLowerCase() + " category"}.`
              : "No groups found in this category."}
          </p>
          <Button
            variant="outline"
            onClick={handleResetFilters}
            className="mt-4 rounded-full text-xs font-semibold"
          >
            Reset Filters
          </Button>
        </div>
      )}

      {/* Group List */}
      {filteredGroups.length > 0 && (
        <GroupList
          groups={filteredGroups}
          isLoading={groups.isLoading}
          onEdit={openEditForm}
          onCreate={openCreateForm}
        />
      )}

      {/* Pagination */}
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

      <JoinGroupModal
        isOpen={isJoinModalOpen}
        onClose={() => {
          setIsJoinModalOpen(false)
          if (searchParams.get("code")) {
            searchParams.delete("code")
            setSearchParams(searchParams)
          }
        }}
        initialCode={joinCode}
      />
    </div>
  )
}
