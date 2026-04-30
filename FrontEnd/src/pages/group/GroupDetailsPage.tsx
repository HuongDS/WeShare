import { useMemo, useState } from "react"
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

const getGroupTypeConfig = (rawType: string | number | undefined | null) => {
  const type = String(rawType ?? "").toLowerCase()

  switch (type) {
    case "1":
    case "club":
      return {
        label: "Club",
        badgeClass: "bg-emerald-100 text-emerald-700",
      }
    case "2":
    case "travel":
      return {
        label: "Travel",
        badgeClass: "bg-blue-100 text-blue-700",
      }

    case "general":
    default:
      return {
        label: "General",
        badgeClass: "bg-slate-100 text-slate-700",
      }
  }
}

export default function GroupDetailsPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const groupId = Number(id)
  const [activeTab, setActiveTab] = useState("general")

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
        <p className="text-sm text-destructive">Invalid group id.</p>
        <Button variant="outline" onClick={() => navigate("/groups")}>
          Back to Groups
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
        <p className="text-sm text-muted-foreground">Group not found.</p>
        <Button variant="outline" asChild>
          <Link to="/groups">Back to Groups</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="bg-linear-to-br from-slate-50 to-slate-100">
      <div className="mx-auto max-w-6xl space-y-5">
        <div className="mb-1 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/groups")}
              aria-label="Back to groups"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="truncate text-2xl font-bold text-foreground">
                  {groupData.name}
                </h1>
                <Badge className={config.badgeClass}>{config.label}</Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-5 w-5" />
            <span>
              {members.length} member{members.length === 1 ? "" : "s"}
            </span>
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList className="grid w-full grid-cols-4 bg-card">
            <TabsTrigger
              value="general"
              className="data-[state=active]:font-bold data-[state=active]:text-emerald-700"
            >
              General (Settings){" "}
            </TabsTrigger>
            <TabsTrigger
              value="expenses"
              className="data-[state=active]:font-bold data-[state=active]:text-emerald-700"
            >
              Expenses
            </TabsTrigger>
            <TabsTrigger
              value="settlements"
              className="data-[state=active]:font-bold data-[state=active]:text-emerald-700"
            >
              Settlements
            </TabsTrigger>
            <TabsTrigger
              value="members"
              className="data-[state=active]:font-bold data-[state=active]:text-emerald-700"
            >
              Members
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <GeneralTab
              groupId={groupId}
              group={groupData}
              onOpenMembersTab={() => setActiveTab("members")}
            />
          </TabsContent>

          <TabsContent value="expenses">
            <ExpensesTab groupId={id || ""} />
          </TabsContent>

          <TabsContent value="settlements">
            <SettlementsTab groupId={groupId} />
          </TabsContent>

          <TabsContent value="members">
            <MembersTab group={groupData} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
