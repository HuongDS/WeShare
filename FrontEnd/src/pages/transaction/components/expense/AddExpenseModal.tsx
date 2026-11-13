import { useEffect, useMemo, useState } from "react"
import { useForm, useWatch, type SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
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
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useGetGroupMembers } from "@/hooks/group/useGroup"
import { TaskPicker } from "@/pages/group/components/work/WorkPicker"
import type { TaskSummary } from "@/types/task/Task"
import {
  useTransaction,
  useUploadProof,
} from "@/hooks/transaction/useTransaction"
import { useAppSelector } from "@/store/hooks"
import { useQueryClient } from "@tanstack/react-query"
import { ImageIcon, Link2, Loader2, Paperclip, X } from "lucide-react"
import {
  mapSplitStrategyToBackend,
  type SplitStrategyEnum,
} from "@/constants/SplitStrategyEnum"
import { mapTransactionTypeToBackend } from "@/constants/TransactionTypeEnum"
import { formatCurrency } from "@/lib/utils"
import { normalizeDriveImageUrl } from "@/lib/driveUrl"
import { toast } from "sonner"

interface AddExpenseModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  groupId?: string
  onSuccess?: () => void
}

const expenseSchema = z.object({
  amount: z.number().positive("Số tiền phải lớn hơn 0"),
  description: z.string().trim().min(1, "Vui lòng nhập mô tả khoản chi"),
  receiptUrl: z.string().optional(),
  splitStrategy: z.enum(["EQUALLY", "EXACTLY", "PERCENTAGE"] as const),
  debtIds: z.array(z.number()).min(1, "Vui lòng chọn ít nhất 1 thành viên"),
  splitAmounts: z.record(z.string(), z.number()).optional(),
})

type ExpenseFormValues = z.infer<typeof expenseSchema>

const EPSILON = 0.01

