import { useMemo, useState } from "react"
import React from "react"
import { useForm, useWatch, type SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar } from "@/components/ui/avatar"
// import { Textarea } from "@/components/ui/textarea"
import { useTransaction } from "@/hooks/transaction/useTransaction"
import { useAppSelector } from "@/store/hooks"
import {
  Loader2,
  Users,
  Banknote,
  Percent,
  AlertCircle,
  Search,
  ChevronRight,
  Check,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { SplitStrategyEnum } from "@/constants/SplitStrategyEnum"
import type { UserViewDto } from "@/types/user/UserViewDto"

// Enhanced member type with current user flag
interface EnhancedMember extends UserViewDto {
  isCurrentUser?: boolean
}

// Validation schema with strict split validation
const createExpenseSchema = z.object({
  amount: z.number().positive("Amount must be greater than 0"),
  description: z.string().optional().nullable(),
  payerId: z.string().min(1, "Payer ID is required"),
  splitStrategy: z.enum(["EQUALLY", "EXACTLY", "PERCENTAGE"] as const),
  debtIds: z
    .array(z.number())
    .min(1, "At least one participant must be selected"),
  splitAmounts: z.record(z.string(), z.number()).optional(),
})

type CreateExpenseFormData = z.infer<typeof createExpenseSchema>

interface AddExpenseModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  groupId?: number
  onSuccess?: () => void
  groupMembers?: UserViewDto[]
}

const SPLIT_STRATEGIES: Array<{
  value: SplitStrategyEnum
  label: string
  description: string
  icon: React.ReactNode
  color: string
  bgColor: string
  borderColor: string
}> = [
  {
    value: "EQUALLY",
    label: "Split Equally",
    description: "Everyone pays the same",
    icon: <Users className="h-5 w-5" />,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-500",
  },
  {
    value: "EXACTLY",
    label: "Exact Amount",
    description: "Specify exact amounts",
    icon: <Banknote className="h-5 w-5" />,
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-500",
  },
  {
    value: "PERCENTAGE",
    label: "By Percentage",
    description: "Split by percentage",
    icon: <Percent className="h-5 w-5" />,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-500",
  },
]

// Mock group members - replace with props or API fetch
const defaultGroupMembers: UserViewDto[] = [
  {
    id: "1",
    fullName: "John Doe",
    email: "john@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
  },
  {
    id: "2",
    fullName: "Jane Smith",
    email: "jane@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane",
  },
  {
    id: "3",
    fullName: "Mike Johnson",
    email: "mike@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike",
  },
]

