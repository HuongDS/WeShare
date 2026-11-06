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
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full rounded-3xl border border-border/80 bg-card p-6 text-center shadow-xl">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-alarm-red" />
          <h2 className="mb-2 text-xl font-bold text-foreground">
            Invalid Access
          </h2>
          <p className="mb-6 text-xs sm:text-sm text-muted-foreground">
            Please request a password reset to access this page.
          </p>
          <Button
            onClick={() => navigate("/forgot-password")}
            className="w-full rounded-full bg-lime-voltage hover:bg-lime-voltage/90 text-forest-ink font-bold shadow-xs py-5"
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
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 120,
        damping: 12,
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
    <div className="min-h-screen overflow-hidden bg-background flex flex-col items-center justify-center p-4 sm:p-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md space-y-6"
      >
        {/* Header Section */}
        <motion.div variants={itemVariants} className="text-center space-y-3">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 120, delay: 0.1 }}
            className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-lime-voltage text-forest-ink shadow-md"
          >
            <ShieldCheck className="h-7 w-7 stroke-[2.5]" />
          </motion.div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
            Reset Password
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Enter the OTP and create a new secure password.
          </p>
        </motion.div>

        {/* Card */}
        <motion.div variants={itemVariants}>
          <Card className="rounded-3xl border border-border/80 bg-card p-6 shadow-xl space-y-5">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* OTP Field */}
              <div className="space-y-1.5">
                <Label htmlFor="otp" className="text-xs font-semibold text-foreground">
                  One-Time Password (OTP)
                </Label>
                <div className="relative">
                  <Unlock className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter OTP"
                    className={`rounded-xl border-input bg-background py-5 pl-10 text-foreground placeholder:text-muted-foreground focus:border-forest-ink dark:focus:border-lime-voltage ${
                      errors.otp ? "border-alarm-red" : ""
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
                  <p className="text-xs text-alarm-red">{errors.otp}</p>
                )}
              </div>

              {/* New Password Field */}
              <div className="space-y-1.5">
                <Label htmlFor="new-password" className="text-xs font-semibold text-foreground">
                  New Password
                </Label>
                <div className="relative">
                  <Lock className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className={`rounded-xl border-input bg-background py-5 pr-10 pl-10 text-foreground placeholder:text-muted-foreground focus:border-forest-ink dark:focus:border-lime-voltage ${
                      errors.newPassword ? "border-alarm-red" : ""
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
                    className="absolute top-1/2 right-3.5 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="text-xs text-alarm-red">
                    {errors.newPassword}
                  </p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="confirm-password"
                  className="text-xs font-semibold text-foreground"
                >
                  Confirm Password
                </Label>
                <div className="relative">
                  <Lock className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className={`rounded-xl border-input bg-background py-5 pr-10 pl-10 text-foreground placeholder:text-muted-foreground focus:border-forest-ink dark:focus:border-lime-voltage ${
                      errors.confirmPassword ? "border-alarm-red" : ""
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
                    className="absolute top-1/2 right-3.5 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-alarm-red">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={resetPassword.isPending}
                className="w-full rounded-full bg-lime-voltage hover:bg-lime-voltage/90 text-forest-ink font-bold shadow-xs py-5 gap-2"
              >
                {resetPassword.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4 stroke-[2.5]" />
                    Reset Password
                  </>
                )}
              </Button>
            </form>

            <div className="text-center pt-2">
              <Button
                variant="ghost"
                onClick={() => navigate("/auth")}
                className="rounded-full text-xs font-semibold text-muted-foreground hover:text-foreground gap-1.5"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Login
              </Button>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  )
}
