import { useState, useEffect, useRef, useMemo } from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { Upload, Loader2, Check, ChevronDown, HelpCircle } from "lucide-react"
import { useAppSelector } from "@/store/hooks"
import { useTransactionSettlement } from "@/hooks/transaction/useTransaction"
import type { CreateSettlementDto } from "@/types/transaction/CreateSettlementDto"
import type { TransactionPaymentTypeEnum } from "@/constants/TransactionPaymentTypeEnum"
import type { DebtItem } from "@/types/transaction/DebtItem"
import { toast } from "sonner"

// Helper function to format numbers in Vietnamese style
const formatNumberVN = (value: number): string => {
  return value.toLocaleString("de-DE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })
}

// Validation schema
const settlementSchema = z.object({
  receiverId: z.string().min(1, "Please select who you're paying"),
  amount: z.number().positive("Amount must be greater than 0"),
  paymentType: z.enum(["CASH", "BANK_TRANSFER", "QR_CODE"] as const),
  description: z.string().optional(),
  proofUrl: z.string().optional(),
})

type SettlementFormData = z.infer<typeof settlementSchema>

interface SettlementFormProps {
  selectedDebtItems: DebtItem[]
  onSuccess?: () => void
}

export default function SettlementForm({
  selectedDebtItems,
  onSuccess,
}: SettlementFormProps) {
  const currentUser = useAppSelector((state) => state.auth.user)
  const { addSettlement } = useTransactionSettlement()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [showPaymentDropdown, setShowPaymentDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<SettlementFormData>({
    resolver: zodResolver(settlementSchema),
    mode: "onBlur",
    defaultValues: {
      receiverId: "",
      amount: 0,
      paymentType: "BANK_TRANSFER",
      description: "",
      proofUrl: "",
    },
  })

  const paymentType = useWatch({ control, name: "paymentType" })

  // Golden Rule: isEditable = selectedDebtItems.length === 1
  const isEditable = selectedDebtItems.length === 1

  // Group items by recipient
  const itemsByRecipient = useMemo(() => {
    const map: Record<
      string,
      {
        recipientId: string
        recipientName: string
        recipientAvatar?: string
        items: DebtItem[]
        totalDebt: number
      }
    > = {}

    selectedDebtItems.forEach((item) => {
      if (!map[item.recipientId]) {
        map[item.recipientId] = {
          recipientId: item.recipientId,
          recipientName: item.recipientName,
          recipientAvatar: item.recipientAvatar,
          items: [],
          totalDebt: 0,
        }
      }
      map[item.recipientId].items.push(item)
      map[item.recipientId].totalDebt += item.amount
    })

    return Object.values(map)
  }, [selectedDebtItems])

  // Calculate total amount
  const totalAmount = useMemo(() => {
    return selectedDebtItems.reduce((sum, item) => sum + item.amount, 0)
  }, [selectedDebtItems])

  // Get primary recipient (for single item case or first recipient in multi-item case)
  const primaryRecipientId = useMemo(() => {
    if (selectedDebtItems.length > 0) {
      return selectedDebtItems[0].recipientId
    }
    return ""
  }, [selectedDebtItems])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowPaymentDropdown(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Auto-populate receiver and amount
  useEffect(() => {
    if (selectedDebtItems.length > 0) {
      setValue("receiverId", primaryRecipientId)
      setValue("amount", totalAmount)
    }
  }, [selectedDebtItems, primaryRecipientId, totalAmount, setValue])

  // Force amount to match total when not editable (multi-item mode)
  useEffect(() => {
    if (!isEditable && totalAmount > 0) {
      setValue("amount", totalAmount)
    }
  }, [isEditable, totalAmount, setValue])

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file")
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB")
        return
      }
      setSelectedFile(file)
      const timer = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(timer)
            return 100
          }
          return prev + 10
        })
      }, 100)
    }
  }

  const onSubmit = async (data: SettlementFormData) => {
    if (!currentUser?.userId) {
      toast.error("Missing user information")
      return
    }

    if (selectedDebtItems.length === 0) {
      toast.error("Please select debt items to settle")
      return
    }

    // For now, settle to the primary recipient
    // In future, this could handle multi-recipient settlements
    const groupId = selectedDebtItems[0].groupId

    const payload: CreateSettlementDto = {
      groupId,
      payerId: parseInt(currentUser.userId, 10),
      receiverId: parseInt(data.receiverId, 10),
      amount: data.amount,
      paymentType: data.paymentType as unknown as TransactionPaymentTypeEnum,
      description: data.description || null,
      proofUrl: data.proofUrl || undefined,
      taskId: null,
    }

    addSettlement.mutate(payload, {
      onSuccess: () => {
        toast.success("Settlement recorded successfully!", {
          icon: <Check className="h-5 w-5 text-green-600" />,
        })
        reset()
        setSelectedFile(null)
        setUploadProgress(0)
        onSuccess?.()
      },
    })
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-10">
      {/* LEFT COLUMN (40%): Review Section */}
      <div className="col-span-1 space-y-6 md:col-span-4">
        {/* Recipients Grouped by Person */}
        <div className="space-y-3">
          {itemsByRecipient.map((cluster) => (
            <div
              key={cluster.recipientId}
              className="rounded-lg border border-gray-200 bg-gray-50 p-4"
            >
              {/* Recipient Header */}
              <div className="mb-3 flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  {cluster.recipientAvatar && (
                    <img
                      src={cluster.recipientAvatar}
                      alt={cluster.recipientName}
                    />
                  )}
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    To {cluster.recipientName}
                  </p>
                </div>
                <p className="text-sm font-semibold text-blue-600 shrink-0">
                  {formatNumberVN(cluster.totalDebt)} VND
                </p>
              </div>

              {/* Items List */}
              <div className="space-y-1.5 bg-white rounded p-2">
                {cluster.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between text-xs py-1 px-2 border-b border-gray-100 last:border-0"
                  >
                    <span className="text-gray-700">
                      {item.description || "Expense"}
                    </span>
                    <span className="font-medium text-gray-900 shrink-0">
                      {formatNumberVN(item.amount)} VND
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Total Amount Card */}
        <div className="rounded-lg border-2 border-blue-300 bg-blue-50 p-4">
          <p className="mb-2 text-xs font-semibold text-muted-foreground uppercase">
            Total to Pay
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-blue-900">
              {formatNumberVN(totalAmount)}
            </span>
            <span className="text-lg font-semibold text-muted-foreground">
              VND
            </span>
          </div>
        </div>

        {/* Info: Amount Locked Indicator */}
        {!isEditable && (
          <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-3 border border-amber-200">
            <HelpCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-amber-900">
                Multiple Items Selected
              </p>
              <p className="text-xs text-amber-800 mt-1">
                Amount is locked to the sum of all selected items and cannot be edited.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* RIGHT COLUMN (60%): Payment Form */}
      <div className="col-span-1 md:col-span-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Receiver ID Field (Hidden) */}
          <input
            type="hidden"
            {...register("receiverId")}
            value={primaryRecipientId}
          />

          {/* Amount Field */}
          <div className="space-y-3">
            <Label className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Amount *
            </Label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Input
                  type="number"
                  placeholder="0"
                  step="1"
                  min="0"
                  disabled={!isEditable}
                  className={cn(
                    "h-12 border-2 text-lg font-bold",
                    !isEditable &&
                      "cursor-not-allowed border-gray-300 bg-gray-100 text-gray-600",
                    isEditable &&
                      "border-transparent focus-visible:border-ring",
                    errors.amount && isEditable && "border-destructive"
                  )}
                  {...register("amount", { valueAsNumber: true })}
                />
              </div>
              <span className="shrink-0 text-lg font-semibold text-muted-foreground">
                VND
              </span>
            </div>
            {errors.amount && (
              <p className="text-sm font-medium text-destructive">
                {errors.amount.message}
              </p>
            )}
          </div>

          {/* Payment Method */}
          <div className="space-y-3">
            <Label className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Payment Method *
            </Label>
            <div className="relative" ref={dropdownRef}>
              {/* Trigger Button */}
              <button
                type="button"
                onClick={() => setShowPaymentDropdown(!showPaymentDropdown)}
                className="flex h-10 w-full items-center justify-between rounded-md border-2 border-transparent bg-white px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-slate-50 focus-visible:border-ring focus-visible:outline-none"
              >
                <span className="font-medium text-foreground">
                  {paymentType === "CASH"
                    ? "Cash"
                    : paymentType === "BANK_TRANSFER"
                      ? "Bank Transfer"
                      : "QR Code"}
                </span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-muted-foreground transition-transform",
                    showPaymentDropdown && "rotate-180"
                  )}
                />
              </button>

              {/* Dropdown Menu */}
              {showPaymentDropdown && (
                <div className="absolute top-full z-50 mt-2 w-full rounded-lg border border-gray-200 bg-white shadow-lg">
                  <button
                    type="button"
                    onClick={() => {
                      setValue("paymentType", "BANK_TRANSFER")
                      setShowPaymentDropdown(false)
                    }}
                    className={cn(
                      "flex w-full items-center gap-2 px-3 py-3 text-left text-sm transition-colors hover:bg-slate-50",
                      paymentType === "BANK_TRANSFER" &&
                        "bg-blue-50 font-medium text-blue-700"
                    )}
                  >
                    Bank Transfer
                    {paymentType === "BANK_TRANSFER" && (
                      <Check className="ml-auto h-4 w-4 text-blue-600" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setValue("paymentType", "CASH")
                      setShowPaymentDropdown(false)
                    }}
                    className={cn(
                      "flex w-full items-center gap-2 border-t border-gray-100 px-3 py-3 text-left text-sm transition-colors hover:bg-slate-50",
                      paymentType === "CASH" &&
                        "bg-blue-50 font-medium text-blue-700"
                    )}
                  >
                    Cash
                    {paymentType === "CASH" && (
                      <Check className="ml-auto h-4 w-4 text-blue-600" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setValue("paymentType", "QR_CODE")
                      setShowPaymentDropdown(false)
                    }}
                    className={cn(
                      "flex w-full items-center gap-2 border-t border-gray-100 px-3 py-3 text-left text-sm transition-colors hover:bg-slate-50",
                      paymentType === "QR_CODE" &&
                        "bg-blue-50 font-medium text-blue-700"
                    )}
                  >
                    QR Code
                    {paymentType === "QR_CODE" && (
                      <Check className="ml-auto h-4 w-4 text-blue-600" />
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-3">
            <Label className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Notes (Optional)
            </Label>
            <textarea
              placeholder="Add any notes about this payment..."
              className="min-h-20 w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
              {...register("description")}
            />
          </div>

          {/* Proof of Payment */}
          {paymentType === "QR_CODE" && (
            <div className="space-y-3">
              <Label className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Proof of Payment
              </Label>
              <div className="rounded-lg border-2 border-dashed border-gray-300 p-4 text-center transition-colors hover:border-gray-400">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="proof-upload"
                />
                <label htmlFor="proof-upload" className="cursor-pointer">
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="h-6 w-6 text-muted-foreground" />
                    <div>
                      <p className="text-xs font-medium text-foreground">
                        Click to upload
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PNG, JPG up to 5MB
                      </p>
                    </div>
                  </div>
                </label>
              </div>
              {selectedFile && (
                <div className="flex items-center justify-between rounded-lg bg-green-50 p-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-green-900">
                      {selectedFile.name}
                    </p>
                    <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-green-200">
                      <div
                        className="h-full bg-green-600 transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            size="lg"
            className="mt-8 w-full gap-2 font-semibold"
            disabled={addSettlement.isPending || isSubmitting || selectedDebtItems.length === 0}
          >
            {addSettlement.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Recording...
              </>
            ) : (
              <>Record Settlement</>
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
