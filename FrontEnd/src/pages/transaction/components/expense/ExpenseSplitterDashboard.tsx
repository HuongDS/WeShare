import { useState, useMemo } from "react"
import {
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowRight,
  Search,
  CheckCircle2,
  Calendar,
  CreditCard,
  Receipt,
  Users,
  Eye,
  Trash2,
  ChevronRight,
  ChevronDown,
  TrendingUp,
  FileText,
  Sparkles,
  QrCode,
  Send,
  Loader2,
  Filter,
  RotateCcw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useGetTransactions, useDeleteTransaction } from "@/hooks/transaction/useTransaction"
import { useGetMyGroupDebts, useGetGroupDebtThatIAmOwed } from "@/hooks/groupDebt/useGroupDebt"
import { useGetGroupMembers } from "@/hooks/group/useGroup"
import { useAppSelector } from "@/store/hooks"
import { formatCurrency, cn } from "@/lib/utils"
import AddExpenseModal from "@/pages/transaction/components/expense/AddExpenseModal"
import QuickSettleUpModal from "@/pages/transaction/components/settlement/QuickSettleUpModal"
import type { TransactionViewDto } from "@/types/transaction/TransactionViewDto"
import type { UserViewDto } from "@/types/user/UserViewDto"
import { groupDebtApi } from "@/api/groupDebtApi"
import { toast } from "sonner"

interface ExpenseSplitterDashboardProps {
  groupId: number
  groupName?: string
  taskId?: string
}

