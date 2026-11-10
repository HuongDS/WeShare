import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { KeyRound, Sparkles, ArrowRight, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { groupApi } from "@/api/groupApi"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

interface JoinGroupModalProps {
  isOpen: boolean
  onClose: () => void
  initialCode?: string
}

export default function JoinGroupModal({
  isOpen,
  onClose,
  initialCode = "",
}: JoinGroupModalProps) {
  const [inviteCode, setInviteCode] = useState<string>(initialCode)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (initialCode) {
      setInviteCode(initialCode)
    }
  }, [initialCode])

  const handleJoin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const trimmed = inviteCode.trim()
    if (!trimmed) {
      toast.error("Vui lòng nhập mã mời.")
      return
    }

    setIsLoading(true)
    try {
      const res = await groupApi.joinByInviteCode(trimmed)
      toast.success(`Tham gia nhóm "${res.data.name}" thành công!`)
      await queryClient.invalidateQueries({ queryKey: ["groups"] })
      onClose()
      navigate(`/groups/${res.data.id}`)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(
        error.response?.data?.message || "Không thể tham gia nhóm bằng mã này."
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md rounded-3xl p-6 bg-card border-border shadow-2xl">
        <DialogHeader className="space-y-1.5 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-lime-voltage/20 text-forest-ink dark:text-lime-voltage">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-foreground">
                Tham gia nhóm bằng mã mời
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Nhập mã mời được bạn bè chia sẻ để tham gia nhóm ngay
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleJoin} className="space-y-4 pt-2">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-lime-voltage" />
              <span>Mã mời (Ví dụ: WS-A1B2C3D4)</span>
            </label>
            <Input
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              placeholder="Nhập mã mời tại đây..."
              className="rounded-full text-center font-mono font-bold tracking-wider uppercase h-11 text-base bg-muted/40 border-border/80 focus:border-forest-ink dark:focus:border-lime-voltage"
              autoFocus
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="rounded-full text-xs font-semibold px-4 h-9"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !inviteCode.trim()}
              className="rounded-full bg-lime-voltage hover:bg-lime-voltage/90 text-forest-ink font-bold text-xs px-5 h-9 gap-1.5 shadow-xs"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Đang tham gia...</span>
                </>
              ) : (
                <>
                  <span>Tham gia nhóm</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
