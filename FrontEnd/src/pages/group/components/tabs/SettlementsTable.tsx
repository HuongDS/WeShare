import { useMemo, useState } from "react"
import { Bell, CreditCard, Eye, Search, Loader2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  useGetGroupDebtThatIAmOwed,
  useGetMyGroupDebts,
} from "@/hooks/groupDebt/useGroupDebt"
import { useAppSelector } from "@/store/hooks"
import { groupDebtApi } from "@/api/groupDebtApi"
import { toast } from "sonner"

interface SettlementsTableProps {
  groupId: number
  onViewDetails: (debtData: SettlementDebtDetails) => void
}

export type SettlementDebtDetails = {
  payerId: string | number
  memberName: string
}

type CombinedDebtItem = {
  id: string
  debt: {
    id: number
    amount: number
    fromUser: {
      id: string
      fullName: string
      avatar?: string
    }
    toUser: {
      id: string
      fullName: string
      avatar?: string
    }
  }
  variant: "owed" | "receivable"
  member: {
    id: string
    fullName: string
    avatar?: string
  }
}

const formatCurrencyVND = (value: number): string => {
  return `${value.toLocaleString("vi-VN")} ₫`
}

const getInitials = (name?: string) => {
  if (!name) return "U"
  const parts = name.trim().split(/\s+/).filter(Boolean)
  const initials = parts.slice(0, 2).map((part) => part[0]?.toUpperCase())
  return initials.join("") || "U"
}

export default function SettlementsTable({
  groupId,
  onViewDetails,
}: SettlementsTableProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [remindingDebtIds, setRemindingDebtIds] = useState<Set<number>>(new Set())
  const { myGroupDebts } = useGetMyGroupDebts(groupId)
  const { groupDebtThatIAmOwed } = useGetGroupDebtThatIAmOwed(groupId)
  const currentUserId = useAppSelector((state) => state.auth.user?.userId)

  const handleRemindDebt = async (debtId: number, memberName: string) => {
    setRemindingDebtIds((prev) => new Set(prev).add(debtId))
    try {
      await groupDebtApi.remindDebt(debtId)
      toast.success(`Đã gửi lời nhắc nợ tới ${memberName}!`)
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


  const isLoading = myGroupDebts.isLoading || groupDebtThatIAmOwed.isLoading
  const combinedDebts: CombinedDebtItem[] = useMemo(() => {
    const myDebts = myGroupDebts.data?.data || []
    const owedToMe = groupDebtThatIAmOwed.data?.data || []
    return [
      ...myDebts.map((debt) => ({
        id: `owed-${debt.id}`,
        debt,
        variant: "owed" as const,
        member: debt.toUser,
      })),
      ...owedToMe.map((debt) => ({
        id: `receivable-${debt.id}`,
        debt,
        variant: "receivable" as const,
        member: debt.fromUser,
      })),
    ]
  }, [myGroupDebts.data?.data, groupDebtThatIAmOwed.data?.data])

  const filteredDebts = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()
    if (!normalizedQuery) return combinedDebts
    return combinedDebts.filter((item) =>
      item.member?.fullName?.toLowerCase().includes(normalizedQuery)
    )
  }, [combinedDebts, searchQuery])

  const handleDetailsClick = (item: CombinedDebtItem) => {
    const payerId =
      item.variant === "owed" ? item.member?.id : currentUserId || ""
    if (!payerId) return
    onViewDetails({
      payerId,
      memberName: item.member?.fullName || "Thành viên",
    })
  }

  return (
    <Card className="border border-border/70 bg-white">
      <CardHeader>
        <CardTitle>Quyết toán &amp; Công nợ</CardTitle>
        <CardDescription>
          Theo dõi các khoản bạn đang nợ và các khoản người khác nợ bạn trong nhóm.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Tìm kiếm thành viên..."
            className="pl-9"
          />
        </div>

        <TooltipProvider>
          <div className="rounded-lg border border-border/60">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Thành viên</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Số tiền</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }, (_, index) => (
                    <TableRow key={`loading-${index}`}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 animate-pulse rounded-full bg-muted" />
                          <div className="h-4 w-36 animate-pulse rounded bg-muted" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="h-5 w-20 animate-pulse rounded bg-muted" />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="ml-auto h-4 w-24 animate-pulse rounded bg-muted" />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="ml-auto h-8 w-24 animate-pulse rounded bg-muted" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : filteredDebts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-8 text-center">
                      Không có công nợ nào
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDebts.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar size="sm">
                            <AvatarImage
                              src={item.member?.avatar || ""}
                              alt={item.member?.fullName}
                            />
                            <AvatarFallback>
                              {getInitials(item.member?.fullName)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-foreground">
                            {item.member?.fullName || "Thành viên"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {item.variant === "owed" ? (
                          <Badge variant="destructive">Bạn nợ</Badge>
                        ) : (
                          <Badge className="bg-emerald-100 text-emerald-800">
                            Nợ bạn
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrencyVND(Math.abs(item.debt.amount))}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {item.variant === "owed" ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="icon"
                                  className="h-8 w-8 rounded-full bg-emerald-600 text-white hover:bg-emerald-700"
                                >
                                  <CreditCard className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Quyết toán ngay</TooltipContent>
                            </Tooltip>
                          ) : (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="icon"
                                  variant="outline"
                                  disabled={remindingDebtIds.has(item.debt.id)}
                                  onClick={() =>
                                    handleRemindDebt(
                                      item.debt.id,
                                      item.debt.fromUser?.fullName || "thành viên"
                                    )
                                  }
                                  className="h-8 w-8 rounded-full border-border hover:bg-muted hover:border-lime-voltage/50"
                                >
                                  {remindingDebtIds.has(item.debt.id) ? (
                                    <Loader2 className="h-4 w-4 animate-spin text-lime-voltage" />
                                  ) : (
                                    <Bell className="h-4 w-4 text-forest-ink dark:text-lime-voltage" />
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Nhắc nợ</TooltipContent>
                            </Tooltip>
                          )}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleDetailsClick(item)}
                                className="h-8 w-8 rounded-full"
                              >
                                <Eye className="h-4 w-4 text-muted-foreground" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Xem chi tiết công nợ</TooltipContent>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  )
}
