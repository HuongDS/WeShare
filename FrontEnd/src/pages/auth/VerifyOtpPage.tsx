import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { motion, type Variants } from "framer-motion"
import { Zap, Loader2, ArrowRight } from "lucide-react"
import { toast } from "sonner"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/hooks/auth/useAuth"

interface LocationState {
  email?: string
}

export default function VerifyOtpPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [otp, setOtp] = useState("")

  const { verifyOtp } = useAuth()

  const email = (location.state as LocationState)?.email

  useEffect(() => {
    if (!email) {
      navigate("/auth", { replace: true })
    }
  }, [email, navigate])

  if (!email) {
    return null
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

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()

    if (otp.trim().length === 0) {
      toast.error("Please enter the OTP code.")
      return
    }

    if (otp.trim().length > 6) {
      toast.error("OTP must be at most 6 characters.")
      return
    }

    try {
      if (!email) {
        toast.error("Email information is missing. Please try again.")
        navigate("/auth", { replace: true })
        return
      }

      await verifyOtp.mutateAsync({
        email: email,
        otp: otp.trim(),
      })

      toast.success("Email verified successfully!")
      setTimeout(() => {
        navigate("/auth")
      }, 1500)
    } catch (error) {
      console.error("OTP verification failed:", error)
    }
  }

  return (
    <div className="min-h-screen overflow-hidden bg-linear-to-br from-white to-slate-50">
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
              className="mb-6 inline-flex items-center justify-center rounded-full bg-linear-to-br from-primary to-primary/80 p-3"
            >
              <Zap className="h-8 w-8 text-white" />
            </motion.div>

            {/* Title */}
            <h2 className="mb-4 text-2xl font-bold text-slate-800">
              Verify Your Email
            </h2>

            {/* Description with email */}
            <p className="mb-2 text-slate-600">
              We've sent a verification code to:
            </p>
            <p className="mb-8 font-medium text-slate-800">{email}</p>
            <p className="text-slate-600">
              Please enter the code below to complete your registration.
            </p>
          </motion.div>

          {/* Verification Card */}
          <motion.div variants={itemVariants}>
            <Card className="border border-slate-200 bg-white shadow-lg">
              <div className="p-6">
                <motion.form
                  onSubmit={handleVerifyOtp}
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-4"
                >
                  {/* OTP Input Field */}
                  <motion.div variants={itemVariants} className="space-y-2">
                    <Label htmlFor="verify-otp" className="text-slate-700">
                      Verification Code
                    </Label>
                    <Input
                      id="verify-otp"
                      type="text"
                      placeholder="Enter 6-digit code"
                      className="border-slate-300 bg-white py-6 text-center font-mono text-lg tracking-widest text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
                      value={otp}
                      onChange={(e) =>
                        setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                      }
                      maxLength={6}
                      required
                      disabled={verifyOtp.isPending}
                    />
                  </motion.div>

                  {/* Submit Button */}
                  <motion.div variants={itemVariants}>
                    <Button
                      type="submit"
                      className="w-full gap-2"
                      disabled={verifyOtp.isPending}
                    >
                      {verifyOtp.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          Verify Email
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </motion.div>

                  {/* Back to Login */}
                  <motion.div variants={itemVariants} className="text-center">
                    <button
                      type="button"
                      onClick={() => navigate("/auth")}
                      className="text-sm text-slate-600 transition-colors hover:text-slate-900"
                    >
                      Back to Login
                    </button>
                  </motion.div>
                </motion.form>
              </div>
            </Card>
          </motion.div>

          {/* Footer Note */}
          <motion.p
            variants={itemVariants}
            className="mt-8 text-center text-xs text-slate-600"
          >
            This code will expire in 15 minutes.
          </motion.p>
        </motion.div>
      </div>
    </div>
  )
}
