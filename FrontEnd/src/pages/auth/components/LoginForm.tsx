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
        toast.error("Please enter a valid email address.")
        return
      }
      if (!validatePassword(loginPassword)) {
        toast.error("Password must be 200 characters or less.")
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
      <motion.div variants={itemVariants} className="space-y-2">
        <Label htmlFor="login-email" className="text-slate-700">
          Email Address
        </Label>
        <div className="relative">
          <Mail className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <Input
            id="login-email"
            type="email"
            placeholder="you@example.com"
            className="border-slate-300 bg-white py-6 pl-10 text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
            value={loginEmail}
            onChange={(e) => setLoginEmail(e.target.value)}
            required
          />
        </div>
      </motion.div>

      {/* Password Field */}
      <motion.div variants={itemVariants} className="space-y-2">
        <Label htmlFor="login-password" className="text-slate-700">
          Password
        </Label>
        <div className="relative">
          <Lock className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <Input
            id="login-password"
            type="password"
            placeholder="••••••••"
            className="border-slate-300 bg-white py-6 pl-10 text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
            required
          />
        </div>
      </motion.div>

      {/* Forgot Password Link */}
      <motion.div variants={itemVariants} className="flex justify-end">
        <button className="text-sm text-primary transition-colors hover:text-primary/80">
          Forgot password?
        </button>
      </motion.div>

      {/* Submit Button */}
      <motion.div variants={itemVariants}>
        <Button
          type="submit"
          className="w-full gap-2"
          disabled={login.isPending}
        >
          {login.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            <>
              Sign In
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </motion.div>
    </motion.form>
  )
}
