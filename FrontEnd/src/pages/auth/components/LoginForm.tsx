import { useState } from "react"
import { motion, type Variants } from "framer-motion"
import { Mail, Lock, Loader2, ArrowRight } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/hooks/auth/useAuth"

interface LoginFormProps {
  containerVariants: {
    hidden: { opacity: number }
    visible: {
      opacity: number
      transition: {
        staggerChildren: number
        delayChildren: number
      }
    }
  }
  itemVariants: Variants
}

export default function LoginForm({
  containerVariants,
  itemVariants,
}: LoginFormProps) {
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const navigate = useNavigate()
  const { login } = useAuth()

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  const validateEmail = (email: string): boolean => {
    return emailRegex.test(email)
  }

  const validatePassword = (password: string): boolean => {
    return password.length <= 200 && password.length > 0
  }

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (!validateEmail(loginEmail)) {
        toast.error("Vui lòng nhập địa chỉ email hợp lệ.")
        return
      }
      if (!validatePassword(loginPassword)) {
        toast.error("Mật khẩu không được vượt quá 200 ký tự.")
        return
      }
      await login.mutateAsync({ email: loginEmail, password: loginPassword })
      navigate("/dashboard")
    } catch (error) {
      console.error("Login failed:", error)
    }
  }

  return (
    <motion.form
      onSubmit={handleLoginSubmit}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      {/* Email Field */}
      <motion.div variants={itemVariants} className="space-y-1.5">
        <Label htmlFor="login-email" className="text-xs font-semibold text-foreground">
          Địa chỉ Email
        </Label>
        <div className="relative">
          <Mail className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="login-email"
            type="email"
            placeholder="you@example.com"
            className="rounded-xl border-input bg-background py-5 pl-10 text-foreground placeholder:text-muted-foreground focus:border-forest-ink dark:focus:border-lime-voltage"
            value={loginEmail}
            onChange={(e) => setLoginEmail(e.target.value)}
            required
          />
        </div>
      </motion.div>

      {/* Password Field */}
      <motion.div variants={itemVariants} className="space-y-1.5">
        <Label htmlFor="login-password" className="text-xs font-semibold text-foreground">
          Mật khẩu
        </Label>
        <div className="relative">
          <Lock className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="login-password"
            type="password"
            placeholder="••••••••"
            className="rounded-xl border-input bg-background py-5 pl-10 text-foreground placeholder:text-muted-foreground focus:border-forest-ink dark:focus:border-lime-voltage"
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
            required
          />
        </div>
      </motion.div>

      {/* Forgot Password Link */}
      <motion.div variants={itemVariants} className="flex justify-end">
        <button
          type="button"
          onClick={() => navigate("/forgot-password")}
          className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          Quên mật khẩu?
        </button>
      </motion.div>

      {/* Submit Button */}
      <motion.div variants={itemVariants}>
        <Button
          type="submit"
          className="w-full rounded-full bg-lime-voltage hover:bg-lime-voltage/90 text-forest-ink font-bold shadow-xs py-5 gap-2"
          disabled={login.isPending}
        >
          {login.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Đang đăng nhập...
            </>
          ) : (
            <>
              Đăng nhập
              <ArrowRight className="h-4 w-4 stroke-[2.5]" />
            </>
          )}
        </Button>
      </motion.div>
    </motion.form>
  )
}
