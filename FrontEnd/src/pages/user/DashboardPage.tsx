import { useSelector } from "react-redux"
import { motion, type Variants } from "framer-motion"
import { TrendingUp, Users, Activity } from "lucide-react"
import { Card } from "@/components/ui/card"
import type { RootState } from "@/store/store"

export default function DashboardPage() {
  const { user } = useSelector((state: RootState) => state.auth)

  // Mock data for expense summary
  const expenseSummary = [
    {
      title: "Total Spent",
      amount: "$1,234.50",
      icon: TrendingUp,
      color: "from-blue-50 to-blue-100",
      textColor: "text-blue-600",
      borderColor: "border-blue-200",
    },
    {
      title: "You Owe",
      amount: "$234.50",
      icon: Users,
      color: "from-red-50 to-red-100",
      textColor: "text-red-600",
      borderColor: "border-red-200",
    },
    {
      title: "Others Owe You",
      amount: "$500.00",
      icon: Activity,
      color: "from-green-50 to-green-100",
      textColor: "text-green-600",
      borderColor: "border-green-200",
    },
  ]

  const recentActivities = [
    {
      description: 'John paid $100 for "Dinner"',
      category: "Payment",
      time: "2 hours ago",
    },
    {
      description: 'Sarah added you to "Weekend Trip"',
      category: "Group",
      time: "5 hours ago",
    },
    {
      description: 'You paid $50 for "Movie"',
      category: "Expense",
      time: "1 day ago",
    },
    {
      description: "Mike settled up with you",
      category: "Settlement",
      time: "2 days ago",
    },
  ]

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10,
      },
    },
  }

  return (
    <div className="px-4 py-6 lg:px-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="space-y-2">
          <h2 className="text-3xl font-bold text-slate-900">
            Welcome back, {user?.userName || "User"}!
          </h2>
          <p className="text-slate-600">
            Here's your expense summary for this month
          </p>
        </motion.div>

        {/* Expense Summary Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {expenseSummary.map((item, index) => {
            const Icon = item.icon
            return (
              <motion.div key={index} variants={itemVariants}>
                <Card
                  className={`border ${item.borderColor} bg-linear-to-br ${item.color} p-6 transition-all hover:shadow-lg`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">
                        {item.title}
                      </p>
                      <p
                        className={`mt-2 text-2xl font-bold ${item.textColor}`}
                      >
                        {item.amount}
                      </p>
                    </div>
                    <div
                      className={`rounded-lg bg-white/50 p-3 ${item.textColor}`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Recent Activities */}
        <motion.div variants={itemVariants} className="space-y-4">
          <h3 className="text-xl font-bold text-slate-900">
            Recent Activities
          </h3>
          <Card className="border border-slate-200 bg-white">
            <div className="divide-y divide-slate-200">
              {recentActivities.map((activity, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-slate-50"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-slate-900">
                      {activity.description}
                    </p>
                    <p className="text-xs text-slate-500">
                      {activity.category}
                    </p>
                  </div>
                  <p className="text-xs font-medium whitespace-nowrap text-slate-500">
                    {activity.time}
                  </p>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  )
}
