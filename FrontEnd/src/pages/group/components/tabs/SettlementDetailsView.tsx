import { useState } from "react"
import { ArrowLeft, Receipt } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { mapSplitStrategyToBackend_num_to_string } from "@/constants/SplitStrategyEnum"
import { useGetTransactionByPayerId } from "@/hooks/transaction/useTransaction"
import type { SettlementDebtDetails } from "./SettlementsTable"

interface SettlementDetailsViewProps {
  groupId: number
  debtData: SettlementDebtDetails
  onBack: () => void
}

const PAGE_SIZE = 10

const formatCurrencyVND = (value: number): string => {
  return `${value.toLocaleString("vi-VN")} ₫`
}

export default function SettlementDetailsView({
  groupId,
  debtData,
  onBack,
}: SettlementDetailsViewProps) {
  const [page, setPage] = useState(1)

  const shouldFetch = Boolean(debtData.payerId)
  const { transactionsByPayerId } = useGetTransactionByPayerId(
    groupId,
    debtData.payerId,
    PAGE_SIZE,
    page,
    shouldFetch
  )

  const transactions = transactionsByPayerId.data?.data?.items || []
  const totalPages = transactionsByPayerId.data?.data?.totalPages || 1
  const pageIndex = transactionsByPayerId.data?.data?.pageIndex ?? page
  const isLoading = transactionsByPayerId.isLoading

  const canGoBack = pageIndex > 0
  const canGoNext = pageIndex + 1 < totalPages

  const handlePrev = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    if (canGoBack) {
      setPage(pageIndex - 1)
    }
  }

  const handleNext = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    if (canGoNext) {
      setPage(pageIndex + 1)
    }
  }

  return (
    <Card className="border border-border/70 bg-white">
      <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
        <div className="flex flex-wrap items-baseline gap-2">
          <CardTitle>Giao dịch với {debtData.memberName}</CardTitle>
          <CardDescription>
            (Các khoản chi gần đây cấu thành số dư này)
          </CardDescription>
        </div>
        <Button variant="ghost" onClick={onBack} className="shrink-0 gap-2">
          <ArrowLeft className="h-4 w-4" />
          Quay lại
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }, (_, index) => (
              <div
                key={`detail-loading-${index}`}
                className="space-y-2 rounded-lg border border-border/60 p-3"
              >
                <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
                <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              </div>
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="rounded-lg border border-border/60 p-6 text-center text-sm text-muted-foreground">
            Không có giao dịch nào với thành viên này.
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="mb-3 flex items-center justify-between rounded-xl border border-border bg-card p-4 transition-colors hover:bg-accent/30"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Receipt className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-base leading-none font-semibold">
                      {transaction.description || "Khoản chi không tên"}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(transaction.createdAt).toLocaleString("vi-VN", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5 text-right">
                  {transaction.splitStrategy && (
                    <Badge
                      variant="secondary"
                      className="h-5 px-2 py-0 text-[10px] tracking-wider uppercase"
                    >
                      {mapSplitStrategyToBackend_num_to_string(
                        transaction.splitStrategy
                      ) === "EQUALLY"
                        ? "Chia đều"
                        : mapSplitStrategyToBackend_num_to_string(
                            transaction.splitStrategy
                          ) === "EXACTLY"
                        ? "Số tiền chính xác"
                        : "Theo phần trăm"}
                    </Badge>
                  )}
                  <span className="text-base font-bold md:text-lg">
                    {formatCurrencyVND(transaction.amount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={handlePrev}
                  className={!canGoBack ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={handleNext}
                  className={!canGoNext ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </CardContent>
    </Card>
  )
}