// Helper function to format numbers in Vietnamese style (dot as thousands separator)
const formatNumberVN = (value: number): string => {
  return value.toLocaleString("de-DE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })
}

export default function AddExpenseModal({
  isOpen,
  onOpenChange,
  groupId,
  onSuccess,
  groupMembers = defaultGroupMembers,
}: AddExpenseModalProps) {
  const currentUser = useAppSelector((state) => state.auth.user)
  const { addTransaction } = useTransaction()

  // Step state
  const [step, setStep] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")

  // Create a full member list ensuring currentUser is ALWAYS at the top
  const fullMemberList: EnhancedMember[] = useMemo(() => {
    if (!currentUser) return groupMembers as EnhancedMember[]

    const currentUserNumId = parseInt(currentUser.userId, 10)

    // Check if current user exists in the list
    const currentUserExists = groupMembers.some(
      (member) => parseInt(member.id, 10) === currentUserNumId
    )

    // Create enhanced member for current user
    const currentUserMember: EnhancedMember = {
      id: currentUser.userId,
      fullName: "You",
      email: currentUser.email || "",
      avatar: currentUser.avatar || "",
      isCurrentUser: true,
    }

    // Return list with current user at top, avoiding duplicates
    if (currentUserExists) {
      // Map to add isCurrentUser flag to existing current user entry
      return groupMembers.map((member) =>
        parseInt(member.id, 10) === currentUserNumId
          ? { ...member, isCurrentUser: true, fullName: "You" }
          : member
      ) as EnhancedMember[]
    }

    // Prepend current user if not in list
    return [currentUserMember, ...(groupMembers as EnhancedMember[])]
  }, [currentUser, groupMembers])

  // Filter members based on search query
  const filteredMemberList = useMemo(() => {
    if (!searchQuery.trim()) return fullMemberList

    const lowerQuery = searchQuery.toLowerCase()
    return fullMemberList.filter(
      (member) =>
        member.fullName.toLowerCase().includes(lowerQuery) ||
        member?.email?.toLowerCase().includes(lowerQuery)
    )
  }, [fullMemberList, searchQuery])

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
    reset,
    trigger,
  } = useForm<CreateExpenseFormData>({
    resolver: zodResolver(createExpenseSchema),
    mode: "onBlur",
    defaultValues: {
      amount: 0,
      description: "",
      payerId:
        currentUser?.userId ||
        (groupMembers.length > 0 ? groupMembers[0].id : ""),
      splitStrategy: "EQUALLY",
      debtIds: [],
      splitAmounts: {},
    },
  })

  const amount = useWatch({ control, name: "amount" })
  const splitStrategy = useWatch({ control, name: "splitStrategy" })
  const debtIds = useWatch({ control, name: "debtIds" })
  const splitAmounts = useWatch({ control, name: "splitAmounts" })
  const description = useWatch({ control, name: "description" })

  // Calculate per-person amount for EQUALLY strategy
  const perPersonAmount = useMemo(() => {
    if (splitStrategy === "EQUALLY" && debtIds.length > 0 && amount > 0) {
      return amount / debtIds.length
    }
    return 0
  }, [amount, debtIds.length, splitStrategy])

  // Enhanced validation with strict checks and remaining amounts
  const splitValidation = useMemo(() => {
    if (!splitAmounts || amount === 0) {
      return { isValid: true, total: 0, remaining: 0, error: "" }
    }

    if (splitStrategy === "EXACTLY") {
      const total = Object.values(splitAmounts).reduce(
        (sum, val) => sum + (val || 0),
        0
      )
      const remaining = amount - total
      const isValid = Math.abs(remaining) < 0.01

      if (total > amount + 0.01) {
        return {
          total,
          remaining,
          isValid: false,
          error: `⚠️ Total exceeds amount by ${formatNumberVN(total - amount)} VND`,
        }
      }

      return {
        total,
        remaining,
        isValid,
        error: isValid
          ? ""
          : `Remaining: ${formatNumberVN(remaining)} VND to allocate`,
      }
    }

    if (splitStrategy === "PERCENTAGE") {
      const total = Object.values(splitAmounts).reduce(
        (sum, val) => sum + (val || 0),
        0
      )
      const isValid = Math.abs(total - 100) < 0.01

      if (total > 100 + 0.01) {
        return {
          total,
          remaining: 0,
          isValid: false,
          error: `⚠️ Total exceeds 100% by ${(total - 100).toFixed(1)}%`,
        }
      }

      return {
        total,
        remaining: 100 - total,
        isValid,
        error: isValid
          ? ""
          : `${(100 - total).toFixed(1)}% remaining to allocate`,
      }
    }

    return { isValid: true, total: 0, remaining: 0, error: "" }
  }, [splitStrategy, splitAmounts, amount])

  // Handle debt IDs checkbox changes
  const handleDebtIdToggle = (userId: string, checked: boolean) => {
    const userIdNum = parseInt(userId, 10)
    const currentDebtIds = debtIds || []
    const newDebtIds = checked
      ? [...currentDebtIds, userIdNum]
      : currentDebtIds.filter((id) => id !== userIdNum)
    setValue("debtIds", newDebtIds)

    // Initialize splitAmounts for new participants
    if (checked && splitStrategy !== "EQUALLY") {
      const newSplitAmounts = { ...splitAmounts }
      newSplitAmounts[userId] = 0
      setValue("splitAmounts", newSplitAmounts)
    }
  }

  // Handle split amount changes
  const handleSplitAmountChange = (userId: string, value: string) => {
    const newSplitAmounts = { ...splitAmounts }
    newSplitAmounts[userId] = value ? parseFloat(value) : 0
    setValue("splitAmounts", newSplitAmounts)
  }

  // Step 1 validation - validate amount and description
  const handleStep1Next = async () => {
    const isValid = await trigger(["amount", "description"])
    if (isValid) {
      setStep(2)
    }
  }

  // Step 2 validation - validate split strategy and participants
  const handleStep2Next = () => {
    if (splitValidation.isValid && debtIds.length > 0) {
      setStep(3)
    }
  }

  const onSubmit: SubmitHandler<CreateExpenseFormData> = async (data) => {
    if (!groupId) {
      console.error("Group ID is required")
      return
    }

    if (!currentUser?.userId) {
      console.error("Current user ID is required")
      return
    }

    // Prepare splitAmounts based on strategy
    let finalSplitAmounts: Record<number, number> | null = null

    if (data.splitStrategy === "EQUALLY") {
      finalSplitAmounts = {}
      data.debtIds.forEach((userId) => {
        finalSplitAmounts![userId] = perPersonAmount
      })
    } else if (
      data.splitStrategy === "EXACTLY" ||
      data.splitStrategy === "PERCENTAGE"
    ) {
      finalSplitAmounts = {}
      Object.entries(data.splitAmounts || {}).forEach(([userId, amount]) => {
        finalSplitAmounts![parseInt(userId, 10)] = amount
      })
    }

    const payload = {
      groupId,
      payerId: parseInt(currentUser.userId, 10),
      amount: data.amount,
      description: data.description,
      taskId: null,
      stategy: data.splitStrategy,
      type: "EXPENSE" as const,
      splitAmounts: finalSplitAmounts,
      debtIds: data.debtIds,
    }

    addTransaction.mutate(payload, {
      onSuccess: () => {
        reset()
        setStep(1)
        setSearchQuery("")
        onOpenChange(false)
        onSuccess?.()
      },
    })
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      reset()
      setStep(1)
      setSearchQuery("")
    }
    onOpenChange(open)
  }

  // Calculate final split amounts for review with rounding fix
  const reviewSplitAmounts: Record<string, number> = useMemo(() => {
    const result: Record<string, number> = {}

    if (splitStrategy === "EQUALLY") {
      debtIds.forEach((userId) => {
        result[userId] = perPersonAmount
      })
    } else if (splitStrategy === "EXACTLY" || splitStrategy === "PERCENTAGE") {
      if (splitStrategy === "EXACTLY") {
        Object.entries(splitAmounts || {}).forEach(([userId, splitAmount]) => {
          result[userId] = splitAmount
        })
      } else {
        // PERCENTAGE - convert percentage to actual amount with rounding
        let total = 0
        const entries = Object.entries(splitAmounts || {})
        entries.forEach(([userId, percentage], index) => {
          let calculatedAmount = (percentage / 100) * amount

          // On the last entry, adjust to ensure total matches exactly
          if (index === entries.length - 1) {
            calculatedAmount = amount - total
          } else {
            calculatedAmount = Math.round(calculatedAmount * 100) / 100
            total += calculatedAmount
          }

          result[userId] = calculatedAmount
        })
      }
    }

    return result
  }, [splitStrategy, debtIds, splitAmounts, perPersonAmount, amount])

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[90vh] w-[95vw] max-w-sm flex-col overflow-hidden p-0 md:max-w-2xl lg:max-w-5xl">
        {/* Compact Header with Title and Action Buttons */}
        <div className="border-b border-gray-200 bg-white px-4 py-3 md:px-6">
          <div className="mb-3 flex items-start justify-between gap-4 pr-12">
            <div className="flex-1">
              <h2 className="text-base leading-tight font-bold">Add Expense</h2>
              <p className="mt-0.5 text-xs leading-tight text-muted-foreground">
                Split with group members
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="whitespace-nowrap"
                onClick={() => {
                  if (step > 1) {
                    setStep(step - 1)
                  } else {
                    handleOpenChange(false)
                  }
                }}
              >
                {step === 1 ? "Cancel" : "Back"}
              </Button>

              {step < 3 ? (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    if (step === 1) {
                      handleStep1Next()
                    } else if (step === 2) {
                      handleStep2Next()
                    }
                  }}
                  disabled={
                    step === 1 && (!amount || errors.amount)
                      ? true
                      : step === 2 &&
                          (!splitValidation.isValid || debtIds.length === 0)
                        ? true
                        : false
                  }
                  className="gap-1 whitespace-nowrap"
                >
                  Next
                  <ChevronRight className="h-3 w-3" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  size="sm"
                  disabled={addTransaction.isPending}
                  className="gap-1 whitespace-nowrap"
                  onClick={handleSubmit(onSubmit)}
                >
                  {addTransaction.isPending ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Adding
                    </>
                  ) : (
                    <>
                      Confirm
                      <Check className="h-3 w-3" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Stepper - Labels Centered Above Circles */}
          <div className="flex items-end justify-center gap-4 pt-1">
            {[1, 2, 3].map((stepNum, index) => (
              <React.Fragment key={stepNum}>
                <div className="flex w-12 shrink-0 flex-col items-center">
                  {/* Step Label - Above Circle */}
                  <p className="mb-1 text-center text-xs font-semibold text-muted-foreground uppercase">
                    {stepNum === 1
                      ? "Details"
                      : stepNum === 2
                        ? "Split"
                        : "Review"}
                  </p>

                  {/* Indicator Circle */}
                  <div
                    className={cn(
                      "flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold transition-all",
                      step >= stepNum
                        ? "bg-primary text-white shadow-sm"
                        : "bg-gray-200 text-gray-600"
                    )}
                  >
                    {step > stepNum ? <Check className="h-3 w-3" /> : stepNum}
                  </div>
                </div>

                {/* Connector Line */}
                {index < 2 && (
                  <div
                    className={cn(
                      "mb-3 h-0.5 grow transition-all",
                      step > stepNum ? "bg-primary" : "bg-gray-200"
                    )}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="min-h-100 flex-1 overflow-y-auto px-4 py-4 md:px-6 md:py-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* STEP 1: DETAILS - Responsive 2-Column Layout */}
            {step === 1 && (
              <div className="flex flex-col gap-6 md:flex-row md:gap-8">
                {/* LEFT COLUMN: Intro Card (Mobile: Top, Desktop: 40%) */}
                <div className="flex flex-col items-center justify-center md:w-2/5">
                  <div className="rounded-lg border border-gray-200 bg-linear-to-br from-blue-50 to-indigo-50 p-8 text-center">
                    <Avatar className="mx-auto mb-4 h-16 w-16">
                      {currentUser?.avatar && (
                        <img
                          src={currentUser.avatar}
                          alt={currentUser.userName}
                        />
                      )}
                    </Avatar>
                    <p className="text-sm font-semibold text-foreground">
                      Hi, {currentUser?.userName || "there"}!
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Let's start a new expense.
                    </p>
                    <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                      Enter the amount, add a description, and we'll split it up
                      with your group members.
                    </p>
                  </div>
                </div>

                {/* RIGHT COLUMN: Input Fields (Mobile: Below Card, Desktop: 60%) */}
                <div className="w-full space-y-6 md:w-3/5">
                  <div className="space-y-3">
                    <Label className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                      Amount *
                    </Label>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <Input
                          type="number"
                          placeholder="0"
                          step="0.01"
                          min="0"
                          className={cn(
                            "h-16 border-2 text-2xl font-bold",
                            errors.amount
                              ? "border-destructive"
                              : "border-transparent focus-visible:border-ring"
                          )}
                          {...register("amount", { valueAsNumber: true })}
                          autoFocus
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

                  <div className="space-y-3">
                    <Label
                      htmlFor="description"
                      className="text-xs font-semibold tracking-wider text-muted-foreground uppercase"
                    >
                      Description (Optional)
                    </Label>
                    <textarea
                      id="description"
                      placeholder="What is this expense for? (e.g., Dinner at restaurant, groceries, gas...)"
                      className="min-h-28 w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
                      {...register("description")}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: SPLIT - DESKTOP 3:7 RATIO */}
            {step === 2 && (
              <div className="space-y-6">
                {/* 2-Column Layout: Strategy (30%) + Members (70%) */}
                <div className="flex flex-col gap-6 md:flex-row">
                  {/* LEFT COLUMN: Split Strategies (30%) */}
                  <div className="w-full shrink-0 space-y-3 md:w-1/3">
                    <Label className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                      How to Split? *
                    </Label>
                    <div className="space-y-3">
                      {SPLIT_STRATEGIES.map((strategy) => (
                        <button
                          key={strategy.value}
                          type="button"
                          onClick={() =>
                            setValue(
                              "splitStrategy",
                              strategy.value as SplitStrategyEnum
                            )
                          }
                          className={cn(
                            "flex w-full flex-col items-center gap-2 rounded-lg border-2 p-4 text-center transition-all duration-200",
                            splitStrategy === strategy.value
                              ? `${strategy.bgColor} ${strategy.borderColor} shadow-md`
                              : "border-gray-200 bg-white hover:border-gray-300"
                          )}
                        >
                          <div
                            className={cn(
                              "transition-colors duration-200",
                              splitStrategy === strategy.value
                                ? strategy.color
                                : "text-gray-400"
                            )}
                          >
                            {strategy.icon}
                          </div>
                          <div>
                            <p className="text-sm leading-tight font-semibold text-foreground">
                              {strategy.label}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {strategy.description}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* RIGHT COLUMN: Members List (70%) */}
                  <div className="w-full space-y-3 md:w-2/3">
                    <Label className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                      Who is involved? *
                    </Label>

                    {/* Search Bar */}
                    <div className="relative">
                      <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Search by name or email..."
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>

                    {/* Members List */}
                    <div className="max-h-72 space-y-2 overflow-y-auto rounded-lg border border-gray-200 bg-white p-3">
                      {filteredMemberList.length > 0 ? (
                        filteredMemberList.map((member) => (
                          <div
                            key={member.id}
                            className="flex items-center gap-3 rounded-md p-3 transition-colors hover:bg-slate-50"
                          >
                            <Checkbox
                              id={`member-${member.id}`}
                              checked={debtIds.includes(
                                parseInt(member.id, 10)
                              )}
                              onCheckedChange={(checked) =>
                                handleDebtIdToggle(member.id, !!checked)
                              }
                              className="mt-0.5 shrink-0"
                            />

                            <Avatar className="h-9 w-9 shrink-0">
                              {member.avatar && (
                                <img
                                  src={member.avatar}
                                  alt={member.fullName}
                                />
                              )}
                            </Avatar>

                            <label
                              htmlFor={`member-${member.id}`}
                              className="min-w-0 flex-1 cursor-pointer"
                            >
                              <p className="truncate text-sm font-medium text-foreground">
                                {member.fullName}
                                {member.isCurrentUser && (
                                  <span className="ml-1 text-xs text-muted-foreground">
                                    (me)
                                  </span>
                                )}
                              </p>
                              <p className="truncate text-xs text-muted-foreground">
                                {member.email}
                              </p>
                            </label>

                            {debtIds.includes(parseInt(member.id, 10)) &&
                              (splitStrategy === "EXACTLY" ||
                                splitStrategy === "PERCENTAGE") && (
                                <div className="flex shrink-0 items-center gap-2">
                                  <Input
                                    type="number"
                                    step={
                                      splitStrategy === "PERCENTAGE"
                                        ? "1"
                                        : "0.01"
                                    }
                                    placeholder={
                                      splitStrategy === "PERCENTAGE"
                                        ? "0"
                                        : "0.00"
                                    }
                                    min="0"
                                    max={
                                      splitStrategy === "PERCENTAGE"
                                        ? "100"
                                        : undefined
                                    }
                                    className="h-8 w-20 text-right text-sm"
                                    value={splitAmounts?.[member.id] ?? ""}
                                    onChange={(e) =>
                                      handleSplitAmountChange(
                                        member.id,
                                        e.target.value
                                      )
                                    }
                                  />
                                  <span className="w-8 shrink-0 text-right text-xs font-semibold text-muted-foreground">
                                    {splitStrategy === "PERCENTAGE"
                                      ? "%"
                                      : "VND"}
                                  </span>
                                </div>
                              )}
                          </div>
                        ))
                      ) : (
                        <p className="py-8 text-center text-sm text-muted-foreground">
                          No members found
                        </p>
                      )}
                    </div>

                    {errors.debtIds && (
                      <p className="text-sm font-medium text-destructive">
                        {errors.debtIds.message}
                      </p>
                    )}

                    {/* Validation Summary */}
                    {debtIds.length > 0 &&
                      (splitStrategy === "EXACTLY" ||
                        splitStrategy === "PERCENTAGE") && (
                        <div
                          className={cn(
                            "flex items-start gap-2 rounded-lg p-3 text-sm",
                            splitValidation.isValid
                              ? "border border-green-200 bg-green-50 text-green-800"
                              : splitValidation.error?.includes("⚠️")
                                ? "border border-red-200 bg-red-50 text-red-800"
                                : "border border-amber-200 bg-amber-50 text-amber-800"
                          )}
                        >
                          {!splitValidation.isValid && (
                            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                          )}
                          <div className="flex-1">
                            {splitStrategy === "EXACTLY" ? (
                              <>
                                <p className="text-xs font-semibold">
                                  Total: {formatNumberVN(splitValidation.total)}{" "}
                                  / {formatNumberVN(amount)} VND
                                </p>
                                {splitValidation.error && (
                                  <p className="mt-0.5 text-xs">
                                    {splitValidation.error}
                                  </p>
                                )}
                              </>
                            ) : (
                              <>
                                <p className="text-xs font-semibold">
                                  Total: {splitValidation.total.toFixed(1)}% /
                                  100%
                                </p>
                                {splitValidation.error && (
                                  <p className="mt-0.5 text-xs">
                                    {splitValidation.error}
                                  </p>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      )}

                    {/* Equal Split Preview */}
                    {splitStrategy === "EQUALLY" && debtIds.length > 0 && (
                      <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
                        <p className="text-xs font-semibold">
                          Splitting {formatNumberVN(amount)} VND equally
                        </p>
                        <p className="mt-1 text-xs">
                          {debtIds.length} people ×{" "}
                          {formatNumberVN(perPersonAmount)} VND each
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: REVIEW - DESKTOP 2:3 RATIO */}
            {step === 3 && (
              <div className="flex flex-col gap-6 md:flex-row">
                {/* LEFT COLUMN: Summary (40%) - Sticky on Desktop */}
                <div className="w-full shrink-0 md:w-[40%]">
                  <div className="sticky top-6 space-y-4 rounded-lg border border-gray-200 bg-linear-to-br from-slate-50 to-slate-100 p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="mb-1 text-xs font-semibold text-muted-foreground uppercase">
                          Total Amount
                        </p>
                        <p className="overflow-hidden text-2xl font-bold break-all text-foreground md:text-3xl">
                          {formatNumberVN(amount)}
                          <span className="ml-2 text-lg font-semibold text-muted-foreground">
                            VND
                          </span>
                        </p>
                      </div>
                      <div className="rounded-full bg-white p-3 shadow-sm">
                        <Banknote className="h-6 w-6 text-green-600" />
                      </div>
                    </div>

                    <hr className="border-gray-300" />

                    <div>
                      <p className="mb-2 text-xs font-semibold text-muted-foreground uppercase">
                        Paid by
                      </p>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          {currentUser?.avatar && (
                            <img
                              src={currentUser.avatar}
                              alt={currentUser.userName}
                            />
                          )}
                        </Avatar>
                        <p className="text-sm font-semibold text-foreground">
                          {currentUser?.userName || "You"}
                        </p>
                      </div>
                    </div>

                    <hr className="border-gray-300" />

                    {description && (
                      <>
                        <div>
                          <p className="mb-2 text-xs font-semibold text-muted-foreground uppercase">
                            Description
                          </p>
                          <p className="line-clamp-3 text-sm text-foreground">
                            {description}
                          </p>
                        </div>
                        <hr className="border-gray-300" />
                      </>
                    )}

                    <div>
                      <p className="mb-2 text-xs font-semibold text-muted-foreground uppercase">
                        Split Strategy
                      </p>
                      <p className="text-sm font-semibold text-foreground">
                        {SPLIT_STRATEGIES.find((s) => s.value === splitStrategy)
                          ?.label || "Equally"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN: Split Breakdown (60%) */}
                <div className="w-full md:w-[60%]">
                  <div className="space-y-3">
                    <Label className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                      Split Breakdown ({debtIds.length} person
                      {debtIds.length !== 1 ? "s" : ""})
                    </Label>

                    <div className="max-h-96 divide-y overflow-y-auto rounded-lg border border-gray-200 bg-white">
                      {debtIds.map((userId) => {
                        const member = fullMemberList.find(
                          (m) => parseInt(m.id, 10) === userId
                        )
                        const userIdStr = userId.toString()
                        const splitAmount = reviewSplitAmounts[userIdStr] || 0

                        return (
                          <div
                            key={userId}
                            className="flex items-center justify-between p-4 transition-colors hover:bg-slate-50"
                          >
                            <div className="flex min-w-0 flex-1 items-center gap-3">
                              <Avatar className="h-9 w-9 shrink-0">
                                {member?.avatar && (
                                  <img
                                    src={member.avatar}
                                    alt={member?.fullName}
                                  />
                                )}
                              </Avatar>
                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-foreground">
                                  {member?.fullName}
                                </p>
                                <p className="truncate text-xs text-muted-foreground">
                                  {member?.email}
                                </p>
                              </div>
                            </div>
                            <div className="ml-4 shrink-0 text-right">
                              <p className="text-sm font-bold text-foreground">
                                {formatNumberVN(splitAmount)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                VND
                              </p>
                              {splitStrategy === "PERCENTAGE" && (
                                <p className="mt-0.5 text-xs text-muted-foreground">
                                  {splitAmounts?.[member?.id || ""] || 0}%
                                </p>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
