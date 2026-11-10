import { useState, useEffect } from "react"
import { Check, Copy, QrCode, Share2, Sparkles, RefreshCw } from "lucide-react"
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
import { toast } from "sonner"

interface GroupInviteModalProps {
  groupId: number
  groupName: string
  isOpen: boolean
  onClose: () => void
}

export default function GroupInviteModal({
  groupId,
  groupName,
  isOpen,
  onClose,
}: GroupInviteModalProps) {
  const [inviteCode, setInviteCode] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isCopiedLink, setIsCopiedLink] = useState<boolean>(false)
  const [isCopiedCode, setIsCopiedCode] = useState<boolean>(false)

  const inviteUrl = inviteCode
    ? `${window.location.origin}/groups?code=${inviteCode}`
    : ""

  const qrImageUrl = inviteUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
        inviteUrl
      )}`
    : ""

  useEffect(() => {
    if (isOpen && groupId) {
      fetchInviteCode()
    }
  }, [isOpen, groupId])

  const fetchInviteCode = async () => {
    setIsLoading(true)
    try {
      const res = await groupApi.getInviteCode(groupId)
      if (res.data?.inviteCode) {
        setInviteCode(res.data.inviteCode)
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(
        error.response?.data?.message || "Không thể lấy mã mời của nhóm."
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyLink = async () => {
    if (!inviteUrl) return
    try {
      await navigator.clipboard.writeText(inviteUrl)
      setIsCopiedLink(true)
      toast.success("Đã sao chép liên kết mời vào clipboard!")
      setTimeout(() => setIsCopiedLink(false), 2500)
    } catch {
      toast.error("Không thể sao chép liên kết.")
    }
  }

  const handleCopyCode = async () => {
    if (!inviteCode) return
    try {
      await navigator.clipboard.writeText(inviteCode)
      setIsCopiedCode(true)
      toast.success("Đã sao chép mã mời vào clipboard!")
      setTimeout(() => setIsCopiedCode(false), 2500)
    } catch {
      toast.error("Không thể sao chép mã mời.")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md rounded-3xl p-6 bg-card border-border shadow-2xl">
        <DialogHeader className="space-y-1.5 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-lime-voltage/20 text-forest-ink dark:text-lime-voltage">
              <Share2 className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-foreground">
                Mời thành viên tham gia
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Nhóm: <span className="font-semibold text-foreground">{groupName}</span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3">
            <RefreshCw className="h-6 w-6 animate-spin text-lime-voltage" />
            <p className="text-xs text-muted-foreground font-medium">
              Đang tạo mã mời...
            </p>
          </div>
        ) : (
          <div className="space-y-5 pt-2">
            {/* Invite Code Showcase */}
            <div className="rounded-2xl border border-border/80 bg-muted/40 p-4 text-center space-y-2">
              <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground font-medium">
                <Sparkles className="h-3.5 w-3.5 text-lime-voltage" />
                <span>Mã mời công khai</span>
              </div>
              <div className="flex items-center justify-center gap-3">
                <span className="font-mono text-2xl font-black tracking-widest text-foreground select-all">
                  {inviteCode || "Đang tải..."}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopyCode}
                  className="rounded-full h-8 px-3 text-xs gap-1.5 font-semibold"
                >
                  {isCopiedCode ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Đã chép</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Sao chép</span>
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* QR Code Container */}
            <div className="flex flex-col items-center justify-center p-4 rounded-2xl border border-border/60 bg-white dark:bg-card">
              <div className="relative p-2 rounded-xl bg-white shadow-xs">
                {qrImageUrl ? (
                  <img
                    src={qrImageUrl}
                    alt="Group Invite QR Code"
                    className="h-44 w-44 object-contain rounded-lg"
                  />
                ) : (
                  <div className="h-44 w-44 flex items-center justify-center">
                    <QrCode className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground mt-2 font-medium">
                Quét mã QR bằng điện thoại để tham gia nhóm ngay
              </p>
            </div>

            {/* Invite Link */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Hoặc sao chép đường dẫn mời:
              </label>
              <div className="flex items-center gap-2">
                <Input
                  readOnly
                  value={inviteUrl}
                  className="rounded-full text-xs font-mono bg-muted/50 select-all"
                />
                <Button
                  onClick={handleCopyLink}
                  className="rounded-full bg-forest-ink text-paper hover:bg-forest-ink/90 dark:bg-lime-voltage dark:text-forest-ink dark:hover:bg-lime-voltage/90 font-bold text-xs h-9 px-4 shrink-0 gap-1.5"
                >
                  {isCopiedLink ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-lime-voltage dark:text-forest-ink" />
                      <span>Đã chép</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Chép link</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
