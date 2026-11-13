import { useMemo } from "react"
import TasksTab from "./components/tabs/TasksTab"
import EventsTab from "./components/tabs/EventsTab"
import { useWorkNavigation } from "./components/work/WorkShared"
import { Link, useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useGetGroup } from "@/hooks/group/useGroup"
import PageLoader from "@/components/PageLoader"
import GeneralTab from "@/pages/group/components/tabs/GeneralTab"
import ExpensesTab from "@/pages/group/components/tabs/ExpensesTab"
import SettlementsTab from "@/pages/group/components/tabs/SettlementsTab"
import MembersTab from "@/pages/group/components/tabs/MembersTab"
import TravelPlanTab from "@/pages/group/components/tabs/TravelPlanTab"

const getGroupTypeConfig = (rawType: string | number | undefined | null) => {
  const type = String(rawType ?? "").toLowerCase()

  switch (type) {
    case "1":
    case "club":
      return {
        label: "Câu lạc bộ",
        badgeClass:
          "bg-linen-mist text-forest-ink dark:bg-emerald-950/40 dark:text-lime-voltage",
      }
    case "2":
    case "travel":
      return {
        label: "Du lịch",
        badgeClass:
          "bg-blue-100 text-signal-blue dark:bg-blue-950/40 dark:text-blue-300",
      }

    case "general":
    default:
      return {
        label: "Thông thường",
        badgeClass: "bg-muted text-muted-foreground",
      }
  }
}

export default function GroupDetailsPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const groupId = Number(id)
  const { params, update } = useWorkNavigation()
  const activeTab = params.get("tab") || "general"
  const setActiveTab = (tab: string) => update({ tab })

  const { group } = useGetGroup(Number.isNaN(groupId) ? undefined : groupId)
  const groupData = group.data?.data || null

  const config = useMemo(
    () => getGroupTypeConfig(groupData?.type),
    [groupData?.type]
  )

  const members = useMemo(() => groupData?.members || [], [groupData?.members])

  if (Number.isNaN(groupId)) {
    return (
      <div className="space-y-4 p-4 md:p-8">
        <p className="text-sm text-alarm-red font-semibold">Mã nhóm không hợp lệ.</p>
        <Button
          variant="outline"
          className="rounded-full"
          onClick={() => navigate("/groups")}
        >
          Quay lại danh sách nhóm
        </Button>
      </div>
    )
  }

  if (group.isLoading) {
    return <PageLoader />
  }

  if (!groupData) {
    return (
      <div className="space-y-4 p-4 md:p-8">
        <p className="text-sm text-muted-foreground">Không tìm thấy thông tin nhóm.</p>
        <Button variant="outline" className="rounded-full" asChild>
          <Link to="/groups">Quay lại danh sách nhóm</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Group Detail Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/groups")}
            aria-label="Quay lại danh sách nhóm"
            className="rounded-full hover:bg-muted"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="truncate text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                {groupData.name}
              </h1>
              <Badge
                className={`rounded-full px-3 py-1 text-xs font-bold tracking-tight shadow-none ${config.badgeClass}`}
              >
                {config.label}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>
            {members.length} thành viên
          </span>
        </div>
      </div>

      {/* Modern Wise Pills Tab Navigation */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-5"
      >
        <div className="overflow-x-auto no-scrollbar pb-1">
          <TabsList className="inline-flex h-auto w-auto items-center gap-1.5 rounded-full border border-border/80 bg-muted/60 p-1.5 dark:bg-muted/30">
            <TabsTrigger
              value="general"
              className="rounded-full px-4 sm:px-5 py-2 text-xs sm:text-sm font-semibold transition-all text-muted-foreground hover:text-foreground data-[state=active]:bg-lime-voltage data-[state=active]:text-forest-ink data-[state=active]:font-bold data-[state=active]:shadow-xs whitespace-nowrap shrink-0"
            >
              Tổng quan
            </TabsTrigger>
            <TabsTrigger
              value="expenses"
              className="rounded-full px-4 sm:px-5 py-2 text-xs sm:text-sm font-semibold transition-all text-muted-foreground hover:text-foreground data-[state=active]:bg-lime-voltage data-[state=active]:text-forest-ink data-[state=active]:font-bold data-[state=active]:shadow-xs whitespace-nowrap shrink-0"
            >
              Khoản chi
            </TabsTrigger>
            <TabsTrigger
              value="settlements"
              className="rounded-full px-4 sm:px-5 py-2 text-xs sm:text-sm font-semibold transition-all text-muted-foreground hover:text-foreground data-[state=active]:bg-lime-voltage data-[state=active]:text-forest-ink data-[state=active]:font-bold data-[state=active]:shadow-xs whitespace-nowrap shrink-0"
            >
              Quyết toán &amp; Nợ
            </TabsTrigger>
            <TabsTrigger
              value="members"
              className="rounded-full px-4 sm:px-5 py-2 text-xs sm:text-sm font-semibold transition-all text-muted-foreground hover:text-foreground data-[state=active]:bg-lime-voltage data-[state=active]:text-forest-ink data-[state=active]:font-bold data-[state=active]:shadow-xs whitespace-nowrap shrink-0"
            >
              Thành viên
            </TabsTrigger>
            <TabsTrigger
              value="travel"
              className="rounded-full px-4 sm:px-5 py-2 text-xs sm:text-sm font-semibold transition-all text-muted-foreground hover:text-foreground data-[state=active]:bg-lime-voltage data-[state=active]:text-forest-ink data-[state=active]:font-bold data-[state=active]:shadow-xs whitespace-nowrap shrink-0"
            >
              ✈️ Lịch trình du lịch
            </TabsTrigger>
            <TabsTrigger
              value="tasks"
              className="rounded-full px-4 sm:px-5 py-2 text-xs sm:text-sm font-semibold transition-all text-muted-foreground hover:text-foreground data-[state=active]:bg-lime-voltage data-[state=active]:text-forest-ink data-[state=active]:font-bold data-[state=active]:shadow-xs whitespace-nowrap shrink-0"
            >
              Công việc
            </TabsTrigger>
            <TabsTrigger
              value="events"
              className="rounded-full px-4 sm:px-5 py-2 text-xs sm:text-sm font-semibold transition-all text-muted-foreground hover:text-foreground data-[state=active]:bg-lime-voltage data-[state=active]:text-forest-ink data-[state=active]:font-bold data-[state=active]:shadow-xs whitespace-nowrap shrink-0"
            >
              Sự kiện
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="general">
          <GeneralTab
            groupId={groupId}
            group={groupData}
            onOpenMembersTab={() => setActiveTab("members")}
          />
        </TabsContent>

        <TabsContent value="expenses">
          <ExpensesTab groupId={id || ""} groupName={groupData.name} />
        </TabsContent>

        <TabsContent value="settlements">
          <SettlementsTab groupId={groupId} />
        </TabsContent>

        <TabsContent value="members">
          <MembersTab group={groupData} />
        </TabsContent>

        <TabsContent value="travel">
          <TravelPlanTab groupId={groupId} group={groupData} />
        </TabsContent>

        <TabsContent value="tasks">
          <TasksTab groupId={groupId} />
        </TabsContent>

        <TabsContent value="events">
          <EventsTab groupId={groupId} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
