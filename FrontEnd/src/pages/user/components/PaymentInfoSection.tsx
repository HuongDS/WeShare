import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2, Edit2, Check, X, Search, ChevronsUpDown } from "lucide-react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import type { UserViewDto } from "@/types/user/UserViewDto"
import type { BankDto } from "@/types/banks/BankDto"
import { cn } from "@/lib/utils"

const paymentProfileSchema = z.object({
  bankId: z.string().min(1, "Vui lòng chọn ngân hàng"),
  bankAccountNumber: z
    .string()
    .min(1, "Vui lòng nhập số tài khoản ngân hàng")
    .max(50, "Số tài khoản ngân hàng tối đa 50 ký tự"),
})

type PaymentProfileFormData = z.infer<typeof paymentProfileSchema>

interface PaymentInfoSectionProps {
  userData: UserViewDto | undefined
  isLoading: boolean
  isPending: boolean
  banks: BankDto[]
  onSubmit: (data: PaymentProfileFormData) => void
}

export function PaymentInfoSection({
  userData,
  isLoading,
  isPending,
  banks,
  onSubmit,
}: PaymentInfoSectionProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [bankOpen, setBankOpen] = useState(false)
  const [bankSearchValue, setBankSearchValue] = useState("")

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PaymentProfileFormData>({
    resolver: zodResolver(paymentProfileSchema),
  })

  const selectedBankName = watch("bankId")
  const selectedBank = banks.find((b) => b.shortName === selectedBankName)

  // Initialize form with existing data
  useEffect(() => {
    if (userData) {
      const matchedBank = banks.find((bank) => bank.name === userData.bankName)
      reset({
        bankId: matchedBank ? matchedBank.shortName : "",
        bankAccountNumber: userData.defaultBankAccount || "",
      })
    }
  }, [isEditing, userData, reset, banks])

  const filteredBanks = banks.filter((bank) =>
    `${bank.name} ${bank.shortName}`
      .toLowerCase()
      .includes(bankSearchValue.toLowerCase())
  )

  const handleFormSubmit = (data: PaymentProfileFormData) => {
    onSubmit(data)
  }

  if (isLoading) {
    return null
  }

  const currentBank = banks.find((b) => b.name === userData?.bankName)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="rounded-3xl border border-border/80 bg-card p-6 shadow-xs">
        {!isEditing ? (
          // Read-Only View
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold tracking-tight text-foreground">
                Thông tin tài khoản thanh toán
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="gap-2 rounded-full hover:bg-muted text-foreground"
              >
                <Edit2 className="h-4 w-4" />
                Sửa thông tin ngân hàng
              </Button>
            </div>

            <div className="space-y-4 rounded-2xl bg-muted/40 border border-border/60 p-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Ngân hàng mặc định
                </p>
                <div className="mt-2.5 flex items-center gap-3">
                  {userData?.bankName ? (
                    <>
                      {currentBank?.logo && (
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-card border border-border p-1.5 shadow-xs">
                          <img
                            src={currentBank.logo}
                            alt={currentBank.shortName}
                            className="h-full w-full object-contain"
                          />
                        </div>
                      )}
                      <div>
                        <p className="text-base font-bold text-foreground">
                          {currentBank?.name || userData.bankName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {currentBank?.shortName || ""}
                        </p>
                      </div>
                    </>
                  ) : (
                    <p className="text-base font-semibold text-muted-foreground">
                      Chưa liên kết ngân hàng
                    </p>
                  )}
                </div>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Số tài khoản
                </p>
                <p className="mt-1 font-mono text-base font-bold text-foreground tracking-wider">
                  {userData?.defaultBankAccount || "Chưa cung cấp"}
                </p>
              </div>
            </div>
          </div>
        ) : (
          // Edit Mode
          <div className="space-y-4">
            <h2 className="text-lg font-bold tracking-tight text-foreground">
              Chỉnh sửa thông tin thanh toán
            </h2>

            <form onSubmit={handleSubmit(handleFormSubmit)}>
              <div className="space-y-4">
                {/* Bank Selection with Combobox */}
                <div>
                  <Label className="text-sm font-semibold text-foreground">
                    Ngân hàng
                  </Label>
                  <Popover open={bankOpen} onOpenChange={setBankOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "mt-1.5 w-full justify-between rounded-xl border-input bg-background py-5 text-foreground hover:bg-muted/40",
                          !selectedBankName && "text-muted-foreground"
                        )}
                      >
                        {selectedBank ? (
                          <div className="flex items-center gap-2.5 truncate">
                            {selectedBank.logo && (
                              <img
                                src={selectedBank.logo}
                                alt={selectedBank.shortName}
                                className="h-4 w-4 object-contain"
                              />
                            )}
                            <span className="truncate">{selectedBank.name}</span>
                          </div>
                        ) : (
                          "Chọn ngân hàng..."
                        )}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-[380px] max-w-[90vw] p-0 rounded-2xl border-border bg-card shadow-xl"
                      align="start"
                    >
                      <div className="space-y-2 p-3">
                        {/* Search Input */}
                        <div className="sticky top-0 z-10 flex items-center gap-2 rounded-xl border border-input bg-muted/40 px-3 py-2">
                          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                          <input
                            placeholder="Tìm kiếm ngân hàng..."
                            value={bankSearchValue}
                            onChange={(e) => setBankSearchValue(e.target.value)}
                            className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                          />
                        </div>

                        {/* Bank Options Grid */}
                        <div className="max-h-72 overflow-y-auto">
                          {filteredBanks.length === 0 ? (
                            <p className="py-8 text-center text-sm text-muted-foreground">
                              Không tìm thấy ngân hàng nào
                            </p>
                          ) : (
                            <div className="grid grid-cols-2 gap-2 p-1">
                              {filteredBanks.map((bank) => (
                                <button
                                  key={bank.id}
                                  type="button"
                                  onClick={() => {
                                    setValue("bankId", bank.shortName)
                                    setBankOpen(false)
                                    setBankSearchValue("")
                                  }}
                                  className={cn(
                                    "flex flex-col items-center gap-2 rounded-xl border-2 p-3 text-center transition-all",
                                    selectedBankName === bank.shortName
                                      ? "border-forest-ink bg-linen-mist/30 dark:border-lime-voltage dark:bg-lime-voltage/10"
                                      : "border-border hover:border-border/80 hover:bg-muted/40"
                                  )}
                                >
                                  {bank.logo ? (
                                    <img
                                      src={bank.logo}
                                      alt={bank.shortName}
                                      className="h-9 w-9 object-contain"
                                    />
                                  ) : (
                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-xs font-bold text-foreground">
                                      {bank.shortName?.substring(0, 2)}
                                    </div>
                                  )}
                                  <div className="w-full">
                                    <p className="text-xs font-bold text-foreground truncate">
                                      {bank.shortName}
                                    </p>
                                    <p className="line-clamp-1 text-[10px] text-muted-foreground">
                                      {bank.name}
                                    </p>
                                  </div>
                                  {selectedBankName === bank.shortName && (
                                    <div className="mt-0.5 rounded-full bg-forest-ink dark:bg-lime-voltage text-paper dark:text-forest-ink p-0.5">
                                      <Check className="h-3 w-3 stroke-[3]" />
                                    </div>
                                  )}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                  {errors.bankId && (
                    <p className="mt-1 text-xs text-alarm-red">
                      {errors.bankId.message}
                    </p>
                  )}
                </div>

                {/* Account Number */}
                <div>
                  <Label htmlFor="bankAccountNumber" className="text-sm font-semibold text-foreground">
                    Số tài khoản
                  </Label>
                  <Input
                    id="bankAccountNumber"
                    type="text"
                    placeholder="Nhập số tài khoản ngân hàng của bạn"
                    className="mt-1.5 rounded-xl border-input bg-background py-5 font-mono text-foreground placeholder:text-muted-foreground focus:border-forest-ink dark:focus:border-lime-voltage"
                    {...register("bankAccountNumber")}
                  />
                  {errors.bankAccountNumber && (
                    <p className="mt-1 text-xs text-alarm-red">
                      {errors.bankAccountNumber.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-6 flex gap-2">
                <Button
                  type="submit"
                  disabled={isPending}
                  className="rounded-full bg-lime-voltage hover:bg-lime-voltage/90 text-forest-ink font-bold shadow-xs px-5 gap-2"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 stroke-[2.5]" />
                      Lưu thay đổi
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsEditing(false)}
                  className="rounded-full gap-2 hover:bg-muted"
                >
                  <X className="h-4 w-4" />
                  Hủy
                </Button>
              </div>
            </form>
          </div>
        )}
      </Card>
    </motion.div>
  )
}
