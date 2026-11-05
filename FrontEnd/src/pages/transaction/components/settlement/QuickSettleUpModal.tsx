import { useState, useMemo } from "react"
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
  QrCode,
  Banknote,
  Copy,
  Check,
  Upload,
  Loader2,
  AlertCircle,
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"
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
  const [method, setMethod] = useState<"vietqr" | "cash">("vietqr")
  const [settleAmount, setSettleAmount] = useState<number>(debtAmount)
  const [copiedAccount, setCopiedAccount] = useState(false)
  const [copiedAmount, setCopiedAmount] = useState(false)
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [proofPreview, setProofPreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Sync initial debt amount when modal opens or debtAmount changes
  useState(() => {
    setSettleAmount(debtAmount)
  })

  const bankName = recipient?.bankName || ""
  const bankAccount = recipient?.defaultBankAccount || ""

  // Generate VietQR URL if bank info exists
  const vietQrUrl = useMemo(() => {
    if (!bankName || !bankAccount || settleAmount <= 0) return null
    const cleanBank = encodeURIComponent(bankName.trim())
    const cleanAcc = encodeURIComponent(bankAccount.trim())
    const memo = encodeURIComponent(`WeShare Settle Group ${groupId}`)
    return `https://img.vietqr.io/image/${cleanBank}-${cleanAcc}-compact2.png?amount=${settleAmount}&addInfo=${memo}&accountName=${encodeURIComponent(recipient?.fullName || "")}`
  }, [bankName, bankAccount, settleAmount, groupId, recipient?.fullName])

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
      toast.success("Copied to clipboard!")
    } catch {
      toast.error("Failed to copy")
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image receipt")
      return
    }

    setProofFile(file)
    const preview = URL.createObjectURL(file)
    setProofPreview(preview)
  }

  const handleSubmit = async () => {
    if (!recipient || settleAmount <= 0) {
      toast.error("Invalid settlement amount")
      return
    }

    setIsSubmitting(true)
    try {
      let uploadedProofUrl = ""
      if (proofFile) {
        const uploadRes = await transactionApi.uploadProof(proofFile)
        uploadedProofUrl = uploadRes.data || ""
      }

      await transactionApi.addSingleSettlement({
        groupId,
        payerId: Number(currentUserId || 0),
        receiverId: Number(recipient.id),
        amount: settleAmount,
        paymentType: method === "vietqr" ? "QR_CODE" : "CASH",
        proofUrl: uploadedProofUrl || undefined,
      })

      toast.success("Settlement submitted successfully! Waiting for recipient approval.")
      onOpenChange(false)
      onSuccess?.()
    } catch (err) {
      handleAxiosError(err as Error, "Settlement failed.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleModalClose = (open: boolean) => {
    if (!open) {
      if (proofPreview) URL.revokeObjectURL(proofPreview)
      setProofFile(null)
      setProofPreview(null)
    }
    onOpenChange(open)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleModalClose}>
      <DialogContent className="max-w-lg overflow-hidden rounded-3xl p-0 shadow-2xl border border-border">
        {/* Header - Forest Ink / High Contrast */}
        <DialogHeader className="bg-forest-ink text-paper p-6 pb-5 dark:bg-card">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-bold tracking-tight text-white dark:text-lime-voltage">
                Settle Debt Balance
              </DialogTitle>
              <DialogDescription className="text-linen-mist/80 dark:text-muted-foreground text-xs mt-1">
                Fast & transparent settlement with smart QR payment
              </DialogDescription>
            </div>
            <Badge className="bg-lime-voltage text-forest-ink font-bold px-3 py-1 rounded-full text-xs">
              Quick Settle
            </Badge>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Recipient Profile Card */}
          <div className="flex items-center justify-between rounded-2xl bg-muted/40 p-4 border border-border/60">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 border-2 border-forest-ink/20 dark:border-lime-voltage/30">
                <AvatarImage src={recipient?.avatar} alt={recipient?.fullName} />
                <AvatarFallback className="bg-forest-ink text-lime-voltage font-bold">
                  {recipient?.fullName?.slice(0, 2).toUpperCase() || "US"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Paying to</p>
                <h4 className="text-base font-bold text-foreground">
                  {recipient?.fullName || "Group Member"}
                </h4>
              </div>
            </div>

            <div className="text-right">
              <p className="text-xs text-muted-foreground font-medium">Outstanding Debt</p>
              <p className="text-base font-extrabold text-alarm-red">
                {formatCurrency(debtAmount)}
              </p>
            </div>
          </div>

          {/* Amount to pay input */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Settlement Amount (VND)
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
              Payment Method
            </Label>
            <Tabs value={method} onValueChange={(v) => setMethod(v as "vietqr" | "cash")}>
              <TabsList className="grid grid-cols-2 rounded-full p-1 bg-muted">
                <TabsTrigger
                  value="vietqr"
                  className="rounded-full gap-2 text-xs font-semibold data-[state=active]:bg-forest-ink data-[state=active]:text-lime-voltage dark:data-[state=active]:bg-lime-voltage dark:data-[state=active]:text-forest-ink"
                >
                  <QrCode className="h-4 w-4" />
                  VietQR Transfer
                </TabsTrigger>
                <TabsTrigger
                  value="cash"
                  className="rounded-full gap-2 text-xs font-semibold data-[state=active]:bg-forest-ink data-[state=active]:text-lime-voltage dark:data-[state=active]:bg-lime-voltage dark:data-[state=active]:text-forest-ink"
                >
                  <Banknote className="h-4 w-4" />
                  Cash / Direct Settle
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Method Content */}
          {method === "vietqr" ? (
            <div className="space-y-4 rounded-2xl border border-border p-4 bg-background">
              {bankName && bankAccount ? (
                <>
                  {/* QR Image Display */}
                  {vietQrUrl && (
                    <div className="flex flex-col items-center justify-center p-3 bg-white rounded-xl shadow-inner border border-border/50">
                      <img
                        src={vietQrUrl}
                        alt="VietQR Payment Code"
                        className="max-h-56 object-contain rounded-lg"
                      />
                      <p className="text-[11px] text-slate-500 font-medium mt-2 flex items-center gap-1">
                        Scan with your Mobile Banking App (Napas247)
                      </p>
                    </div>
                  )}

                  {/* Bank Info Details with Copy Buttons */}
                  <div className="space-y-2 pt-2 text-xs">
                    <div className="flex items-center justify-between py-1.5 border-b border-border/60">
                      <span className="text-muted-foreground">Beneficiary Bank:</span>
                      <span className="font-bold text-foreground">{bankName}</span>
                    </div>

                    <div className="flex items-center justify-between py-1.5 border-b border-border/60">
                      <span className="text-muted-foreground">Account Number:</span>
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
                          title="Copy account number"
                        >
                          {copiedAccount ? (
                            <Check className="h-3.5 w-3.5 text-lime-600" />
                          ) : (
                            <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between py-1.5">
                      <span className="text-muted-foreground">Transfer Amount:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-foreground">
                          {formatCurrency(settleAmount)}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => copyToClipboard(settleAmount.toString(), "amount")}
                          className="h-6 w-6 rounded-full hover:bg-muted"
                          title="Copy amount"
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
                </>
              ) : (
                <div className="flex flex-col items-center justify-center p-6 text-center space-y-2 text-muted-foreground">
                  <AlertCircle className="h-8 w-8 text-amber-500" />
                  <p className="text-sm font-semibold text-foreground">
                    No bank account linked yet
                  </p>
                  <p className="text-xs max-w-xs">
                    {recipient?.fullName} has not configured their default bank account. You can settle in cash or ask them to update their profile.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border p-5 text-center bg-muted/20 space-y-2">
              <Banknote className="h-10 w-10 text-forest-ink dark:text-lime-voltage mx-auto" />
              <h5 className="font-bold text-sm text-foreground">Cash Settlement</h5>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Confirm that you have paid {formatCurrency(settleAmount)} directly in cash or through another offline agreement.
              </p>
            </div>
          )}

          {/* Proof Upload */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-muted-foreground flex items-center justify-between">
              <span>Payment Receipt / Proof (Optional)</span>
              {proofFile && (
                <button
                  type="button"
                  onClick={() => {
                    setProofFile(null)
                    if (proofPreview) URL.revokeObjectURL(proofPreview)
                    setProofPreview(null)
                  }}
                  className="text-[11px] text-destructive hover:underline"
                >
                  Remove
                </button>
              )}
            </Label>

            {proofPreview ? (
              <div className="relative rounded-xl overflow-hidden border border-border h-32 bg-muted flex items-center justify-center">
                <img
                  src={proofPreview}
                  alt="Payment Proof"
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border p-4 text-center cursor-pointer hover:bg-muted/30 transition-colors">
                <Upload className="h-6 w-6 text-muted-foreground mb-1" />
                <span className="text-xs font-semibold text-foreground">
                  Click to attach transfer slip
                </span>
                <span className="text-[10px] text-muted-foreground">
                  PNG, JPG or JPEG up to 5MB
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <DialogFooter className="p-4 bg-muted/30 border-t border-border flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-full px-5 text-xs font-semibold"
          >
            Cancel
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
                Sending...
              </>
            ) : (
              "Confirm Settlement"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
