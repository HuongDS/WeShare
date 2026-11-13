import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  PieChart,
  BarChart3,
  FileSpreadsheet,
  FileText,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { reportApi } from "@/api/reportApi"
import { formatCurrency } from "@/lib/utils"
import { toast } from "sonner"

interface GroupExpenseAnalyticsSectionProps {
  groupId: number
  groupName?: string
}

const CHART_COLORS = [
  "#9FE870", // Lime Voltage
  "#163300", // Forest Ink
  "#10b981", // Emerald 500
  "#0ea5e9", // Sky 500
  "#f59e0b", // Amber 500
  "#8b5cf6", // Violet 500
  "#ec4899", // Pink 500
  "#64748b", // Slate 500
]

export default function GroupExpenseAnalyticsSection({
  groupId,
  groupName,
}: GroupExpenseAnalyticsSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [exportingFormat, setExportingFormat] = useState<"xlsx" | "pdf" | null>(
    null
  )

  const { data: analyticsRes, isLoading } = useQuery({
    queryKey: ["groupAnalytics", groupId],
    queryFn: () => reportApi.getGroupAnalytics(groupId),
    enabled: Boolean(groupId),
  })

  const analytics = analyticsRes?.data
  const categories = analytics?.byCategory || []
  const members = analytics?.byMember || []
  const totalSpending = analytics?.totalSpending || 0

  const handleExport = async (format: "xlsx" | "pdf") => {
    setExportingFormat(format)
    try {
      await reportApi.exportGroupReport(groupId, format, groupName)
      toast.success(
        `Đã xuất báo cáo ${format === "xlsx" ? "Excel (.xlsx)" : "PDF (.pdf)"} thành công!`
      )
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(
        error.response?.data?.message || "Không thể xuất báo cáo chi tiêu."
      )
    } finally {
      setExportingFormat(null)
    }
  }

  // Build SVG Donut segments
  const radius = 64
  const circumference = 2 * Math.PI * radius
  let cumulativePercent = 0

  const pieSegments = categories.map((cat, idx) => {
    const pct = totalSpending > 0 ? cat.amount / totalSpending : 0
    const strokeDasharray = `${pct * circumference} ${circumference}`
    const strokeDashoffset = -cumulativePercent * circumference
    cumulativePercent += pct

    return {
      ...cat,
      pct,
      color: CHART_COLORS[idx % CHART_COLORS.length],
      strokeDasharray,
      strokeDashoffset,
    }
  })

  const maxMemberValue = Math.max(
    1,
    ...members.map((m) => Math.max(m.paid, m.share))
  )

  return (
    <div className="rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-sm space-y-5">
      {/* Header & Export Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-lime-voltage/20 text-forest-ink dark:text-lime-voltage">
            <PieChart className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-foreground tracking-tight">
                Thống kê &amp; Báo cáo Chi tiêu
              </h3>
              <Badge
                variant="secondary"
                className="rounded-full text-[11px] font-bold px-2.5 py-0.5"
              >
                {analytics?.transactionCount || 0} khoản chi
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Phân tích tỷ trọng theo hạng mục, mức chi từng thành viên và xuất
              file đối soát
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={exportingFormat !== null}
            onClick={() => handleExport("xlsx")}
            className="rounded-full border-border/80 hover:bg-emerald-500/10 hover:border-emerald-500/50 text-xs font-semibold h-9 px-4 gap-1.5"
          >
            {exportingFormat === "xlsx" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-600" />
            ) : (
              <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
            )}
            <span>Xuất Excel (.xlsx)</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={exportingFormat !== null}
            onClick={() => handleExport("pdf")}
            className="rounded-full border-border/80 hover:bg-rose-500/10 hover:border-rose-500/50 text-xs font-semibold h-9 px-4 gap-1.5"
          >
            {exportingFormat === "pdf" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-rose-600" />
            ) : (
              <FileText className="h-3.5 w-3.5 text-rose-600" />
            )}
            <span>Xuất PDF (.pdf)</span>
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="rounded-full"
            title={isExpanded ? "Thu gọn biểu đồ" : "Mở rộng biểu đồ"}
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Charts Body */}
      {isExpanded && (
        <>
          {isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-2">
              <div className="h-64 rounded-2xl bg-muted/40 animate-pulse border border-border/40" />
              <div className="h-64 rounded-2xl bg-muted/40 animate-pulse border border-border/40" />
            </div>
          ) : totalSpending <= 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-muted/10 p-8 text-center">
              <p className="text-sm font-semibold text-foreground">
                Chưa có dữ liệu chi tiêu để hiển thị biểu đồ
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Hãy thêm khoản chi tiêu đầu tiên của nhóm để xem biểu đồ phân
                tích tỷ trọng.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-2">
              {/* LEFT: PIE / DONUT CHART BY CATEGORY */}
              <div className="rounded-2xl border border-border/80 bg-background/60 p-5 flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <PieChart className="h-4 w-4 text-forest-ink dark:text-lime-voltage" />
                    <h4 className="text-sm font-bold text-foreground">
                      Tỷ trọng theo Hạng mục / Công việc
                    </h4>
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">
                    {categories.length} hạng mục
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-6 py-2">
                  {/* Donut SVG */}
                  <div className="relative h-44 w-44 shrink-0 flex items-center justify-center">
                    <svg
                      viewBox="0 0 160 160"
                      className="h-44 w-44 -rotate-90 transform"
                    >
                      <circle
                        cx="80"
                        cy="80"
                        r={radius}
                        fill="transparent"
                        stroke="currentColor"
                        strokeWidth="22"
                        className="text-muted/30"
                      />
                      {pieSegments.map((seg, i) => (
                        <circle
                          key={`pie-seg-${i}`}
                          cx="80"
                          cy="80"
                          r={radius}
                          fill="transparent"
                          stroke={seg.color}
                          strokeWidth="22"
                          strokeDasharray={seg.strokeDasharray}
                          strokeDashoffset={seg.strokeDashoffset}
                          className="transition-all duration-500"
                        />
                      ))}
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Tổng chi
                      </span>
                      <span className="text-xs sm:text-sm font-black text-foreground leading-tight mt-0.5">
                        {formatCurrency(totalSpending)}
                      </span>
                    </div>
                  </div>

                  {/* Category Legend */}
                  <div className="flex-1 w-full space-y-2.5 max-h-48 overflow-y-auto pr-1">
                    {pieSegments.map((seg, i) => (
                      <div
                        key={`legend-${i}`}
                        className="flex items-center justify-between gap-2 text-xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className="h-3 w-3 rounded-full shrink-0"
                            style={{ backgroundColor: seg.color }}
                          />
                          <span className="font-semibold text-foreground truncate">
                            {seg.label}
                          </span>
                          <span className="text-[11px] text-muted-foreground shrink-0">
                            ({seg.count})
                          </span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-bold text-foreground">
                            {formatCurrency(seg.amount)}
                          </span>
                          <span className="text-[11px] text-muted-foreground ml-1.5">
                            ({(seg.pct * 100).toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* RIGHT: BAR CHART BY MEMBER */}
              <div className="rounded-2xl border border-border/80 bg-background/60 p-5 flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-forest-ink dark:text-lime-voltage" />
                    <h4 className="text-sm font-bold text-foreground">
                      So sánh Mức chi giữa các Thành viên
                    </h4>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] font-semibold">
                    <span className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-lime-voltage border border-forest-ink/20" />
                      Đã chi trả
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-sky-500" />
                      Phần phải chịu
                    </span>
                  </div>
                </div>

                <div className="space-y-3.5 max-h-52 overflow-y-auto pr-1">
                  {members.map((member) => {
                    const paidWidth = Math.max(
                      2,
                      Math.round((member.paid / maxMemberValue) * 100)
                    )
                    const shareWidth = Math.max(
                      2,
                      Math.round((member.share / maxMemberValue) * 100)
                    )

                    return (
                      <div key={member.userId} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-foreground truncate max-w-[160px]">
                            {member.fullName}
                          </span>
                          <div className="flex items-center gap-3 text-[11px]">
                            <span className="font-semibold text-emerald-700 dark:text-lime-voltage">
                              Chi: {formatCurrency(member.paid)}
                            </span>
                            <span className="font-semibold text-sky-600 dark:text-sky-400">
                              Chịu: {formatCurrency(member.share)}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-1">
                          {/* Paid Bar */}
                          <div className="h-2.5 w-full rounded-full bg-muted/50 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-lime-voltage transition-all duration-500"
                              style={{ width: `${paidWidth}%` }}
                            />
                          </div>
                          {/* Share Bar */}
                          <div className="h-2 w-full rounded-full bg-muted/50 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-sky-500 transition-all duration-500"
                              style={{ width: `${shareWidth}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
