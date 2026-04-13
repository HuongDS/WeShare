import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { motion, type Variants } from "framer-motion"
import {
  Lock,
  Loader2,
  ArrowLeft,
  Eye,
  EyeOff,
  Unlock,
  ShieldCheck,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { useAuth } from "@/hooks/auth/useAuth"
import { PASSWORD_REGEX } from "@/constants/regex"

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const emailFromState = (location.state as { email?: string })?.email
  const { resetPassword } = useAuth()

  const [otp, setOtp] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<{
    otp?: string
    newPassword?: string
    confirmPassword?: string
  }>({})

  if (!emailFromState) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-white to-slate-50">
        <Card className="max-w-md border border-slate-200 bg-white p-6 text-center shadow-lg">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h2 className="mb-2 text-lg font-bold text-slate-900">
            Invalid Access
          </h2>
          <p className="mb-4 text-sm text-slate-500">
            Please request a password reset to access this page.
          </p>
          <Button
            onClick={() => navigate("/forgot-password")}
            className="w-full bg-primary hover:bg-primary/90"
          >
            Go to Forgot Password
          </Button>
        </Card>
      </div>
    )
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10,
      },
    },
  }

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {}

    if (!otp.trim()) {
      newErrors.otp = "OTP is required."
    }

    if (!newPassword.trim()) {
      newErrors.newPassword = "Password is required."
    } else if (!PASSWORD_REGEX.test(newPassword)) {
      newErrors.newPassword =
        "Password must have at least 8 characters, 1 number, and 1 special character."
    }

    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match."
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      await resetPassword.mutateAsync({
        email: emailFromState,
        otp,
        newPassword,
      })
      navigate("/auth")
    } catch (error) {
      console.error("Reset password failed:", error)
    }
  }

  return (
    <div className="min-h-screen overflow-hidden bg-gradient-to-br from-white to-slate-50">
      {/* Main Container */}
      <div className="flex min-h-screen flex-col items-center justify-center p-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-md"
        >
          {/* Header Section */}
          <motion.div variants={itemVariants} className="mb-12 text-center">
            {/* Branding Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 100, delay: 0.2 }}
              className="mb-6 inline-flex items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80 p-3"
            >
              <ShieldCheck className="h-8 w-8 text-white" />
            </motion.div>

            {/* Title */}
            <h2 className="mb-2 text-2xl font-bold text-slate-800">
              Reset Password
            </h2>
            <p className="mb-8 text-sm text-slate-500">
              Enter the OTP and create a new password.
            </p>

            {/* Card */}
            <motion.div variants={itemVariants}>
              <Card className="border border-slate-200 bg-white shadow-lg">
                <div className="p-6">
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* OTP Field */}
                    <motion.div variants={itemVariants} className="space-y-2">
                      <Label htmlFor="otp" className="text-slate-700">
                        One-Time Password (OTP)
                      </Label>
                      <div className="relative">
                        <Unlock className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-slate-400" />
                        <Input
                          id="otp"
                          type="text"
                          placeholder="Enter OTP"
                          className={`border-slate-300 bg-white py-6 pr-4 pl-10 text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 ${
                            errors.otp ? "border-red-500" : ""
                          }`}
                          value={otp}
                          onChange={(e) => {
                            setOtp(e.target.value)
                            if (errors.otp)
                              setErrors({ ...errors, otp: undefined })
                          }}
                          disabled={resetPassword.isPending}
                          required
                        />
                      </div>
                      {errors.otp && (
                        <p className="text-xs text-red-500">{errors.otp}</p>
                      )}
                    </motion.div>

                    {/* New Password Field */}
                    <motion.div variants={itemVariants} className="space-y-2">
                      <Label htmlFor="new-password" className="text-slate-700">
                        New Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-slate-400" />
                        <Input
                          id="new-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className={`border-slate-300 bg-white py-6 pr-10 pl-10 text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 ${
                            errors.newPassword ? "border-red-500" : ""
                          }`}
                          value={newPassword}
                          onChange={(e) => {
                            setNewPassword(e.target.value)
                            if (errors.newPassword)
                              setErrors({ ...errors, newPassword: undefined })
                          }}
                          disabled={resetPassword.isPending}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                      {errors.newPassword && (
                        <p className="text-xs text-red-500">
                          {errors.newPassword}
                        </p>
                      )}
                      <div className="mt-2 space-y-1 text-xs text-slate-500">
                        <p>Password must contain:</p>
                        <ul className="ml-4 space-y-0.5">
                          <li
                            className={
                              newPassword.length >= 8
                                ? "text-green-600"
                                : "text-slate-400"
                            }
                          >
                            ✓ At least 8 characters
                          </li>
                          <li
                            className={
                              /\d/.test(newPassword)
                                ? "text-green-600"
                                : "text-slate-400"
                            }
                          >
                            ✓ At least 1 number
                          </li>
                          <li
                            className={
                              /[!@#$%^&*]/.test(newPassword)
                                ? "text-green-600"
                                : "text-slate-400"
                            }
                          >
                            ✓ At least 1 special character (!@#$%^&*)
                          </li>
                        </ul>
                      </div>
                    </motion.div>

                    {/* Confirm Password Field */}
                    <motion.div variants={itemVariants} className="space-y-2">
                      <Label
                        htmlFor="confirm-password"
                        className="text-slate-700"
                      >
                        Confirm Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-slate-400" />
                        <Input
                          id="confirm-password"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className={`border-slate-300 bg-white py-6 pr-10 pl-10 text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 ${
                            errors.confirmPassword ? "border-red-500" : ""
                          }`}
                          value={confirmPassword}
                          onChange={(e) => {
                            setConfirmPassword(e.target.value)
                            if (errors.confirmPassword)
                              setErrors({
                                ...errors,
                                confirmPassword: undefined,
                              })
                          }}
                          disabled={resetPassword.isPending}
                          required
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-xs text-red-500">
                          {errors.confirmPassword}
                        </p>
                      )}
                    </motion.div>

                    {/* Submit Button */}
                    <motion.div variants={itemVariants}>
                      <Button
                        type="submit"
                        disabled={resetPassword.isPending}
                        className="w-full bg-gradient-to-r from-primary to-primary/80 py-6 text-base font-semibold text-white hover:from-primary/90 hover:to-primary/70"
                      >
                        {resetPassword.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Resetting...
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="mr-2 h-4 w-4" />
                            Reset Password
                          </>
                        )}
                      </Button>
                    </motion.div>
                  </form>

                  {/* Back to Login Link */}
                  <motion.div
                    variants={itemVariants}
                    className="mt-4 text-center"
                  >
                    <Button
                      variant="ghost"
                      onClick={() => navigate("/auth")}
                      className="text-sm text-slate-600 hover:text-primary"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to Login
                    </Button>
                  </motion.div>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
