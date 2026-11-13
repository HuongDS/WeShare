import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion, type Variants } from "framer-motion"
import { Mail, Loader2, ArrowLeft, Zap, ArrowRight } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { useAuth } from "@/hooks/auth/useAuth"
import { EMAIL_REGEX } from "@/constants/regex"

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const { forgotPassword } = useAuth()

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

  const validateEmail = (emailToValidate: string): boolean => {
    return EMAIL_REGEX.test(emailToValidate)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim()) {
      toast.error("Vui lòng nhập địa chỉ email của bạn.")
      return
    }

    if (!validateEmail(email)) {
      toast.error("Vui lòng nhập địa chỉ email hợp lệ.")
      return
    }

    try {
      await forgotPassword.mutateAsync({ email })
      navigate("/reset-password", { state: { email } })
    } catch (error) {
      console.error("Forgot password failed:", error)
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
            Quên mật khẩu?
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Nhập email của bạn và chúng tôi sẽ gửi mã OTP để đặt lại mật khẩu.
          </p>
        </motion.div>

        {/* Card */}
        <motion.div variants={itemVariants}>
          <Card className="rounded-3xl border border-border/80 bg-card p-6 shadow-xl space-y-5">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold text-foreground">
                  Địa chỉ Email
                </Label>
                <div className="relative">
                  <Mail className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className="rounded-xl border-input bg-background py-5 pl-10 text-foreground placeholder:text-muted-foreground focus:border-forest-ink dark:focus:border-lime-voltage"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={forgotPassword.isPending}
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={forgotPassword.isPending}
                className="w-full rounded-full bg-lime-voltage hover:bg-lime-voltage/90 text-forest-ink font-bold shadow-xs py-5 gap-2"
              >
                {forgotPassword.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Đang gửi mã...
                  </>
                ) : (
                  <>
                    Gửi mã xác thực OTP
                    <ArrowRight className="h-4 w-4 stroke-[2.5]" />
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
                Quay lại Đăng nhập
              </Button>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  )
}
