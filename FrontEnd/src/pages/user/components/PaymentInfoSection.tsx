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

const paymentProfileSchema = z.object({
  bankId: z.string().min(1, "Please select a bank"),
  bankAccountNumber: z
    .string()
    .min(1, "Bank account number is required")
    .max(50, "Bank account number must be at most 50 characters"),
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
      <Card className="border border-slate-200 bg-white p-6">
        {!isEditing ? (
          // Read-Only View
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                Payment Information
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="gap-2 hover:bg-slate-100"
              >
                <Edit2 className="h-4 w-4" />
                Edit Payment Info
              </Button>
            </div>

            <div className="space-y-4 rounded-lg bg-slate-50 p-4">
              <div>
                <p className="text-xs font-medium text-slate-500">Bank</p>
                <div className="mt-3 flex items-center gap-3">
                  {userData?.bankName !== undefined ? (
                    <>
                      {currentBank?.logo && (
                        <img
                          src={currentBank.logo}
                          alt={currentBank.shortName}
                          className="h-12 w-12 object-contain"
                        />
                      )}
                      <div>
                        <p className="text-lg font-medium text-slate-900">
                          {currentBank?.name || "N/A"}
                        </p>
                        <p className="text-xs text-slate-500">
                          {currentBank?.shortName || ""}
                        </p>
                      </div>
                    </>
                  ) : (
                    <p className="text-lg font-medium text-slate-900">N/A</p>
                  )}
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">
                  Account Number
                </p>
                <p className="mt-1 font-mono text-sm font-semibold text-slate-900">
                  {userData?.defaultBankAccount || "N/A"}
                </p>
              </div>
            </div>
          </div>
        ) : (
          // Edit Mode
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">
              Edit Payment Information
            </h2>

            <form onSubmit={handleSubmit(handleFormSubmit)}>
              <div className="space-y-3">
                {/* Bank Selection with Combobox */}
                <div>
                  <Label className="text-slate-700">Bank</Label>
                  <Popover open={bankOpen} onOpenChange={setBankOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={`mt-2 w-full justify-between border-slate-300 ${
                          !selectedBankName ? "text-slate-400" : ""
                        }`}
                      >
                        {selectedBank ? (
                          <div className="flex items-center gap-2">
                            {selectedBank.logo && (
                              <img
                                src={selectedBank.logo}
                                alt={selectedBank.shortName}
                                className="h-4 w-4 object-contain"
                              />
                            )}
                            <span>{selectedBank.name}</span>
                          </div>
                        ) : (
                          "Select a bank..."
                        )}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-125 max-w-[90vw] p-0 sm:w-150"
                      align="start"
                    >
                      <div className="space-y-2 p-3">
                        {/* Search Input */}
                        <div className="sticky top-0 z-10 flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2">
                          <Search className="h-4 w-4 shrink-0 text-slate-400" />
                          <input
                            placeholder="Search banks..."
                            value={bankSearchValue}
                            onChange={(e) => setBankSearchValue(e.target.value)}
                            className="flex-1 bg-transparent outline-none"
                          />
                        </div>

                        {/* Bank Options Grid */}
                        <div className="max-h-96 overflow-y-auto">
                          {filteredBanks.length === 0 ? (
                            <p className="py-8 text-center text-sm text-slate-500">
                              No banks found
                            </p>
                          ) : (
                            <div className="grid grid-cols-2 gap-2 p-2 md:grid-cols-3">
                              {filteredBanks.map((bank) => (
                                <button
                                  key={bank.id}
                                  type="button"
                                  onClick={() => {
                                    setValue("bankId", bank.shortName)
                                    setBankOpen(false)
                                    setBankSearchValue("")
                                  }}
                                  className={`flex flex-col items-center gap-2 rounded-lg border-2 p-3 text-center transition-all ${
                                    selectedBankName === bank.shortName
                                      ? "border-primary bg-primary/5"
                                      : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                                  }`}
                                >
                                  {bank.logo ? (
                                    <img
                                      src={bank.logo}
                                      alt={bank.shortName}
                                      className="h-10 w-10 object-contain"
                                    />
                                  ) : (
                                    <div className="flex h-10 w-10 items-center justify-center rounded bg-slate-200 text-xs font-semibold text-slate-600">
                                      {bank.shortName?.substring(0, 2)}
                                    </div>
                                  )}
                                  <div className="w-full">
                                    <p className="text-xs font-semibold text-slate-900">
                                      {bank.shortName}
                                    </p>
                                    <p className="line-clamp-2 text-xs text-slate-500">
                                      {bank.name}
                                    </p>
                                  </div>
                                  {selectedBankName === bank.shortName && (
                                    <div className="mt-1 rounded-full bg-primary p-0.5">
                                      <Check className="h-3 w-3 text-white" />
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
                    <p className="mt-1 text-xs text-red-500">
                      {errors.bankId.message}
                    </p>
                  )}
                </div>

                {/* Account Number */}
                <div>
                  <Label htmlFor="bankAccountNumber" className="text-slate-700">
                    Account Number
                  </Label>
                  <Input
                    id="bankAccountNumber"
                    type="text"
                    placeholder="Enter your bank account number"
                    className="mt-2 border-slate-300 bg-white py-6 text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
                    {...register("bankAccountNumber")}
                  />
                  {errors.bankAccountNumber && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.bankAccountNumber.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-6 flex gap-2">
                <Button
                  type="submit"
                  disabled={isPending}
                  className="gap-2 bg-linear-to-r from-primary to-primary/80 text-white hover:from-primary/90 hover:to-primary/70"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsEditing(false)}
                  className="gap-2"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}
      </Card>
    </motion.div>
  )
}
