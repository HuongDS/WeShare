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

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()

    if (otp.trim().length === 0) {
      toast.error("Vui lòng nhập mã OTP.")
      return
    }

    if (otp.trim().length > 6) {
      toast.error("Mã OTP tối đa 6 ký tự.")
      return
    }

    try {
      if (!email) {
        toast.error("Thiếu thông tin email. Vui lòng thử lại.")
        navigate("/auth", { replace: true })
        return
      }

      await verifyOtp.mutateAsync({
        email: email,
        otp: otp.trim(),
      })

      toast.success("Xác thực email thành công!")
      setTimeout(() => {
        navigate("/auth")
      }, 1500)
    } catch (error) {
      console.error("OTP verification failed:", error)
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
            <Zap className="h-7 w-7 fill-current stroke-[2.5]" />
          </motion.div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
            Xác thực Email
          </h2>
          <div className="space-y-1 text-xs sm:text-sm text-muted-foreground">
            <p>Chúng tôi đã gửi mã xác thực 6 số đến:</p>
            <p className="font-bold text-foreground">{email}</p>
          </div>
        </motion.div>

        {/* Verification Card */}
        <motion.div variants={itemVariants}>
          <Card className="rounded-3xl border border-border/80 bg-card p-6 shadow-xl space-y-5">
            <motion.form
              onSubmit={handleVerifyOtp}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-4"
            >
              {/* OTP Input Field */}
              <div className="space-y-1.5 text-center">
                <Label htmlFor="verify-otp" className="text-xs font-semibold text-foreground">
                  Mã xác thực (OTP)
                </Label>
                <Input
                  id="verify-otp"
                  type="text"
                  placeholder="••••••"
                  className="rounded-xl border-input bg-background py-6 text-center font-mono text-2xl font-bold tracking-[0.5em] text-foreground placeholder:text-muted-foreground focus:border-forest-ink dark:focus:border-lime-voltage"
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  maxLength={6}
                  required
                  disabled={verifyOtp.isPending}
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full rounded-full bg-lime-voltage hover:bg-lime-voltage/90 text-forest-ink font-bold shadow-xs py-5 gap-2"
                disabled={verifyOtp.isPending}
              >
                {verifyOtp.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Đang xác thực...
                  </>
                ) : (
                  <>
                    Xác thực &amp; Tiếp tục
                    <ArrowRight className="h-4 w-4 stroke-[2.5]" />
                  </>
                )}
              </Button>

              {/* Back to Login */}
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => navigate("/auth")}
                  className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
                >
                  Quay lại Đăng nhập
                </button>
              </div>
            </motion.form>
          </Card>
        </motion.div>

        {/* Footer Note */}
        <p className="text-center text-xs text-muted-foreground">
          Mã xác thực này sẽ hết hạn trong 15 phút.
        </p>
      </motion.div>
    </div>
  )
}
