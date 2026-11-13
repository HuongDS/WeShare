import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Banknote,
  Copy,
  Check,
  Upload,
  Loader2,
  Link2,
  Image as ImageIcon,
  ExternalLink,
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import {
  normalizeDriveImageUrl,
  getDriveViewerUrl,
} from "@/lib/driveUrl"
import { transactionApi } from "@/api/transactionApi"
import { handleAxiosError } from "@/utils/HandleAxiosError"
import { useAppSelector } from "@/store/hooks"
import { toast } from "sonner"
import type { UserViewDto } from "@/types/user/UserViewDto"

interface QuickSettleUpModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  groupId: number
  recipient: UserViewDto | null
  debtAmount: number
  onSuccess?: () => void
}

export default function QuickSettleUpModal({
  isOpen,
  onOpenChange,
  groupId,
  recipient,
  debtAmount,
  onSuccess,
}: QuickSettleUpModalProps) {
  const currentUserId = useAppSelector((state) => state.auth.user?.userId)
  const [method, setMethod] = useState<"drive_proof" | "cash">("drive_proof")
  const [settleAmount, setSettleAmount] = useState<number>(debtAmount)
  const [copiedAccount, setCopiedAccount] = useState(false)
  const [copiedAmount, setCopiedAmount] = useState(false)
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [proofPreview, setProofPreview] = useState<string | null>(null)
  const [driveLinkInput, setDriveLinkInput] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setSettleAmount(debtAmount)
    }
  }, [debtAmount, isOpen])

  const bankName = recipient?.bankName || ""
  const bankAccount = recipient?.defaultBankAccount || ""

  const normalizedDrivePreview = driveLinkInput.trim()
    ? normalizeDriveImageUrl(driveLinkInput)
    : null

  const activePreviewUrl = proofPreview || normalizedDrivePreview

  const copyToClipboard = async (text: string, type: "account" | "amount") => {
    try {
      await navigator.clipboard.writeText(text)
      if (type === "account") {
        setCopiedAccount(true)
        setTimeout(() => setCopiedAccount(false), 2000)
      } else {
        setCopiedAmount(true)
        setTimeout(() => setCopiedAmount(false), 2000)
      }
      toast.success("Đã sao chép vào clipboard!")
    } catch {
      toast.error("Không thể sao chép")
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file định dạng hình ảnh")
      return
    }

    if (proofPreview) URL.revokeObjectURL(proofPreview)
    setProofFile(file)
    setDriveLinkInput("")
    const preview = URL.createObjectURL(file)
    setProofPreview(preview)
  }

  const handleClearProof = () => {
    setProofFile(null)
    if (proofPreview) URL.revokeObjectURL(proofPreview)
    setProofPreview(null)
    setDriveLinkInput("")
  }

  const handleSubmit = async () => {
    if (!recipient || settleAmount <= 0) {
      toast.error("Số tiền thanh toán không hợp lệ")
      return
    }

    if (
      method === "drive_proof" &&
      !proofFile &&
      !driveLinkInput.trim()
    ) {
      toast.error(
        "Vui lòng tải ảnh minh chứng lên Google Drive hoặc dán link ảnh Google Drive."
      )
      return
    }

    setIsSubmitting(true)
    try {
      let uploadedProofUrl = driveLinkInput.trim()
        ? normalizeDriveImageUrl(driveLinkInput)
        : ""

      if (proofFile) {
        const uploadRes = await transactionApi.uploadProof(proofFile)
        uploadedProofUrl = uploadRes.data || ""
      }

      await transactionApi.addSingleSettlement({
        groupId,
        payerId: Number(currentUserId || 0),
        receiverId: Number(recipient.id),
        amount: settleAmount,
        paymentType: method === "drive_proof" ? "QR_CODE" : "CASH",
        proofUrl: uploadedProofUrl || undefined,
      })

      toast.success(
        method === "drive_proof"
          ? "Đã gửi minh chứng thanh toán! Đang chờ người nhận xác nhận."
          : "Đã ghi nhận thanh toán tiền mặt thành công!"
      )
      handleModalClose(false)
      onSuccess?.()
    } catch (err) {
      handleAxiosError(err as Error, "Không thể thực hiện quyết toán.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleModalClose = (open: boolean) => {
    if (!open) {
      handleClearProof()
    }
    onOpenChange(open)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleModalClose}>
      <DialogContent className="max-w-lg overflow-hidden rounded-3xl p-0 shadow-2xl border border-border">
        {/* Header */}
        <DialogHeader className="bg-forest-ink text-paper p-6 pb-5 dark:bg-card">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-bold tracking-tight text-white dark:text-lime-voltage">
                Thanh toán &amp; Quyết toán nợ
              </DialogTitle>
              <DialogDescription className="text-linen-mist/80 dark:text-muted-foreground text-xs mt-1">
                Tải ảnh minh chứng lên Google Drive hoặc xác nhận trả tiền mặt
              </DialogDescription>
            </div>
            <Badge className="bg-lime-voltage text-forest-ink font-bold px-3 py-1 rounded-full text-xs">
              Drive Proof
            </Badge>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Recipient Profile Card */}
          <div className="flex items-center justify-between rounded-2xl bg-muted/40 p-4 border border-border/60">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 border-2 border-forest-ink/20 dark:border-lime-voltage/30">
                <AvatarImage
                  src={recipient?.avatar}
                  alt={recipient?.fullName}
                />
                <AvatarFallback className="bg-forest-ink text-lime-voltage font-bold">
                  {recipient?.fullName?.slice(0, 2).toUpperCase() || "US"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-xs text-muted-foreground font-medium">
                  Người nhận thanh toán
                </p>
                <h4 className="text-base font-bold text-foreground">
                  {recipient?.fullName || "Thành viên nhóm"}
                </h4>
              </div>
            </div>

            <div className="text-right">
              <p className="text-xs text-muted-foreground font-medium">
                Dư nợ hiện tại
              </p>
              <p className="text-base font-extrabold text-alarm-red">
                {formatCurrency(debtAmount)}
              </p>
            </div>
          </div>

          {/* Amount to pay input */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Số tiền thanh toán (VND)
            </Label>
            <div className="relative">
              <Input
                type="number"
                min={1000}
                value={settleAmount}
                onChange={(e) => setSettleAmount(Number(e.target.value) || 0)}
                className="rounded-xl pr-16 text-lg font-bold text-foreground focus-visible:ring-forest-ink"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                ₫ VND
              </span>
            </div>
          </div>

          {/* Payment Method Tabs */}
          <div className="space-y-3">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Hình thức quyết toán
            </Label>
            <Tabs
              value={method}
              onValueChange={(v) => setMethod(v as "drive_proof" | "cash")}
            >
              <TabsList className="grid grid-cols-2 rounded-full p-1 bg-muted">
                <TabsTrigger
                  value="drive_proof"
                  className="rounded-full gap-2 text-xs font-semibold data-[state=active]:bg-forest-ink data-[state=active]:text-lime-voltage dark:data-[state=active]:bg-lime-voltage dark:data-[state=active]:text-forest-ink"
                >
                  <ImageIcon className="h-4 w-4" />
                  Ảnh minh chứng (Drive)
                </TabsTrigger>
                <TabsTrigger
                  value="cash"
                  className="rounded-full gap-2 text-xs font-semibold data-[state=active]:bg-forest-ink data-[state=active]:text-lime-voltage dark:data-[state=active]:bg-lime-voltage dark:data-[state=active]:text-forest-ink"
                >
                  <Banknote className="h-4 w-4" />
                  Tiền mặt trực tiếp
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Method Details */}
          {method === "drive_proof" ? (
            <div className="space-y-4 rounded-2xl border border-border p-4 bg-background">
              {bankName && bankAccount && (
                <div className="space-y-2 pb-3 border-b border-border/60 text-xs">
                  <div className="flex items-center justify-between py-1">
                    <span className="text-muted-foreground">Ngân hàng nhận:</span>
                    <span className="font-bold text-foreground">{bankName}</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-muted-foreground">Số tài khoản:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold tracking-wider text-foreground">
                        {bankAccount}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => copyToClipboard(bankAccount, "account")}
                        className="h-6 w-6 rounded-full hover:bg-muted"
                        title="Sao chép số tài khoản"
                      >
                        {copiedAccount ? (
                          <Check className="h-3.5 w-3.5 text-lime-600" />
                        ) : (
                          <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-muted-foreground">Số tiền chuyển:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-foreground">
                        {formatCurrency(settleAmount)}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          copyToClipboard(settleAmount.toString(), "amount")
                        }
                        className="h-6 w-6 rounded-full hover:bg-muted"
                        title="Sao chép số tiền"
                      >
                        {copiedAmount ? (
                          <Check className="h-3.5 w-3.5 text-lime-600" />
                        ) : (
                          <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Upload file to Google Drive OR Paste Drive Link */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-foreground">
                    Ảnh biên lai / Minh chứng (Lưu trên Google Drive) *
                  </Label>
                  {(proofFile || driveLinkInput.trim()) && (
                    <button
                      type="button"
                      onClick={handleClearProof}
                      className="text-[11px] font-semibold text-destructive hover:underline cursor-pointer"
                    >
                      Xóa ảnh
                    </button>
                  )}
                </div>

                {/* Option 1: Upload file from device -> backend uploads to Google Drive */}
                <label className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border p-4 text-center cursor-pointer hover:bg-muted/30 transition-colors">
                  <Upload className="h-6 w-6 text-forest-ink dark:text-lime-voltage mb-1" />
                  <span className="text-xs font-semibold text-foreground">
                    {proofFile
                      ? `Đã chọn: ${proofFile.name}`
                      : "Tải ảnh từ thiết bị (Tự động lưu lên Google Drive)"}
                  </span>
                  <span className="text-[10px] text-muted-foreground mt-0.5">
                    Hỗ trợ PNG, JPG, WEBP tối đa 10MB
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>

                {/* Option 2: Or paste Google Drive sharing link directly */}
                <div className="space-y-1.5">
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1.5 font-medium">
                    <Link2 className="h-3.5 w-3.5" />
                    Hoặc dán trực tiếp link ảnh Google Drive:
                  </span>
                  <Input
                    type="url"
                    value={driveLinkInput}
                    onChange={(e) => {
                      setDriveLinkInput(e.target.value)
                      if (e.target.value.trim()) {
                        setProofFile(null)
                        if (proofPreview) URL.revokeObjectURL(proofPreview)
                        setProofPreview(null)
                      }
                    }}
                    placeholder="https://drive.google.com/file/d/.../view?usp=sharing"
                    className="rounded-xl text-xs h-9"
                  />
                </div>

                {/* Preview */}
                {activePreviewUrl && (
                  <div className="space-y-1.5">
                    <div className="relative rounded-xl overflow-hidden border border-border h-40 bg-muted/40 flex items-center justify-center">
                      <img
                        src={activePreviewUrl}
                        alt="Payment Proof Preview"
                        className="h-full w-full object-contain"
                      />
                    </div>
                    {driveLinkInput.trim() && (
                      <a
                        href={getDriveViewerUrl(driveLinkInput)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-lime-voltage hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Kiểm tra ảnh trên Google Drive
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border p-5 text-center bg-muted/20 space-y-3">
              <Banknote className="h-10 w-10 text-forest-ink dark:text-lime-voltage mx-auto" />
              <h5 className="font-bold text-sm text-foreground">
                Thanh toán tiền mặt trực tiếp
              </h5>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Xác nhận bạn đã trả trực tiếp{" "}
                <strong>{formatCurrency(settleAmount)}</strong> bằng tiền mặt cho{" "}
                <strong>{recipient?.fullName}</strong>.
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <DialogFooter className="p-4 bg-muted/30 border-t border-border flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleModalClose(false)}
            className="rounded-full px-5 text-xs font-semibold"
          >
            Hủy
          </Button>

          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || settleAmount <= 0}
            className="rounded-full px-6 text-xs font-bold bg-forest-ink text-paper hover:bg-spruce dark:bg-lime-voltage dark:text-forest-ink shadow-md"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang tải &amp; xử lý...
              </>
            ) : (
              "Xác nhận thanh toán"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
