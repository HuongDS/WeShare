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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { RootState } from "@/store/store"
import { cn } from "@/lib/utils"

export default function DashboardPage() {
  const { user } = useSelector((state: RootState) => state.auth)
  const navigate = useNavigate()

  const recentActivities = [
    {
      description: 'John paid $100 for "Dinner"',
      category: "Payment",
      time: "2 hours ago",
      icon: CreditCard,
      badgeClass:
        "bg-linen-mist text-forest-ink dark:bg-emerald-950/40 dark:text-lime-voltage",
    },
    {
      description: 'Sarah added you to "Weekend Trip"',
      category: "Group",
      time: "5 hours ago",
      icon: Users,
      badgeClass:
        "bg-blue-100 text-signal-blue dark:bg-blue-950/40 dark:text-blue-300",
    },
    {
      description: 'You paid $50 for "Movie"',
      category: "Expense",
      time: "1 day ago",
      icon: Receipt,
      badgeClass:
        "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
    },
    {
      description: "Mike settled up with you",
      category: "Settlement",
      time: "2 days ago",
      icon: CheckCircle2,
      badgeClass:
        "bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300",
    },
  ]

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

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
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

        {/* Financial Snapshot Cards (Wise Design Language) */}
        <motion.div
          variants={containerVariants}
          className="grid gap-4 md:grid-cols-3"
        >
          {/* Card 1: Total Spent (Forest Ink Hero) */}
          <motion.div variants={itemVariants}>
            <div className="rounded-3xl p-6 bg-forest-ink text-paper dark:bg-card dark:border dark:border-border relative overflow-hidden shadow-lg flex flex-col justify-between min-h-[170px]">
              <div className="flex items-center justify-between z-10">
                <span className="text-xs font-bold uppercase tracking-wider text-linen-mist/80 dark:text-muted-foreground flex items-center gap-1.5">
                  <TrendingUp className="h-4 w-4 text-lime-voltage" />
                  Total Spent
                </span>
                <Badge className="bg-lime-voltage text-forest-ink font-bold rounded-full px-2.5 py-0.5 text-[11px] shadow-none">
                  This Month
                </Badge>
              </div>

              <div className="my-2 z-10">
                <p className="text-3xl sm:text-4xl font-black tracking-tight text-white dark:text-foreground">
                  $1,234.50
                </p>
                <p className="text-xs text-linen-mist/70 dark:text-muted-foreground mt-1">
                  Across all your groups and events
                </p>
              </div>

              <div className="z-10 flex items-center gap-1.5 text-xs font-semibold text-lime-voltage">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Smart budget tracker</span>
              </div>

              {/* Background Glow */}
              <div className="absolute -right-8 -bottom-8 w-28 h-28 rounded-full bg-spruce/40 blur-2xl pointer-events-none" />
            </div>
          </motion.div>

          {/* Card 2: You Owe (Alarm Red Accent) */}
          <motion.div variants={itemVariants}>
            <div className="rounded-3xl p-6 border border-border/80 bg-card shadow-xs flex flex-col justify-between min-h-[170px] hover:border-alarm-red/40 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <ArrowUpRight className="h-4 w-4 text-alarm-red" />
                  You Owe
                </span>
                <Badge className="bg-red-100 text-alarm-red dark:bg-red-950/40 dark:text-red-300 font-bold rounded-full px-2.5 py-0.5 text-[11px] shadow-none">
                  To Settle
                </Badge>
              </div>

              <div className="my-2">
                <p className="text-3xl sm:text-4xl font-black tracking-tight text-alarm-red">
                  $234.50
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Pending settlement with friends
                </p>
              </div>

              <div className="text-xs font-medium text-muted-foreground">
                2 pending transactions
              </div>
            </div>
          </motion.div>

          {/* Card 3: Others Owe You (Lime/Emerald Accent) */}
          <motion.div variants={itemVariants}>
            <div className="rounded-3xl p-6 border border-border/80 bg-card shadow-xs flex flex-col justify-between min-h-[170px] hover:border-lime-voltage/40 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <ArrowDownLeft className="h-4 w-4 text-emerald-600 dark:text-lime-voltage" />
                  Others Owe You
                </span>
                <Badge className="bg-linen-mist text-forest-ink dark:bg-emerald-950/40 dark:text-lime-voltage font-bold rounded-full px-2.5 py-0.5 text-[11px] shadow-none">
                  Receivable
                </Badge>
              </div>

              <div className="my-2">
                <p className="text-3xl sm:text-4xl font-black tracking-tight text-forest-ink dark:text-lime-voltage">
                  $500.00
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Waiting for group members to pay
                </p>
              </div>

              <div className="text-xs font-medium text-muted-foreground">
                3 members owe you
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Recent Activities Section */}
        <motion.div variants={itemVariants} className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold tracking-tight text-foreground">
              Recent Activities
            </h3>
            <span className="text-xs text-muted-foreground font-medium">
              Updated live
            </span>
          </div>

          <div className="rounded-3xl border border-border/80 bg-card p-4 sm:p-6 shadow-xs">
            <div className="divide-y divide-border/60">
              {recentActivities.map((activity, index) => {
                const Icon = activity.icon
                return (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    className="flex items-center justify-between py-3.5 px-2 hover:bg-muted/40 rounded-2xl transition-colors gap-3"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-muted border border-border/70 text-foreground">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 space-y-0.5">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {activity.description}
                        </p>
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "rounded-full px-2 py-0.5 text-[10px] font-bold tracking-tight",
                              activity.badgeClass
                            )}
                          >
                            {activity.category}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs font-medium whitespace-nowrap text-muted-foreground flex-shrink-0">
                      {activity.time}
                    </p>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
