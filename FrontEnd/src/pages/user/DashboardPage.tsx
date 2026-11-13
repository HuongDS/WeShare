import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { motion, type Variants } from "framer-motion"
import {
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
  Users,
  CreditCard,
  Receipt,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Loader2,
  FolderOpen,
  AlertCircle,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { RootState } from "@/store/store"
import { formatCurrency, cn } from "@/lib/utils"
import { useDashboardSummary } from "@/hooks/user/useUser"

function formatTimeAgo(dateStr: string) {
  try {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    const diffDays = Math.floor(diffHours / 24)
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString("vi-VN", { month: "short", day: "numeric" })
  } catch {
    return dateStr
  }
}

export default function DashboardPage() {
  const { user } = useSelector((state: RootState) => state.auth)
  const navigate = useNavigate()

  const { data: summaryRes, isLoading, isError, refetch } = useDashboardSummary()
  const summary = summaryRes?.data

  const totalSpent = summary?.totalSpent ?? 0
  const totalOwe = summary?.totalOwe ?? 0
  const totalOwedToYou = summary?.totalOwedToYou ?? 0
  const totalGroups = summary?.totalGroups ?? 0
  const pendingTasksCount = summary?.pendingTasksCount ?? 0
  const recentActivities = summary?.recentActivities || []

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 120,
        damping: 14,
      },
    },
  }

  const getActivityBadgeClass = (category: string) => {
    switch (category?.toLowerCase()) {
      case "settlement":
      case "payment":
        return "bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300"
      case "expense":
        return "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
      case "group":
        return "bg-blue-100 text-signal-blue dark:bg-blue-950/40 dark:text-blue-300"
      default:
        return "bg-linen-mist text-forest-ink dark:bg-emerald-950/40 dark:text-lime-voltage"
    }
  }

  const getActivityIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case "settlement":
      case "payment":
        return CheckCircle2
      case "expense":
        return Receipt
      case "group":
        return Users
      default:
        return CreditCard
    }
  }

  return (
    <div className="space-y-6 sm:space-y-8 max-w-6xl mx-auto pt-2 sm:pt-4">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Header Greeting & Action Bar */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              Welcome back, {user?.userName || "User"}!
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Here&apos;s your personal financial snapshot and recent activity.
            </p>
          </div>

          <Button
            onClick={() => navigate("/groups")}
            className="rounded-full bg-lime-voltage hover:bg-lime-voltage/90 text-forest-ink font-bold shadow-xs px-5 py-2.5 self-start sm:self-auto gap-2"
          >
            <span>Groups &amp; Events</span>
            <ArrowRight className="h-4 w-4 stroke-[2.5]" />
          </Button>
        </motion.div>

        {/* Backend Connection Error Banner */}
        {isError && (
          <div className="rounded-2xl border border-alarm-red/40 bg-red-50/70 dark:bg-red-950/20 p-4 text-xs text-alarm-red flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <AlertCircle className="h-4 w-4 shrink-0 text-alarm-red" />
              <span>
                Could not connect to backend server ({import.meta.env.VITE_API_URL || "http://localhost:5111/api"}). Please ensure the backend is running.
              </span>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => refetch()}
              className="rounded-full text-xs font-bold border-alarm-red/40 hover:bg-red-100 dark:hover:bg-red-900/40 text-alarm-red h-8 px-4 gap-1.5 self-start sm:self-auto shrink-0"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Retry</span>
            </Button>
          </div>
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex h-48 items-center justify-center rounded-3xl border border-border/80 bg-card">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin text-lime-voltage" />
              <span className="text-sm font-semibold">Updating financial snapshot...</span>
            </div>
          </div>
        )}

        {/* Financial Snapshot Cards (Wise Design Language - Uniform & Balanced) */}
        {!isLoading && (
          <motion.div
            variants={containerVariants}
            className="grid gap-4 md:grid-cols-3 items-stretch"
          >
            {/* Card 1: Total Spent (Forest Ink Hero) */}
            <motion.div variants={itemVariants} className="h-full">
              <div className="rounded-3xl p-6 bg-forest-ink text-paper dark:bg-card dark:border dark:border-border relative overflow-hidden shadow-lg flex flex-col justify-between h-full min-h-[190px]">
                <div className="flex items-center justify-between z-10 h-7">
                  <span className="text-xs font-bold uppercase tracking-wider text-linen-mist/80 dark:text-muted-foreground flex items-center gap-1.5">
                    <TrendingUp className="h-4 w-4 text-lime-voltage" />
                    Total Spent
                  </span>
                  <Badge className="bg-lime-voltage text-forest-ink font-bold rounded-full px-2.5 py-0.5 text-[11px] shadow-none">
                    {totalGroups} {totalGroups === 1 ? "Hub" : "Hubs"}
                  </Badge>
                </div>

                <div className="my-3 z-10 flex-1 flex flex-col justify-center">
                  <p className="text-3xl sm:text-4xl font-black tracking-tight text-white dark:text-foreground">
                    {formatCurrency(totalSpent)}
                  </p>
                  <p className="text-xs text-linen-mist/70 dark:text-muted-foreground mt-1 min-h-[36px] flex items-center">
                    Total expenses paid across all your groups
                  </p>
                </div>

                <div className="z-10 flex items-center gap-1.5 text-xs font-semibold text-lime-voltage pt-3 border-t border-linen-mist/10 min-h-[38px]">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Real-time financial tracking</span>
                </div>

                {/* Background Glow */}
                <div className="absolute -right-8 -bottom-8 w-28 h-28 rounded-full bg-spruce/40 blur-2xl pointer-events-none" />
              </div>
            </motion.div>

            {/* Card 2: You Owe (Alarm Red Accent) */}
            <motion.div variants={itemVariants} className="h-full">
              <div className="rounded-3xl p-6 border border-border/80 bg-card shadow-xs flex flex-col justify-between h-full min-h-[190px] hover:border-alarm-red/40 transition-all">
                <div className="flex items-center justify-between h-7">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <ArrowUpRight className="h-4 w-4 text-alarm-red" />
                    You Owe
                  </span>
                  <Badge className="bg-red-100 text-alarm-red dark:bg-red-950/40 dark:text-red-300 font-bold rounded-full px-2.5 py-0.5 text-[11px] shadow-none">
                    To Settle
                  </Badge>
                </div>

                <div className="my-3 flex-1 flex flex-col justify-center">
                  <p className="text-3xl sm:text-4xl font-black tracking-tight text-alarm-red">
                    {formatCurrency(totalOwe)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 min-h-[36px] flex items-center">
                    Total pending debt to friends &amp; members
                  </p>
                </div>

                <div className="text-xs font-medium text-muted-foreground pt-3 border-t border-border/60 min-h-[38px] flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-lime-voltage" />
                  <span>{totalOwe === 0 ? "You have no outstanding debts" : "Select a group to settle up"}</span>
                </div>
              </div>
            </motion.div>

            {/* Card 3: Others Owe You (Lime/Emerald Accent) */}
            <motion.div variants={itemVariants} className="h-full">
              <div className="rounded-3xl p-6 border border-border/80 bg-card shadow-xs flex flex-col justify-between h-full min-h-[190px] hover:border-lime-voltage/40 transition-all">
                <div className="flex items-center justify-between h-7">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <ArrowDownLeft className="h-4 w-4 text-emerald-600 dark:text-lime-voltage" />
                    Others Owe You
                  </span>
                  <Badge className="bg-linen-mist text-forest-ink dark:bg-emerald-950/40 dark:text-lime-voltage font-bold rounded-full px-2.5 py-0.5 text-[11px] shadow-none">
                    Receivable
                  </Badge>
                </div>

                <div className="my-3 flex-1 flex flex-col justify-center">
                  <p className="text-3xl sm:text-4xl font-black tracking-tight text-forest-ink dark:text-lime-voltage">
                    {formatCurrency(totalOwedToYou)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 min-h-[36px] flex items-center">
                    Waiting for group members to reimburse
                  </p>
                </div>

                <div className="text-xs font-medium text-muted-foreground pt-3 border-t border-border/60 min-h-[38px] flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-lime-voltage" />
                  <span>
                    {pendingTasksCount > 0
                      ? `${pendingTasksCount} pending assigned task${pendingTasksCount === 1 ? "" : "s"}`
                      : "All settled or up-to-date"}
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Recent Activities Section */}
        <motion.div variants={itemVariants} className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold tracking-tight text-foreground">
              Recent Activities
            </h3>
            <span className="text-xs text-muted-foreground font-medium">
              Live from your groups
            </span>
          </div>

          <div className="rounded-3xl border border-border/80 bg-card p-4 sm:p-6 shadow-xs">
            {recentActivities.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground mb-3">
                  <FolderOpen className="h-6 w-6" />
                </div>
                <p className="text-sm font-bold text-foreground">No activities recorded yet</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                  Create a new group or add an expense to see your recent transactions and timeline updates here.
                </p>
                <Button
                  onClick={() => navigate("/groups")}
                  className="mt-4 rounded-full bg-lime-voltage hover:bg-lime-voltage/90 text-forest-ink font-bold shadow-xs px-5 text-xs"
                >
                  Explore Groups
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-border/60">
                {recentActivities.map((activity) => {
                  const Icon = getActivityIcon(activity.category)
                  const badgeClass = getActivityBadgeClass(activity.category)

                  return (
                    <motion.div
                      key={activity.id}
                      variants={itemVariants}
                      onClick={() => activity.groupId && navigate(`/groups/${activity.groupId}`)}
                      className={cn(
                        "flex items-center justify-between py-3.5 px-2 hover:bg-muted/40 rounded-2xl transition-colors gap-3",
                        activity.groupId && "cursor-pointer"
                      )}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-muted border border-border/70 text-foreground">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 space-y-0.5">
                          <p className="text-sm font-semibold text-foreground truncate">
                            {activity.title}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span
                              className={cn(
                                "rounded-full px-2 py-0.5 text-[10px] font-bold tracking-tight",
                                badgeClass
                              )}
                            >
                              {activity.category}
                            </span>
                            <span className="truncate">{activity.description}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs font-medium whitespace-nowrap text-muted-foreground flex-shrink-0">
                        {formatTimeAgo(activity.createdAt)}
                      </p>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
