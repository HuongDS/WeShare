import { useState } from "react"
import { CalendarClock, CheckSquare, ExternalLink, ImageIcon } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import type { TransactionViewDto } from "@/types/transaction/TransactionViewDto"
import { formatCurrency } from "@/lib/utils"
import { normalizeDriveImageUrl, getDriveViewerUrl } from "@/lib/driveUrl"

interface ExpenseCardProps {
  expense: TransactionViewDto
}

const formatDate = (value: Date | string) => {
  const date = value instanceof Date ? value : new Date(value)
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date)
}

export default function ExpenseCard({ expense }: ExpenseCardProps) {
  const [isThumbLoading, setIsThumbLoading] = useState(true)
  const [isDialogImageLoading, setIsDialogImageLoading] = useState(true)

  const proofUrl =
    expense.ProofUrl ||
    (expense as TransactionViewDto & { proofUrl?: string }).proofUrl

  return (
    <Card className="border border-border/70 transition-shadow hover:shadow-md">
      <CardHeader className="gap-1">
        <p className="text-sm text-muted-foreground">Người thanh toán</p>
        <p className="text-base font-semibold text-foreground">
          {expense.payer?.fullName || "Không rõ"}
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Tổng tiền</p>
          <p className="text-lg font-semibold text-foreground">
            {formatCurrency(expense.amount)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <CalendarClock className="h-3.5 w-3.5" />
            {formatDate(expense.createdAt)}
          </span>
        </div>
        {expense.description && (
          <p className="text-sm text-muted-foreground">{expense.description}</p>
        )}
        {expense.task && typeof expense.task === "object" && expense.task.title && (
          <div className="flex items-center gap-1.5 pt-0.5 text-xs">
            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 font-medium text-emerald-700 border border-emerald-200">
              <CheckSquare className="h-3 w-3" />
              Công việc: {expense.task.title}
            </span>
          </div>
        )}

        {proofUrl ? (
          <div className="pt-1">
            <p className="mb-2 text-xs text-muted-foreground">Ảnh hóa đơn</p>
            <Dialog>
              <DialogTrigger asChild>
                <button
                  type="button"
                  onClick={() => setIsDialogImageLoading(true)}
                  className="relative h-16 w-16 cursor-zoom-in overflow-hidden rounded-md border"
                  aria-label="Xem ảnh hóa đơn"
                >
                  {isThumbLoading && (
                    <div className="absolute inset-0 animate-pulse bg-muted" />
                  )}
                  <img
                    src={normalizeDriveImageUrl(proofUrl)}
                    alt="Ảnh hóa đơn"
                    className="h-full w-full object-cover"
                    onLoad={() => setIsThumbLoading(false)}
                    onError={() => setIsThumbLoading(false)}
                  />
                </button>
              </DialogTrigger>

              <DialogContent className="max-w-3xl overflow-hidden border-none bg-transparent p-0 shadow-none ring-0">
                <div className="relative">
                  {isDialogImageLoading && (
                    <div className="flex h-[50vh] items-center justify-center bg-black/50">
                      <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    </div>
                  )}
                  <img
                    src={normalizeDriveImageUrl(proofUrl)}
                    alt="Xem chi tiết ảnh hóa đơn"
                    className="h-auto max-h-[85vh] w-full object-contain"
                    onLoad={() => setIsDialogImageLoading(false)}
                    onError={() => setIsDialogImageLoading(false)}
                  />
                  {!proofUrl.startsWith("data:") && (
                    <div className="absolute right-4 bottom-4">
                      <Button
                        asChild
                        size="sm"
                        variant="secondary"
                        className="gap-1.5"
                      >
                        <a
                          href={getDriveViewerUrl(proofUrl)}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Mở trên Google Drive
                        </a>
                      </Button>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <ImageIcon className="h-3.5 w-3.5" />
            Không có ảnh hóa đơn
          </div>
        )}
      </CardContent>
    </Card>
  )
}