export default function ExpenseSplitterDashboard({
  groupId,
  groupName,
}: ExpenseSplitterDashboardProps) {
  const currentUserId = useAppSelector((state) => state.auth.user?.userId)
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 10

  // Modals state
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false)
  const [isSettleModalOpen, setIsSettleModalOpen] = useState(false)
  const [selectedRecipient, setSelectedRecipient] = useState<UserViewDto | null>(null)
  const [selectedDebtAmount, setSelectedDebtAmount] = useState<number>(0)
  const [viewingProofUrl, setViewingProofUrl] = useState<string | null>(null)

  // Filters & search
  const [searchQuery, setSearchQuery] = useState("")
  const [strategyFilter, setStrategyFilter] = useState<string>("ALL")
  const [balanceFilter, setBalanceFilter] = useState<"ALL" | "OWE" | "RECEIVE">("ALL")
  const [payerFilter, setPayerFilter] = useState<string>("ALL")
  const [datePreset, setDatePreset] = useState<"ALL" | "TODAY" | "7DAYS" | "THIS_MONTH" | "CUSTOM">("ALL")
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")
  const [remindingDebtIds, setRemindingDebtIds] = useState<Set<number>>(new Set())

  // API Hooks
  const { getTransactionsByGroupId } = useGetTransactions(PAGE_SIZE, page, groupId)
  const { deleteTransaction } = useDeleteTransaction()
  const { myGroupDebts } = useGetMyGroupDebts(groupId)
  const { groupDebtThatIAmOwed } = useGetGroupDebtThatIAmOwed(groupId)
  const { members } = useGetGroupMembers(groupId)

  const transactionsData = getTransactionsByGroupId.data?.data
  const transactions: TransactionViewDto[] = transactionsData?.items || []
  const totalPages = transactionsData?.totalPages || 0
  const isLoading = getTransactionsByGroupId.isLoading

  const debtsIOwe = myGroupDebts.data?.data || []
  const debtsOwedToMe = groupDebtThatIAmOwed.data?.data || []
  const groupMembers = members.data?.data || []

  // Unique Payers list from transactions and group members
  const payersList = useMemo(() => {
    const map = new Map<string, string>()
    transactions.forEach((t) => {
      if (t.payer && t.payer.id) {
        map.set(String(t.payer.id), t.payer.fullName || `User #${t.payer.id}`)
      }
    })
    groupMembers.forEach((m) => {
      if (m.id && !map.has(String(m.id))) {
        map.set(String(m.id), m.fullName || `User #${m.id}`)
      }
    })
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }))
  }, [transactions, groupMembers])

  // Net Balance calculation
  const totalIOwe = useMemo(
    () => debtsIOwe.reduce((sum, d) => sum + Math.abs(d.amount), 0),
    [debtsIOwe]
  )
  const totalOwedToMe = useMemo(
    () => debtsOwedToMe.reduce((sum, d) => sum + Math.abs(d.amount), 0),
    [debtsOwedToMe]
  )
  const netBalance = totalOwedToMe - totalIOwe

  // Total group spending calculation
  const totalGroupSpending = useMemo(() => {
    return transactions.reduce((sum, t) => sum + (t.amount || 0), 0)
  }, [transactions])

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchQuery =
        !searchQuery ||
        (t.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
        (t.payer?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)

      const matchStrategy =
        strategyFilter === "ALL" ||
        t.splitStrategy?.toUpperCase() === strategyFilter.toUpperCase()

      const matchPayer =
        payerFilter === "ALL" || (t.payer && String(t.payer.id) === payerFilter)

      let matchDate = true
      if (datePreset !== "ALL" && t.createdAt) {
        const itemDate = new Date(t.createdAt)
        if (!isNaN(itemDate.getTime())) {
          const now = new Date()
          const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())

          if (datePreset === "TODAY") {
            matchDate = itemDate >= startOfToday
          } else if (datePreset === "7DAYS") {
            const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            matchDate = itemDate >= sevenDaysAgo
          } else if (datePreset === "THIS_MONTH") {
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
            matchDate = itemDate >= startOfMonth
          } else if (datePreset === "CUSTOM") {
            if (startDate) {
              const start = new Date(startDate)
              start.setHours(0, 0, 0, 0)
              matchDate = matchDate && itemDate >= start
            }
            if (endDate) {
              const end = new Date(endDate)
              end.setHours(23, 59, 59, 999)
              matchDate = matchDate && itemDate <= end
            }
          }
        }
      }

      return matchQuery && matchStrategy && matchPayer && matchDate
    })
  }, [transactions, searchQuery, strategyFilter, payerFilter, datePreset, startDate, endDate])

  const handleRemindDebt = async (debtId: number, memberName: string) => {
    setRemindingDebtIds((prev) => new Set(prev).add(debtId))
    try {
      await groupDebtApi.remindDebt(debtId)
      toast.success(`Đã gửi lời nhắc nợ thành công tới ${memberName}!`)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || "Không thể gửi lời nhắc nợ.")
    } finally {
      setRemindingDebtIds((prev) => {
        const next = new Set(prev)
        next.delete(debtId)
        return next
      })
    }
  }

  const handleResetFilters = () => {
    setSearchQuery("")
    setStrategyFilter("ALL")
    setPayerFilter("ALL")
    setDatePreset("ALL")
    setStartDate("")
    setEndDate("")
  }

  const hasActiveFilters =
    Boolean(searchQuery) ||
    strategyFilter !== "ALL" ||
    payerFilter !== "ALL" ||
    datePreset !== "ALL" ||
    Boolean(startDate) ||
    Boolean(endDate)

  // Settle Up handler
  const handleOpenSettle = (recipient: UserViewDto, amount: number) => {
    setSelectedRecipient(recipient)
    setSelectedDebtAmount(amount)
    setIsSettleModalOpen(true)
  }

  const handleDeleteExpense = async (id: number) => {
    if (!confirm("Are you sure you want to delete this expense?")) return
    try {
      await deleteTransaction.mutateAsync(id)
      toast.success("Expense deleted successfully")
      getTransactionsByGroupId.refetch()
      myGroupDebts.refetch()
      groupDebtThatIAmOwed.refetch()
    } catch {
      toast.error("Failed to delete expense")
    }
  }

  const getInitials = (name?: string) => {
    if (!name) return "U"
    const parts = name.trim().split(/\s+/).filter(Boolean)
    return parts.slice(0, 2).map((p) => p[0]?.toUpperCase()).join("") || "U"
  }

  return (
    <div className="space-y-6">
      {/* =========================================================================
          SECTION 1: FINANCIAL SNAPSHOT HERO (Wise Aesthetic)
          ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
        {/* Total Group Spend Card */}
        <div className="rounded-3xl p-6 bg-forest-ink text-paper dark:bg-card dark:border dark:border-border relative overflow-hidden shadow-lg flex flex-col justify-between h-full min-h-[190px]">
          <div className="flex items-center justify-between z-10 h-7">
            <span className="text-xs font-bold uppercase tracking-wider text-linen-mist/80 dark:text-muted-foreground flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-lime-voltage" />
              Total Group Spend
            </span>
            <Badge className="bg-lime-voltage text-forest-ink font-bold rounded-full px-2.5 py-0.5 text-[11px]">
              {transactions.length} Expenses
            </Badge>
          </div>

          <div className="my-2 z-10 flex-1 flex flex-col justify-center">
            <p className="text-2xl sm:text-3xl font-black tracking-tight text-white dark:text-foreground">
              {formatCurrency(totalGroupSpending)}
            </p>
            <p className="text-xs text-linen-mist/70 dark:text-muted-foreground mt-1 min-h-[36px] flex items-center">
              Across {groupMembers.length || 0} participants in {groupName || "this hub"}
            </p>
          </div>

          <div className="z-10 flex items-center gap-2 pt-3 border-t border-linen-mist/10 text-xs font-semibold text-lime-voltage min-h-[38px]">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Auto-balanced algorithm</span>
          </div>

          {/* Decorative background glow */}
          <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-spruce/30 blur-2xl pointer-events-none" />
        </div>

        {/* Your Personal Net Balance Card */}
        <div
          className={cn(
            "rounded-3xl p-6 border shadow-sm flex flex-col justify-between h-full min-h-[190px] transition-all",
            netBalance > 0
              ? "bg-linen-mist/50 border-lime-voltage/60 dark:bg-card dark:border-border"
              : netBalance < 0
                ? "bg-red-50/70 border-red-200 dark:bg-card dark:border-border"
                : "bg-card border-border"
          )}
        >
          <div className="flex items-center justify-between h-7">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              {netBalance >= 0 ? (
                <ArrowDownLeft className="h-4 w-4 text-emerald-600 dark:text-lime-voltage" />
              ) : (
                <ArrowUpRight className="h-4 w-4 text-alarm-red" />
              )}
              Your Net Balance
            </span>
            <Badge
              variant="outline"
              className={cn(
                "rounded-full text-[11px] font-bold",
                netBalance > 0
                  ? "border-emerald-500/40 text-emerald-700 dark:text-lime-voltage bg-emerald-50/50 dark:bg-card"
                  : netBalance < 0
                    ? "border-red-400 text-alarm-red bg-red-50/50 dark:bg-card"
                    : "border-border text-muted-foreground"
              )}
            >
              {netBalance > 0 ? "You Receive" : netBalance < 0 ? "You Owe" : "Balanced"}
            </Badge>
          </div>

          <div className="my-2 flex-1 flex flex-col justify-center">
            <p
              className={cn(
                "text-2xl sm:text-3xl font-black tracking-tight",
                netBalance > 0
                  ? "text-emerald-700 dark:text-lime-voltage"
                  : netBalance < 0
                    ? "text-alarm-red"
                    : "text-foreground"
              )}
            >
              {netBalance !== 0 ? formatCurrency(Math.abs(netBalance)) : "0 ₫"}
            </p>
            <p className="text-xs text-muted-foreground mt-1 min-h-[36px] flex items-center">
              {netBalance > 0
                ? "Other members owe you money"
                : netBalance < 0
                  ? "You have outstanding settlements to pay"
                  : "You're all squared away!"}
            </p>
          </div>

          <div className="flex items-center justify-between text-xs pt-3 border-t border-border/60 min-h-[38px]">
            <span className="text-muted-foreground">Owed to you: <strong>{formatCurrency(totalOwedToMe)}</strong></span>
            <span className="text-muted-foreground">You owe: <strong>{formatCurrency(totalIOwe)}</strong></span>
          </div>
        </div>

        {/* Quick Action Center Card */}
        <div className="rounded-3xl p-6 bg-card border border-border shadow-sm flex flex-col justify-between h-full min-h-[190px]">
          <div>
            <div className="h-7 flex items-center">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Instant Splitter Actions
              </span>
            </div>
            <h4 className="text-base font-bold text-foreground mt-2">
              Split, Share &amp; Settle
            </h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              Add new receipt or settle debts with 1-click VietQR.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 mt-4 pt-3 border-t border-border/40">
            <Button
              onClick={() => setIsAddExpenseOpen(true)}
              className="flex-1 rounded-full bg-lime-voltage text-forest-ink hover:bg-lime-400 font-extrabold text-xs h-10 shadow-sm gap-1.5 transition-transform active:scale-95"
            >
              <Plus className="h-4 w-4 stroke-[3]" />
              Add Expense
            </Button>

            {debtsIOwe.length > 0 && (
              debtsIOwe.length === 1 ? (
                <Button
                  variant="outline"
                  onClick={() => handleOpenSettle(debtsIOwe[0].toUser, Math.abs(debtsIOwe[0].amount))}
                  className="rounded-full border-forest-ink/30 text-foreground hover:bg-muted font-bold text-xs h-10 gap-1.5"
                >
                  <CreditCard className="h-4 w-4" />
                  Settle Up
                </Button>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="rounded-full border-forest-ink/30 text-foreground hover:bg-muted font-bold text-xs h-10 gap-1.5"
                    >
                      <CreditCard className="h-4 w-4" />
                      <span>Settle Up</span>
                      <Badge className="bg-alarm-red/10 text-alarm-red font-bold text-[10px] px-1.5 py-0 rounded-full ml-0.5">
                        {debtsIOwe.length}
                      </Badge>
                      <ChevronDown className="h-3.5 w-3.5 text-muted-foreground ml-0.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64 rounded-2xl p-2 shadow-xl border border-border bg-card">
                    <div className="px-2 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      Select creditor to pay
                    </div>
                    {debtsIOwe.map((debt) => (
                      <DropdownMenuItem
                        key={debt.id}
                        onClick={() => handleOpenSettle(debt.toUser, Math.abs(debt.amount))}
                        className="rounded-xl cursor-pointer p-2 flex items-center justify-between gap-2 hover:bg-muted focus:bg-muted"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Avatar className="h-7 w-7 border border-border shrink-0">
                            <AvatarImage src={debt.toUser?.avatar} />
                            <AvatarFallback className="text-[10px] bg-forest-ink text-lime-voltage font-bold">
                              {getInitials(debt.toUser?.fullName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-foreground truncate">
                              {debt.toUser?.fullName || "Member"}
                            </p>
                            <p className="text-[10px] text-muted-foreground truncate">
                              {debt.toUser?.bankName ? `VietQR • ${debt.toUser.bankName}` : "Direct transfer"}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs font-black text-alarm-red shrink-0">
                          {formatCurrency(Math.abs(debt.amount))}
                        </span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )
            )}
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION 2: BALANCES & SETTLEMENT FLOW ("Ai nợ ai bao nhiêu tiền")
          ========================================================================= */}
      <div className="rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-sm space-y-5">
        {/* Header with Title and Segmented View Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-border">
          <div>
            <h3 className="text-lg font-bold text-foreground tracking-tight flex items-center gap-2">
              <Users className="h-5 w-5 text-forest-ink dark:text-lime-voltage" />
              Settlement Balance Overview
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Direct debt breakdown — Who owes who and instant settlement options
            </p>
          </div>

          {/* Segmented Filter Switcher */}
          <div className="flex items-center gap-1 p-1 bg-muted/80 rounded-full self-start sm:self-auto border border-border/40">
            <button
              type="button"
              onClick={() => setBalanceFilter("ALL")}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-bold transition-all flex items-center gap-1.5",
                balanceFilter === "ALL"
                  ? "bg-forest-ink text-lime-voltage dark:bg-lime-voltage dark:text-forest-ink shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span>All Balances</span>
              <Badge
                className={cn(
                  "rounded-full text-[10px] px-1.5 py-0 font-extrabold h-4 border-none",
                  balanceFilter === "ALL"
                    ? "bg-lime-voltage/30 text-lime-voltage dark:bg-forest-ink/20 dark:text-forest-ink"
                    : "bg-background text-foreground"
                )}
              >
                {debtsIOwe.length + debtsOwedToMe.length}
              </Badge>
            </button>

            <button
              type="button"
              onClick={() => setBalanceFilter("OWE")}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-bold transition-all flex items-center gap-1.5",
                balanceFilter === "OWE"
                  ? "bg-alarm-red text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <ArrowUpRight className="h-3.5 w-3.5" />
              <span>You Owe</span>
              {debtsIOwe.length > 0 && (
                <Badge
                  className={cn(
                    "rounded-full text-[10px] px-1.5 py-0 font-extrabold h-4 border-none",
                    balanceFilter === "OWE"
                      ? "bg-white/30 text-white"
                      : "bg-red-100 text-alarm-red dark:bg-red-950/60 dark:text-red-300"
                  )}
                >
                  {debtsIOwe.length}
                </Badge>
              )}
            </button>

            <button
              type="button"
              onClick={() => setBalanceFilter("RECEIVE")}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-bold transition-all flex items-center gap-1.5",
                balanceFilter === "RECEIVE"
                  ? "bg-emerald-600 text-white dark:bg-lime-voltage dark:text-forest-ink shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <ArrowDownLeft className="h-3.5 w-3.5" />
              <span>Owed to You</span>
              {debtsOwedToMe.length > 0 && (
                <Badge
                  className={cn(
                    "rounded-full text-[10px] px-1.5 py-0 font-extrabold h-4 border-none",
                    balanceFilter === "RECEIVE"
                      ? "bg-white/30 text-white dark:bg-forest-ink/20 dark:text-forest-ink"
                      : "bg-linen-mist text-forest-ink dark:bg-card dark:text-lime-voltage"
                  )}
                >
                  {debtsOwedToMe.length}
                </Badge>
              )}
            </button>
          </div>
        </div>

        {/* Global Empty State: All Settled */}
        {debtsIOwe.length === 0 && debtsOwedToMe.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center rounded-3xl border border-dashed border-border/80 bg-muted/20">
            <div className="h-14 w-14 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-lime-voltage flex items-center justify-center mb-3 shadow-xs">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <h4 className="text-lg font-bold text-foreground">All Debts Settled!</h4>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm">
              All member expenses are completely balanced. There are no outstanding debts to settle.
            </p>
          </div>
        ) : (
          <div
            className={cn(
              "gap-5",
              balanceFilter === "ALL"
                ? "grid grid-cols-1 lg:grid-cols-2"
                : "grid grid-cols-1"
            )}
          >
            {/* Column 1: Debts you owe to others */}
            {(balanceFilter === "ALL" || balanceFilter === "OWE") && (
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-1">
                  <span className="text-xs font-black uppercase tracking-wider text-alarm-red flex items-center gap-1.5">
                    <ArrowUpRight className="h-4 w-4 stroke-[2.5]" />
                    You Owe ({debtsIOwe.length})
                  </span>
                  <span className="text-xs font-extrabold text-alarm-red">
                    Total: {formatCurrency(totalIOwe)}
                  </span>
                </div>

                {debtsIOwe.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border/80 p-6 text-center text-xs text-muted-foreground bg-muted/20">
                    <CheckCircle2 className="h-6 w-6 text-emerald-500 mx-auto mb-2" />
                    You have no pending debts to settle in this group.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {debtsIOwe.map((debt) => (
                      <div
                        key={debt.id}
                        className="rounded-2xl border border-border/80 bg-background hover:border-alarm-red/50 hover:shadow-md transition-all p-4 space-y-3 shadow-2xs group"
                      >
                        {/* Top Row: Flow direction & Readiness Pill */}
                        <div className="flex items-center justify-between gap-2 pb-2 border-b border-border/50">
                          <div className="flex items-center gap-1.5 text-xs">
                            <span className="font-extrabold text-foreground">You</span>
                            <ArrowRight className="h-3.5 w-3.5 text-alarm-red shrink-0" />
                            <span className="font-medium text-muted-foreground">Owe</span>
                            <span className="font-bold text-foreground truncate max-w-[130px] sm:max-w-[170px]">
                              {debt.toUser?.fullName || "Member"}
                            </span>
                          </div>

                          {debt.toUser?.bankName && debt.toUser?.defaultBankAccount ? (
                            <Badge className="bg-linen-mist text-forest-ink dark:bg-emerald-950/40 dark:text-lime-voltage dark:border dark:border-lime-voltage/30 rounded-full px-2.5 py-0.5 text-[10px] font-bold flex items-center gap-1 shadow-none shrink-0">
                              <QrCode className="h-3 w-3" />
                              <span>VietQR Ready</span>
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="rounded-full px-2 py-0.5 text-[10px] text-muted-foreground shrink-0 border-border">
                              Direct / Cash
                            </Badge>
                          )}
                        </div>

                        {/* Middle Row: Creditor profile + Amount */}
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <Avatar className="h-10 w-10 border border-border shrink-0">
                              <AvatarImage src={debt.toUser?.avatar} alt={debt.toUser?.fullName} />
                              <AvatarFallback className="bg-forest-ink text-lime-voltage text-xs font-bold">
                                {getInitials(debt.toUser?.fullName)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-foreground truncate">
                                {debt.toUser?.fullName || "Member"}
                              </p>
                              <p className="text-[11px] text-muted-foreground truncate">
                                {debt.toUser?.bankName ? (
                                  <span className="flex items-center gap-1">
                                    <CreditCard className="h-3 w-3 shrink-0" />
                                    <span>{debt.toUser.bankName} • {debt.toUser.defaultBankAccount}</span>
                                  </span>
                                ) : (
                                  "No bank account registered"
                                )}
                              </p>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-[11px] text-muted-foreground block font-medium">Amount Due</span>
                            <span className="text-base sm:text-lg font-black text-alarm-red tracking-tight block">
                              {formatCurrency(Math.abs(debt.amount))}
                            </span>
                          </div>
                        </div>

                        {/* Bottom Row: Quick Settle Action */}
                        <div className="pt-2 border-t border-border/50 flex items-center justify-between gap-2">
                          <span className="text-[11px] text-muted-foreground flex items-center gap-1 truncate">
                            <Sparkles className="h-3 w-3 text-lime-voltage shrink-0" />
                            <span>Instant settle with VietQR</span>
                          </span>

                          <Button
                            size="sm"
                            onClick={() => handleOpenSettle(debt.toUser, Math.abs(debt.amount))}
                            className="rounded-full bg-forest-ink text-paper hover:bg-forest-ink/90 dark:bg-lime-voltage dark:text-forest-ink text-xs font-bold h-8 px-4 shadow-xs gap-1.5 transition-transform active:scale-95 shrink-0"
                          >
                            <CreditCard className="h-3.5 w-3.5" />
                            <span>Settle Up</span>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Column 2: Debts owed to you */}
            {(balanceFilter === "ALL" || balanceFilter === "RECEIVE") && (
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-1">
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-lime-voltage flex items-center gap-1.5">
                    <ArrowDownLeft className="h-4 w-4 stroke-[2.5]" />
                    Owed to You ({debtsOwedToMe.length})
                  </span>
                  <span className="text-xs font-extrabold text-emerald-700 dark:text-lime-voltage">
                    Total: {formatCurrency(totalOwedToMe)}
                  </span>
                </div>

                {debtsOwedToMe.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border/80 p-6 text-center text-xs text-muted-foreground bg-muted/20">
                    <CheckCircle2 className="h-6 w-6 text-emerald-500 mx-auto mb-2" />
                    No members currently owe you money in this group.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {debtsOwedToMe.map((debt) => (
                      <div
                        key={debt.id}
                        className="rounded-2xl border border-border/80 bg-background hover:border-emerald-500/50 hover:shadow-md transition-all p-4 space-y-3 shadow-2xs group"
                      >
                        {/* Top Row: Flow direction & Status Pill */}
                        <div className="flex items-center justify-between gap-2 pb-2 border-b border-border/50">
                          <div className="flex items-center gap-1.5 text-xs">
                            <span className="font-extrabold text-foreground truncate max-w-[130px] sm:max-w-[170px]">
                              {debt.fromUser?.fullName || "Member"}
                            </span>
                            <ArrowRight className="h-3.5 w-3.5 text-emerald-600 dark:text-lime-voltage shrink-0" />
                            <span className="font-medium text-muted-foreground">Owes</span>
                            <span className="font-extrabold text-foreground">You</span>
                          </div>

                          <Badge className="bg-linen-mist text-forest-ink dark:bg-card dark:text-lime-voltage dark:border dark:border-lime-voltage/30 rounded-full px-2.5 py-0.5 text-[10px] font-bold shrink-0 shadow-none">
                            Pending Reimbursement
                          </Badge>
                        </div>

                        {/* Middle Row: Debtor profile + Amount */}
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <Avatar className="h-10 w-10 border border-border shrink-0">
                              <AvatarImage src={debt.fromUser?.avatar} alt={debt.fromUser?.fullName} />
                              <AvatarFallback className="bg-linen-mist text-forest-ink text-xs font-bold">
                                {getInitials(debt.fromUser?.fullName)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-foreground truncate">
                                {debt.fromUser?.fullName || "Member"}
                              </p>
                              <p className="text-[11px] text-muted-foreground truncate">
                                {debt.fromUser?.email || "Group participant"}
                              </p>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-[11px] text-muted-foreground block font-medium">To Receive</span>
                            <span className="text-base sm:text-lg font-black text-forest-ink dark:text-lime-voltage tracking-tight block">
                              {formatCurrency(Math.abs(debt.amount))}
                            </span>
                          </div>
                        </div>

                        {/* Bottom Row: Remind Action */}
                        <div className="pt-2 border-t border-border/50 flex items-center justify-between gap-2">
                          <span className="text-[11px] text-muted-foreground truncate">
                            Waiting for member settlement
                          </span>

                          <Button
                            variant="outline"
                            size="sm"
                            disabled={remindingDebtIds.has(debt.id)}
                            onClick={() =>
                              handleRemindDebt(
                                debt.id,
                                debt.fromUser?.fullName || "thành viên"
                              )
                            }
                            className="rounded-full border-border/80 hover:bg-muted text-foreground text-xs font-semibold h-8 px-4 gap-1.5 transition-transform active:scale-95 shrink-0 hover:border-lime-voltage/50"
                          >
                            {remindingDebtIds.has(debt.id) ? (
                              <>
                                <Loader2 className="h-3 w-3 animate-spin text-lime-voltage" />
                                <span>Đang gửi...</span>
                              </>
                            ) : (
                              <>
                                <Send className="h-3 w-3 text-forest-ink dark:text-lime-voltage" />
                                <span>Nhắc nợ</span>
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* =========================================================================
          SECTION 3: EXPENSES LIST & SPLIT BREAKDOWN (Giao dịch & Chia tiền)
          ========================================================================= */}
      <div className="rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-sm space-y-5">
        {/* Header & Toolbars */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-foreground tracking-tight flex items-center gap-2">
              <Receipt className="h-5 w-5 text-forest-ink dark:text-lime-voltage" />
              Expense Ledger &amp; Breakdown
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Review all group purchases and inspect exact split proportions
            </p>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-60">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search expense..."
                className="rounded-full pl-8 h-9 text-xs bg-background"
              />
            </div>

            {/* Split Strategy Filter Tabs */}
            <Tabs value={strategyFilter} onValueChange={setStrategyFilter}>
              <TabsList className="rounded-full bg-muted p-1 h-9">
                <TabsTrigger
                  value="ALL"
                  className="rounded-full text-xs font-semibold px-3 data-[state=active]:bg-forest-ink data-[state=active]:text-lime-voltage dark:data-[state=active]:bg-lime-voltage dark:data-[state=active]:text-forest-ink"
                >
                  All
                </TabsTrigger>
                <TabsTrigger
                  value="EQUALLY"
                  className="rounded-full text-xs font-semibold px-3 data-[state=active]:bg-forest-ink data-[state=active]:text-lime-voltage dark:data-[state=active]:bg-lime-voltage dark:data-[state=active]:text-forest-ink"
                >
                  Equally
                </TabsTrigger>
                <TabsTrigger
                  value="PERCENTAGE"
                  className="rounded-full text-xs font-semibold px-3 data-[state=active]:bg-forest-ink data-[state=active]:text-lime-voltage dark:data-[state=active]:bg-lime-voltage dark:data-[state=active]:text-forest-ink"
                >
                  %
                </TabsTrigger>
                <TabsTrigger
                  value="EXACTLY"
                  className="rounded-full text-xs font-semibold px-3 data-[state=active]:bg-forest-ink data-[state=active]:text-lime-voltage dark:data-[state=active]:bg-lime-voltage dark:data-[state=active]:text-forest-ink"
                >
                  Exact
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Secondary Filter Bar: Payer, Date Presets & Date Pickers */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border/40">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Payer Filter Select */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap flex items-center">
                <Filter className="h-3 w-3 mr-1" />
                Người chi:
              </span>
              <Select value={payerFilter} onValueChange={setPayerFilter}>
                <SelectTrigger className="rounded-full text-xs font-semibold h-8 w-40 sm:w-48 bg-background border-border/80">
                  <SelectValue placeholder="Tất cả người chi" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl shadow-xl">
                  <SelectItem value="ALL">Tất cả người chi</SelectItem>
                  {payersList.map((p) => (
                    <SelectItem key={`payer-${p.id}`} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Range Presets */}
            <div className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground mr-1" />
              <div className="inline-flex items-center gap-1 p-0.5 rounded-full bg-muted/70 border border-border/60">
                {(
                  [
                    { key: "ALL", label: "Tất cả ngày" },
                    { key: "TODAY", label: "Hôm nay" },
                    { key: "7DAYS", label: "7 ngày" },
                    { key: "THIS_MONTH", label: "Tháng này" },
                    { key: "CUSTOM", label: "Tùy chọn" },
                  ] as const
                ).map((preset) => (
                  <button
                    key={preset.key}
                    type="button"
                    onClick={() => setDatePreset(preset.key)}
                    className={cn(
                      "rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all cursor-pointer",
                      datePreset === preset.key
                        ? "bg-forest-ink text-paper dark:bg-lime-voltage dark:text-forest-ink shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Date Pickers */}
            {datePreset === "CUSTOM" && (
              <div className="flex items-center gap-1.5 animate-in fade-in duration-200">
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="rounded-full h-8 text-xs px-2.5 bg-background w-32 border-border/80"
                  placeholder="Từ ngày"
                />
                <span className="text-xs text-muted-foreground">-</span>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="rounded-full h-8 text-xs px-2.5 bg-background w-32 border-border/80"
                  placeholder="Đến ngày"
                />
              </div>
            )}
          </div>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetFilters}
              className="rounded-full text-xs text-muted-foreground hover:text-foreground h-8 px-3 gap-1"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Đặt lại</span>
            </Button>
          )}
        </div>

        {/* Expenses Table/Cards */}
        {isLoading ? (
          <div className="space-y-3 py-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-20 w-full animate-pulse rounded-2xl bg-muted/40 border border-border/40"
              />
            ))}
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="py-12 text-center rounded-2xl border border-dashed border-border bg-muted/10 space-y-3">
            <Receipt className="h-10 w-10 text-muted-foreground mx-auto" />
            <h4 className="text-base font-bold text-foreground">No Transactions Found</h4>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              {searchQuery
                ? `No transactions matching "${searchQuery}"`
                : "No expenses logged in this group yet. Click below to add the first one!"}
            </p>
            <Button
              onClick={() => setIsAddExpenseOpen(true)}
              className="rounded-full bg-lime-voltage text-forest-ink hover:bg-lime-400 font-bold text-xs"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Add First Expense
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTransactions.map((tx) => {
              const isPayer = String(tx.payer?.id) === String(currentUserId)
              const strategy = tx.splitStrategy?.toUpperCase() || "EQUALLY"
              const splits = tx.transactionSplits || []

              return (
                <div
                  key={tx.id}
                  className="group rounded-2xl border border-border/80 bg-background p-4 sm:p-5 hover:border-forest-ink/40 dark:hover:border-lime-voltage/40 transition-all shadow-2xs hover:shadow-md"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Left: Payer info + Description + Tags */}
                    <div className="flex items-start gap-3.5 min-w-0">
                      <Avatar className="h-11 w-11 border border-border/80 flex-shrink-0 mt-0.5">
                        <AvatarImage src={tx.payer?.avatar} alt={tx.payer?.fullName} />
                        <AvatarFallback className="bg-forest-ink text-lime-voltage font-bold text-xs">
                          {getInitials(tx.payer?.fullName)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-base font-bold text-foreground tracking-tight truncate">
                            {tx.description || "Expense Transaction"}
                          </h4>
                          {/* Split Strategy Badge */}
                          <Badge
                            className={cn(
                              "rounded-full text-[10px] font-bold px-2 py-0.5",
                              strategy === "EQUALLY" && "bg-linen-mist text-forest-ink dark:bg-card dark:text-lime-voltage dark:border dark:border-lime-voltage/40",
                              strategy === "PERCENTAGE" && "bg-blue-100 text-signal-blue dark:bg-card dark:text-blue-400 dark:border dark:border-blue-500/40",
                              strategy === "EXACTLY" && "bg-amber-100 text-amber-900 dark:bg-card dark:text-amber-400 dark:border dark:border-amber-500/40"
                            )}
                          >
                            {strategy}
                          </Badge>

                          {tx.task && (
                            <Badge variant="outline" className="rounded-full text-[10px] border-border text-muted-foreground">
                              Task: {tx.task.title}
                            </Badge>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          <span>
                            Paid by <strong className="text-foreground">{isPayer ? "You" : tx.payer?.fullName}</strong>
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(tx.createdAt).toLocaleDateString("vi-VN", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            })}
                          </span>
                          {tx.ProofUrl && (
                            <>
                              <span>•</span>
                              <button
                                type="button"
                                onClick={() => setViewingProofUrl(tx.ProofUrl || null)}
                                className="text-forest-ink dark:text-lime-voltage font-semibold hover:underline flex items-center gap-1"
                              >
                                <FileText className="h-3 w-3" />
                                View Receipt
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Amount + Split preview + Actions */}
                    <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-border/60">
                      <div className="text-left sm:text-right">
                        <span className="text-lg sm:text-xl font-black text-foreground tracking-tight block">
                          {formatCurrency(tx.amount)}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          Split among {splits.length} member{splits.length === 1 ? "" : "s"}
                        </span>
                      </div>

                      {/* Dropdown action */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full hover:bg-muted"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40 rounded-2xl p-1.5 shadow-lg">
                          {tx.ProofUrl && (
                            <DropdownMenuItem
                              onClick={() => setViewingProofUrl(tx.ProofUrl || null)}
                              className="rounded-xl cursor-pointer text-xs gap-2 py-2"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              View Receipt
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => handleDeleteExpense(tx.id)}
                            className="rounded-xl cursor-pointer text-xs gap-2 py-2 text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete Expense
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Splitters Pill Strip */}
                  {splits.length > 0 && (
                    <div className="mt-3.5 pt-3 border-t border-border/40 flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-semibold text-muted-foreground mr-1">
                        Splits:
                      </span>
                      {splits.map((s, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-1.5 rounded-full bg-muted/60 px-2.5 py-1 text-[11px] border border-border/50"
                        >
                          <span className="font-semibold text-foreground">
                            {s.debtor?.fullName || "Member"}:
                          </span>
                          <span className="font-bold text-forest-ink dark:text-lime-voltage">
                            {formatCurrency(s.owedAmount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-full text-xs font-semibold px-4"
            >
              Previous
            </Button>
            <span className="text-xs text-muted-foreground font-medium">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-full text-xs font-semibold px-4"
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {/* =========================================================================
          MODALS
          ========================================================================= */}
      {/* Quick Add Expense Modal */}
      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onOpenChange={setIsAddExpenseOpen}
        groupId={String(groupId)}
        onSuccess={() => {
          setIsAddExpenseOpen(false)
          getTransactionsByGroupId.refetch()
          myGroupDebts.refetch()
          groupDebtThatIAmOwed.refetch()
        }}
      />

      {/* Quick Settle Up Modal */}
      <QuickSettleUpModal
        isOpen={isSettleModalOpen}
        onOpenChange={setIsSettleModalOpen}
        groupId={groupId}
        recipient={selectedRecipient}
        debtAmount={selectedDebtAmount}
        onSuccess={() => {
          setIsSettleModalOpen(false)
          myGroupDebts.refetch()
          groupDebtThatIAmOwed.refetch()
          getTransactionsByGroupId.refetch()
        }}
      />

      {/* Receipt Proof Preview Dialog */}
      <Dialog open={!!viewingProofUrl} onOpenChange={(open) => !open && setViewingProofUrl(null)}>
        <DialogContent className="max-w-xl rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Transaction Receipt Proof</DialogTitle>
          </DialogHeader>
          <div className="mt-2 rounded-2xl overflow-hidden border border-border bg-black/5 flex items-center justify-center max-h-[70vh]">
            {viewingProofUrl && (
              <img
                src={viewingProofUrl}
                alt="Receipt proof"
                className="max-h-[65vh] w-auto object-contain"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}