export default function AddExpenseModal({
  isOpen,
  onOpenChange,
  groupId,
  onSuccess,
}: AddExpenseModalProps) {
  const currentUser = useAppSelector((state) => state.auth.user)
  const queryClient = useQueryClient()
  const { addTransaction } = useTransaction()
  const { uploadUrlProof } = useUploadProof()
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [selectedTask, setSelectedTask] = useState<TaskSummary | null>(null)

  const parsedGroupId = useMemo(() => {
    const numericId = Number(groupId)
    return Number.isNaN(numericId) || numericId <= 0 ? 0 : numericId
  }, [groupId])

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    control,
    formState: { errors },
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      amount: 0,
      description: "",
      receiptUrl: "",
      splitStrategy: "EQUALLY",
      debtIds: [],
      splitAmounts: {},
    },
  })

  const amount = useWatch({ control, name: "amount" }) || 0
  const splitStrategy = useWatch({ control, name: "splitStrategy" })
  const debtIds = useWatch({ control, name: "debtIds" })
  const splitAmountsRaw = useWatch({ control, name: "splitAmounts" })
  const splitAmounts = useMemo(() => splitAmountsRaw || {}, [splitAmountsRaw])

  const { members } = useGetGroupMembers(parsedGroupId)

  const memberList = useMemo(
    () => (members.data?.data || []).filter((member) => member != null),
    [members.data]
  )

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
      setPreviewUrl(null)
      setSelectedFile(null)
      setValue("receiptUrl", "", { shouldDirty: true })
      setIsUploading(false)
      setSelectedTask(null)
      reset()
    }
    onOpenChange(open)
  }

  useEffect(() => {
    if (!parsedGroupId || memberList.length === 0) {
      return
    }

    const selectedIds = memberList.map((member) => Number(member.id))
    setValue("debtIds", selectedIds, { shouldDirty: true })
  }, [parsedGroupId, memberList, setValue])

  const handleMemberToggle = (userId: number) => {
    const nextIds = debtIds.includes(userId)
      ? debtIds.filter((id) => id !== userId)
      : [...debtIds, userId]

    setValue("debtIds", nextIds, { shouldDirty: true })
  }

  const handleManualAmountChange = (userId: number, value: string) => {
    const numeric = value ? Number(value) : 0
    const safeValue = Number.isNaN(numeric) ? 0 : Math.max(0, numeric)

    setValue(
      "splitAmounts",
      {
        ...splitAmounts,
        [userId]: safeValue,
      },
      { shouldDirty: true }
    )
  }

  const preventInvalidNumericKeys = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "-" || event.key === "e" || event.key === "E") {
      event.preventDefault()
    }
  }

  const handleReceiptSelected = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn tệp hình ảnh")
      event.target.value = ""
      return
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }

    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
    setValue("receiptUrl", "", { shouldDirty: true })
    event.target.value = ""
  }

  const handleRemoveReceipt = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    setPreviewUrl(null)
    setSelectedFile(null)
    setValue("receiptUrl", "", { shouldDirty: true })
  }

  const selectedMembersCount = debtIds.length

  const perPersonAmount = useMemo(() => {
    if (!amount || selectedMembersCount === 0) {
      return 0
    }
    return amount / selectedMembersCount
  }, [amount, selectedMembersCount])

  const exactlyAllocated = useMemo(() => {
    return debtIds.reduce((sum, memberId) => {
      const value = Number(splitAmounts[memberId] || 0)
      return sum + (Number.isNaN(value) ? 0 : value)
    }, 0)
  }, [debtIds, splitAmounts])

  const percentageAllocated = useMemo(() => {
    return debtIds.reduce((sum, memberId) => {
      const value = Number(splitAmounts[memberId] || 0)
      return sum + (Number.isNaN(value) ? 0 : value)
    }, 0)
  }, [debtIds, splitAmounts])

  const isAllocationValid = useMemo(() => {
    if (splitStrategy === "EXACTLY") {
      return Math.abs(exactlyAllocated - amount) < EPSILON
    }

    if (splitStrategy === "PERCENTAGE") {
      return Math.abs(percentageAllocated - 100) < EPSILON
    }

    return true
  }, [amount, exactlyAllocated, percentageAllocated, splitStrategy])

  const summaryText = useMemo(() => {
    if (splitStrategy === "EXACTLY") {
      return `Đã phân bổ: ${formatCurrency(exactlyAllocated)} / ${formatCurrency(amount)}`
    }

    if (splitStrategy === "PERCENTAGE") {
      return `Đã phân bổ: ${percentageAllocated.toFixed(2)}% / 100%`
    }

    return `Mỗi người chịu: ${formatCurrency(perPersonAmount)}`
  }, [
    amount,
    exactlyAllocated,
    percentageAllocated,
    perPersonAmount,
    splitStrategy,
  ])

  const summaryTone =
    splitStrategy === "EQUALLY"
      ? "text-muted-foreground"
      : isAllocationValid
        ? "text-emerald-600"
        : "text-red-500"

  const onSubmit: SubmitHandler<ExpenseFormValues> = async (values) => {
    if (!currentUser?.userId || !parsedGroupId) {
      return
    }

    if (!isAllocationValid) {
      return
    }

    const finalSplitAmounts: Record<number, number> | null =
      values.splitStrategy === "EXACTLY" ||
      values.splitStrategy === "PERCENTAGE"
        ? values.debtIds.reduce(
            (acc, memberId) => {
              const value = Number(values.splitAmounts?.[memberId] || 0)
              acc[memberId] = Number.isNaN(value) ? 0 : value
              return acc
            },
            {} as Record<number, number>
          )
        : null

    let uploadedReceiptUrl: string | undefined = values.receiptUrl
      ? normalizeDriveImageUrl(values.receiptUrl)
      : undefined

    if (selectedFile) {
      setIsUploading(true)
      try {
        const uploadRes = await uploadUrlProof.mutateAsync(selectedFile)
        uploadedReceiptUrl = uploadRes.data
        setValue("receiptUrl", uploadRes.data, { shouldDirty: true })
      } catch {
        uploadedReceiptUrl = undefined
        setValue("receiptUrl", "", { shouldDirty: true })
        toast.error("Tải ảnh hóa đơn thất bại. Tiếp tục lưu khoản chi mà không có ảnh.")
      } finally {
        setIsUploading(false)
      }
    }

    await addTransaction.mutateAsync({
      groupId: parsedGroupId,
      payerId: Number(currentUser.userId),
      amount: values.amount,
      description: values.description,
      receiptUrl: uploadedReceiptUrl,
      taskId: selectedTask ? Number(selectedTask.id) : null,
      strategy: mapSplitStrategyToBackend(
        values.splitStrategy as SplitStrategyEnum
      ),
      stategy: mapSplitStrategyToBackend(
        values.splitStrategy as SplitStrategyEnum
      ),
      type: mapTransactionTypeToBackend("EXPENSE"),
      splitAmounts: finalSplitAmounts,
      debtIds: values.debtIds,
    })

    queryClient.invalidateQueries({ queryKey: ["transactionsByGroupId"] })
    queryClient.invalidateQueries({ queryKey: ["myTransactions"] })
    queryClient.invalidateQueries({ queryKey: ["groupAnalytics"] })
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    setPreviewUrl(null)
    setSelectedFile(null)
    setSelectedTask(null)
    reset()
    onOpenChange(false)
    onSuccess?.()
  }

  const footerDisabled =
    addTransaction.isPending ||
    isUploading ||
    !parsedGroupId ||
    !amount ||
    amount <= 0 ||
    selectedMembersCount === 0 ||
    !isAllocationValid

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle>Thêm khoản chi mới</DialogTitle>
          <DialogDescription>
            Nhập số tiền, chọn cách chia và phân bổ phần chi cho các thành viên.
          </DialogDescription>
        </DialogHeader>

        <form
          className="flex min-h-0 flex-1 flex-col"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="flex-1 space-y-6 overflow-y-auto p-6">
            <section className="rounded-2xl border border-border/60 bg-muted/20 p-4 md:p-6">
              <div className="flex flex-col items-center gap-2">
                <div className="relative w-full max-w-sm">
                  <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-5xl font-bold text-muted-foreground">
                    ₫
                  </span>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0"
                    min={0}
                    step="1"
                    onKeyDown={preventInvalidNumericKeys}
                    className="h-20 w-full border-none bg-transparent pr-4 pl-16 text-center text-5xl font-bold focus-visible:ring-0 md:text-6xl"
                    {...register("amount", { valueAsNumber: true })}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Số tiền phải lớn hơn 0
                </p>
                <Input
                  id="description"
                  placeholder="Khoản chi cho việc gì? (ví dụ: Ăn tối, Đi lại, Mua sắm...)"
                  className="mx-auto mt-4 w-full max-w-xs border-none bg-transparent text-center text-lg text-muted-foreground shadow-none focus-visible:ring-0"
                  {...register("description")}
                />
                {errors.description && (
                  <p className="text-center text-xs text-destructive">
                    {errors.description.message}
                  </p>
                )}
                {errors.amount && (
                  <p className="text-center text-xs text-destructive">
                    {errors.amount.message}
                  </p>
                )}
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <Label>Cách chia tiền</Label>
                <Tabs
                  value={splitStrategy}
                  onValueChange={(value) =>
                    setValue(
                      "splitStrategy",
                      value as ExpenseFormValues["splitStrategy"],
                      { shouldDirty: true }
                    )
                  }
                >
                  <TabsList className="grid w-full grid-cols-3 md:w-auto">
                    <TabsTrigger value="EQUALLY">Chia đều</TabsTrigger>
                    <TabsTrigger value="EXACTLY">Số tiền cụ thể</TabsTrigger>
                    <TabsTrigger value="PERCENTAGE">Theo tỷ lệ %</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <div className="sticky top-0 z-10 rounded-lg border border-border bg-background/95 px-3 py-2 text-sm backdrop-blur">
                <p className={summaryTone}>{summaryText}</p>
              </div>

              <div className="space-y-3">
                {members.isFetching ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Đang tải danh sách thành viên...
                  </div>
                ) : !parsedGroupId ? (
                  <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                    Thiếu thông tin nhóm. Vui lòng mở lại từ trang chi tiết nhóm.
                  </p>
                ) : memberList.length === 0 ? (
                  <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                    Nhóm này hiện chưa có thành viên nào.
                  </p>
                ) : (
                  memberList.map((member) => {
                    const memberId = Number(member.id)
                    const isChecked = debtIds.includes(memberId)
                    const initials =
                      member.fullName
                        ?.split(" ")
                        .map((chunk) => chunk[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase() || "?"

                    const value = Number(splitAmounts[memberId] || 0)
                    const calculatedAmount = amount * (value / 100)

                    return (
                      <div
                        key={member.id}
                        className="rounded-xl border border-border/60 bg-card p-4"
                      >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex min-w-0 items-center gap-3">
                            <Checkbox
                              checked={isChecked}
                              onCheckedChange={() =>
                                handleMemberToggle(memberId)
                              }
                            />
                            <Avatar>
                              <AvatarImage
                                src={member.avatar}
                                alt={member.fullName}
                              />
                              <AvatarFallback>{initials}</AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-foreground">
                                {member.fullName}
                              </p>
                              <p className="truncate text-xs text-muted-foreground">
                                {member.email || "Không có email"}
                              </p>
                            </div>
                          </div>

                          <div className="w-full sm:w-auto sm:shrink-0">
                            {splitStrategy === "EQUALLY" ? (
                              <div className="rounded-md border bg-muted/30 px-3 py-2 text-right text-sm font-semibold text-foreground sm:min-w-35">
                                {isChecked
                                  ? formatCurrency(perPersonAmount)
                                  : "-"}
                              </div>
                            ) : splitStrategy === "EXACTLY" ? (
                              <Input
                                type="number"
                                step="0.01"
                                min={0}
                                onKeyDown={preventInvalidNumericKeys}
                                className="sm:w-40"
                                value={splitAmounts[memberId] || ""}
                                onChange={(event) =>
                                  handleManualAmountChange(
                                    memberId,
                                    event.target.value
                                  )
                                }
                                disabled={!isChecked}
                              />
                            ) : (
                              <div className="flex items-center gap-2">
                                <div className="relative w-28">
                                  <Input
                                    type="number"
                                    step="0.01"
                                    min={0}
                                    max={100}
                                    onKeyDown={preventInvalidNumericKeys}
                                    className="pr-6"
                                    value={splitAmounts[memberId] || ""}
                                    onChange={(event) =>
                                      handleManualAmountChange(
                                        memberId,
                                        event.target.value
                                      )
                                    }
                                    disabled={!isChecked}
                                  />
                                  <span className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-xs text-muted-foreground">
                                    %
                                  </span>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  {formatCurrency(calculatedAmount)}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}

                {errors.debtIds && (
                  <p className="text-xs text-destructive">
                    {errors.debtIds.message}
                  </p>
                )}
              </div>
            </section>

            <section className="space-y-3 rounded-xl border border-border/60 bg-muted/20 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Ảnh hóa đơn / Minh chứng (Google Drive)
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Tải ảnh lên Google Drive hoặc dán link ảnh Google Drive.
                  </p>
                </div>
                <Button type="button" variant="outline" asChild>
                  <label
                    htmlFor="receipt-upload"
                    className="flex cursor-pointer items-center gap-2"
                  >
                    <Paperclip className="h-4 w-4" />
                    Tải ảnh lên Drive
                  </label>
                </Button>
              </div>

              <input
                id="receipt-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleReceiptSelected}
              />

              {!selectedFile && (
                <div className="space-y-1.5">
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1.5 font-medium">
                    <Link2 className="h-3.5 w-3.5" />
                    Hoặc dán link ảnh Google Drive:
                  </span>
                  <Input
                    type="url"
                    placeholder="https://drive.google.com/file/d/.../view?usp=sharing"
                    {...register("receiptUrl")}
                    onChange={(e) => {
                      const val = e.target.value
                      setValue("receiptUrl", val, { shouldDirty: true })
                      if (val.trim()) {
                        setPreviewUrl(normalizeDriveImageUrl(val))
                      } else {
                        setPreviewUrl(null)
                      }
                    }}
                    className="h-9 text-xs"
                  />
                </div>
              )}

              {previewUrl && (
                <div className="relative flex items-start gap-3 rounded-lg border bg-background p-3">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md border">
                    <img
                      src={previewUrl}
                      alt="Xem trước ảnh hóa đơn"
                      className="h-full w-full object-cover"
                    />
                    {isUploading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/70">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {isUploading
                        ? "Đang tải ảnh lên..."
                        : "Ảnh hóa đơn đã sẵn sàng"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {isUploading
                        ? "Vui lòng chờ trong khi hệ thống xử lý ảnh"
                        : selectedFile
                          ? `Đã chọn: ${selectedFile.name}`
                          : "Bạn vẫn có thể lưu khoản chi mà không cần ảnh hóa đơn."}
                    </p>
                    {isUploading && (
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                        <div className="h-full w-1/2 animate-pulse rounded-full bg-primary" />
                      </div>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={handleRemoveReceipt}
                    disabled={isUploading}
                    aria-label="Xóa ảnh hóa đơn"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {!previewUrl && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <ImageIcon className="h-4 w-4" />
                  Hỗ trợ định dạng JPG, PNG, WEBP.
                </div>
              )}
            </section>

            {parsedGroupId > 0 && (
              <section className="space-y-2">
                <TaskPicker
                  groupId={parsedGroupId}
                  value={selectedTask}
                  onChange={setSelectedTask}
                  disabled={addTransaction.isPending || isUploading}
                />
              </section>
            )}
          </div>

          <DialogFooter className="mt-auto border-t bg-background p-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={footerDisabled}>
              {addTransaction.isPending ? "Đang lưu..." : "Lưu khoản chi"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
