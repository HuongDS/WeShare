import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  Search,
  Users,
  Calendar,
  CheckSquare,
  Receipt,
  ArrowRight,
  Loader2,
  X,
  Home,
  Settings,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import { useGlobalSearch } from "@/hooks/user/useUser"
import { formatCurrency } from "@/lib/utils"

interface GlobalSearchModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function GlobalSearchModal({
  open,
  onOpenChange,
}: GlobalSearchModalProps) {
  const [query, setQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const navigate = useNavigate()

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query.trim())
    }, 250)
    return () => clearTimeout(handler)
  }, [query])

  const { data: searchRes, isLoading } = useGlobalSearch(debouncedQuery)
  const results = searchRes?.data

  const hasGroups = (results?.groups?.length ?? 0) > 0
  const hasEvents = (results?.events?.length ?? 0) > 0
  const hasTasks = (results?.tasks?.length ?? 0) > 0
  const hasExpenses = (results?.expenses?.length ?? 0) > 0
  const hasMembers = (results?.members?.length ?? 0) > 0

  const hasAnyResults =
    hasGroups || hasEvents || hasTasks || hasExpenses || hasMembers

  const handleSelect = (url: string) => {
    navigate(url)
    onOpenChange(false)
    setQuery("")
  }

  // Clear query on close
  useEffect(() => {
    if (!open) {
      setQuery("")
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-2xl p-0 overflow-hidden rounded-3xl border-border bg-card shadow-2xl top-[20%] translate-y-0"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">Tìm kiếm tổng thể</DialogTitle>

        {/* Search Input Bar */}
        <div className="flex items-center gap-3 border-b border-border px-4 py-3.5">
          <Search className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm kiếm nhóm, sự kiện, công việc, chi tiêu, thành viên..."
            autoFocus
            className="flex-1 bg-transparent text-sm sm:text-base text-foreground placeholder:text-muted-foreground outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          {isLoading && (
            <Loader2 className="h-4 w-4 animate-spin text-lime-voltage" />
          )}
          <kbd className="hidden sm:inline-block rounded-md border border-border bg-muted/60 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
            ESC
          </kbd>
        </div>

        {/* Results Container */}
        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-4">
          {/* Quick Shortcuts when Query is Empty */}
          {!debouncedQuery && (
            <div className="space-y-2 p-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Điều hướng nhanh
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleSelect("/dashboard")}
                  className="flex items-center gap-2.5 rounded-2xl border border-border/70 p-3 text-left hover:border-lime-voltage/50 hover:bg-muted/40 transition-all"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-lime-voltage/20 text-forest-ink dark:text-lime-voltage">
                    <Home className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">Bảng điều khiển</p>
                    <p className="text-[10px] text-muted-foreground">Tổng quan tài chính</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelect("/groups")}
                  className="flex items-center gap-2.5 rounded-2xl border border-border/70 p-3 text-left hover:border-lime-voltage/50 hover:bg-muted/40 transition-all"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-signal-blue dark:bg-blue-950/40 dark:text-blue-300">
                    <Users className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">Nhóm &amp; Dự án</p>
                    <p className="text-[10px] text-muted-foreground">Các nhóm tham gia</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelect("/profile")}
                  className="flex items-center gap-2.5 rounded-2xl border border-border/70 p-3 text-left hover:border-lime-voltage/50 hover:bg-muted/40 transition-all"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-foreground">
                    <Settings className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">Cài đặt</p>
                    <p className="text-[10px] text-muted-foreground">Hồ sơ &amp; Ngân hàng</p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Empty State when no results found */}
          {debouncedQuery && !isLoading && !hasAnyResults && (
            <div className="py-12 text-center">
              <p className="text-sm font-bold text-foreground">
                Không tìm thấy kết quả phù hợp
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Không tìm thấy dữ liệu nào khớp với &quot;{debouncedQuery}&quot;. Vui lòng thử từ khóa khác.
              </p>
            </div>
          )}

          {/* Groups Results */}
          {hasGroups && (
            <div className="space-y-1">
              <p className="px-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Nhóm &amp; Không gian
              </p>
              <div className="space-y-1">
                {results!.groups.map((group) => (
                  <button
                    key={group.id}
                    type="button"
                    onClick={() => handleSelect(`/groups/${group.id}`)}
                    className="flex w-full items-center justify-between rounded-2xl px-3 py-2.5 text-left hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-lime-voltage/20 text-forest-ink dark:text-lime-voltage flex-shrink-0">
                        <Users className="h-4 w-4" />
                      </div>
                      <div className="truncate">
                        <p className="text-xs sm:text-sm font-bold text-foreground truncate">
                          {group.name}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          Nhóm {group.type} • {group.memberCount} thành viên
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Events Results */}
          {hasEvents && (
            <div className="space-y-1">
              <p className="px-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Sự kiện
              </p>
              <div className="space-y-1">
                {results!.events.map((event) => (
                  <button
                    key={event.id}
                    type="button"
                    onClick={() => handleSelect(`/groups/${event.groupId}?tab=events`)}
                    className="flex w-full items-center justify-between rounded-2xl px-3 py-2.5 text-left hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-signal-blue dark:bg-blue-950/40 dark:text-blue-300 flex-shrink-0">
                        <Calendar className="h-4 w-4" />
                      </div>
                      <div className="truncate">
                        <p className="text-xs sm:text-sm font-bold text-foreground truncate">
                          {event.name}
                        </p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          thuộc {event.groupName} {event.location ? `• ${event.location}` : ""}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tasks Results */}
          {hasTasks && (
            <div className="space-y-1">
              <p className="px-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Công việc
              </p>
              <div className="space-y-1">
                {results!.tasks.map((task) => (
                  <button
                    key={task.id}
                    type="button"
                    onClick={() => handleSelect(`/groups/${task.groupId}?tab=tasks`)}
                    className="flex w-full items-center justify-between rounded-2xl px-3 py-2.5 text-left hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-forest-ink dark:bg-emerald-950/40 dark:text-lime-voltage flex-shrink-0">
                        <CheckSquare className="h-4 w-4" />
                      </div>
                      <div className="truncate">
                        <p className="text-xs sm:text-sm font-bold text-foreground truncate">
                          {task.title}
                        </p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          thuộc {task.groupName} • Trạng thái: {task.status}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Expenses Results */}
          {hasExpenses && (
            <div className="space-y-1">
              <p className="px-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Khoản chi &amp; Giao dịch
              </p>
              <div className="space-y-1">
                {results!.expenses.map((expense) => (
                  <button
                    key={expense.id}
                    type="button"
                    onClick={() => handleSelect(`/groups/${expense.groupId}?tab=expenses`)}
                    className="flex w-full items-center justify-between rounded-2xl px-3 py-2.5 text-left hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 flex-shrink-0">
                        <Receipt className="h-4 w-4" />
                      </div>
                      <div className="truncate">
                        <p className="text-xs sm:text-sm font-bold text-foreground truncate">
                          {expense.description}
                        </p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {formatCurrency(expense.amount)} • Thanh toán bởi {expense.payerName} trong {expense.groupName}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Members Results */}
          {hasMembers && (
            <div className="space-y-1">
              <p className="px-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Thành viên
              </p>
              <div className="space-y-1">
                {results!.members.map((member) => (
                  <button
                    key={member.userId}
                    type="button"
                    onClick={() => handleSelect(`/groups/${member.groupId}?tab=members`)}
                    className="flex w-full items-center justify-between rounded-2xl px-3 py-2.5 text-left hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {member.avatar ? (
                        <img
                          src={member.avatar}
                          alt={member.fullName}
                          className="h-8 w-8 rounded-full object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-foreground font-bold text-xs flex-shrink-0">
                          {member.fullName[0]?.toUpperCase() || "U"}
                        </div>
                      )}
                      <div className="truncate">
                        <p className="text-xs sm:text-sm font-bold text-foreground truncate">
                          {member.fullName}
                        </p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          Thành viên trong {member.groupName}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between border-t border-border px-4 py-2.5 text-[11px] text-muted-foreground bg-muted/20">
          <span>Mẹo: Nhấn <kbd className="font-semibold text-foreground">ESC</kbd> để đóng</span>
          <span className="font-medium">WeShare Tìm kiếm</span>
        </div>
      </DialogContent>
    </Dialog>
  )
}
