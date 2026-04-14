import { useState } from "react"
import { Loader2 } from "lucide-react"
import { motion } from "framer-motion"
import { useGetAllBanks } from "@/hooks/banks/useGetBanks"
import { useUser } from "@/hooks/user/useUser"
import { GeneralInfoSection } from "./components/GeneralInfoSection"
import { PaymentInfoSection } from "./components/PaymentInfoSection"
import {
  ReviewChangesDialog,
  DiffDisplay,
} from "./components/ReviewChangesDialog"

interface GeneralProfileFormData {
  userName: string
}

interface PaymentProfileFormData {
  bankId: string
  bankAccountNumber: string
}

export default function UserProfilePage() {
  const { getUserProfile, updateUserProfile, updateUserPaymentProfile } =
    useUser()
  const { getBanks } = useGetAllBanks()

  // Review Dialog States
  const [showGeneralReview, setShowGeneralReview] = useState(false)
  const [showPaymentReview, setShowPaymentReview] = useState(false)
  const [pendingGeneralData, setPendingGeneralData] =
    useState<GeneralProfileFormData | null>(null)
  const [pendingPaymentData, setPendingPaymentData] =
    useState<PaymentProfileFormData | null>(null)

  const userData = getUserProfile.data?.data

  /**
   * Handle General Profile Submit
   */
  const handleGeneralSubmit = (data: GeneralProfileFormData) => {
    setPendingGeneralData(data)
    setShowGeneralReview(true)
  }

  /**
   * Handle Payment Profile Submit
   */
  const handlePaymentSubmit = (data: PaymentProfileFormData) => {
    setPendingPaymentData(data)
    setShowPaymentReview(true)
  }

  /**
   * Confirm General Profile Changes
   */
  const confirmGeneralChanges = () => {
    if (pendingGeneralData) {
      updateUserProfile.mutate(
        {
          fullName: pendingGeneralData.userName,
          avatar: "",
        },
        {
          onSuccess: () => {
            setShowGeneralReview(false)
            setPendingGeneralData(null)
          },
        }
      )
    }
  }

  /**
   * Confirm Payment Profile Changes
   */
  const confirmPaymentChanges = () => {
    if (pendingPaymentData) {
      const selectedBank = getBanks.data?.data?.find(
        (bank) => bank.shortName.toString() === pendingPaymentData.bankId
      )

      if (selectedBank) {
        updateUserPaymentProfile.mutate(
          {
            bankName: selectedBank.name,
            bankAccount: pendingPaymentData.bankAccountNumber,
            bankBin: selectedBank.bin,
          },
          {
            onSuccess: () => {
              setShowPaymentReview(false)
              setPendingPaymentData(null)
            },
          }
        )
      }
    }
  }

  /**
   * Get Selected Bank for review
   */
  const selectedBank = getBanks.data?.data?.find(
    (bank) => bank.shortName.toString() === pendingPaymentData?.bankId
  )

  /**
   * Loading State
   */
  if (getUserProfile.isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-slate-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full bg-slate-50 py-8">
      <div className="mx-auto w-full max-w-4xl space-y-6 px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <h1 className="text-3xl font-bold text-slate-900">
            Profile Settings
          </h1>
          <p className="text-sm text-slate-500">
            Manage your account information and payment settings.
          </p>
        </motion.div>

        {/* General Information Section */}
        <GeneralInfoSection
          userData={userData}
          isLoading={getUserProfile.isLoading}
          isPending={updateUserProfile.isPending}
          onSubmit={handleGeneralSubmit}
        />

        {/* Payment Information Section */}
        <PaymentInfoSection
          userData={userData}
          isLoading={getUserProfile.isLoading}
          isPending={updateUserPaymentProfile.isPending}
          banks={getBanks.data?.data || []}
          onSubmit={handlePaymentSubmit}
        />

        {/* Review Changes Dialog - General */}
        <ReviewChangesDialog
          open={showGeneralReview}
          onOpenChange={setShowGeneralReview}
          title="Review Changes"
          isPending={updateUserProfile.isPending}
          onConfirm={confirmGeneralChanges}
        >
          <DiffDisplay
            label="Full Name"
            oldValue={userData?.fullName}
            newValue={pendingGeneralData?.userName}
          />
        </ReviewChangesDialog>

        {/* Review Changes Dialog - Payment */}
        <ReviewChangesDialog
          open={showPaymentReview}
          onOpenChange={setShowPaymentReview}
          title="Review Changes"
          isPending={updateUserPaymentProfile.isPending}
          onConfirm={confirmPaymentChanges}
        >
          <div className="space-y-3">
            <DiffDisplay
              label="Bank"
              oldValue={
                getBanks.data?.data?.find(
                  (bank) => bank.name === userData?.bankName
                )?.name || "N/A"
              }
              newValue={selectedBank?.name || "N/A"}
              icon={
                selectedBank?.logo ? (
                  <img
                    src={selectedBank.logo}
                    alt={selectedBank.shortName}
                    className="h-4 w-4 object-contain"
                  />
                ) : undefined
              }
            />
            <DiffDisplay
              label="Account Number"
              oldValue={
                <span className="font-mono">
                  {userData?.defaultBankAccount || "N/A"}
                </span>
              }
              newValue={
                <span className="font-mono">
                  {pendingPaymentData?.bankAccountNumber || "N/A"}
                </span>
              }
            />
          </div>
        </ReviewChangesDialog>
      </div>
    </div>
  )
}
