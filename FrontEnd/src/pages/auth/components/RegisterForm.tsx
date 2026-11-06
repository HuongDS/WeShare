import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion, type Variants } from "framer-motion"
import {
  Mail,
  Lock,
  User,
  Loader2,
  ArrowRight,
  XCircle,
  CheckCircle2,
  Eye,
  EyeOff,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useVerifyEmail } from "@/hooks/auth/useVerifyEmail"
import { useAuth } from "@/hooks/auth/useAuth"
import { PASSWORD_REGEX, EMAIL_REGEX } from "@/constants/regex"

interface RegisterFormProps {
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
  isLoading?: boolean
}

export default function RegisterForm({
  containerVariants,
  itemVariants,
  isLoading = false,
}: RegisterFormProps) {
  const navigate = useNavigate()
  const [registerName, setRegisterName] = useState("")
  const [registerEmail, setRegisterEmail] = useState("")
  const [registerPassword, setRegisterPassword] = useState("")
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("")
  const [isEmailVerified, setIsEmailVerified] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const { verifyEmail, isVerifying, emailData } = useVerifyEmail()
  const { register } = useAuth()

  const validateEmail = (email: string): boolean => {
    return EMAIL_REGEX.test(email)
  }

  const handleEmailBlur = async () => {
    if (registerEmail.trim() !== "") {
      try {
        const result = await verifyEmail(registerEmail)
        if (result?.format && result?.dns && !result?.disposable) {
          setIsEmailVerified(true)
        } else {
          setIsEmailVerified(false)
        }
      } catch {
        setIsEmailVerified(false)
      }
    }
  }

  const validatePassword = (password: string): boolean => {
    return PASSWORD_REGEX.test(password)
  }

  const validateName = (name: string): boolean => {
    return name.trim().length > 0 && name.length <= 100
  }

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (!validateName(registerName)) {
        toast.error("Please enter a valid name (1-100 characters).")
        return
      }
      if (!validateEmail(registerEmail)) {
        toast.error("Please enter a valid email address.")
        return
      }
      if (!isEmailVerified) {
        toast.error("Please verify your email first.")
        return
      }
      if (!validatePassword(registerPassword)) {
        toast.error("Password must be 200 characters or less.")
        return
      }
      if (registerPassword !== registerConfirmPassword) {
        toast.error("Passwords do not match.")
        return
      }

      await register.mutateAsync({
        fullName: registerName,
        email: registerEmail,
        password: registerPassword,
      })

      navigate("/verify-otp", { state: { email: registerEmail } })
    } catch (error) {
      console.error("Registration failed:", error)
    }
  }

  return (
    <motion.form
      onSubmit={handleRegisterSubmit}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      {/* Full Name Field */}
      <motion.div variants={itemVariants} className="space-y-1.5">
        <Label htmlFor="register-name" className="text-xs font-semibold text-foreground">
          Full Name
        </Label>
        <div className="relative">
          <User className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="register-name"
            type="text"
            placeholder="John Doe"
            className="rounded-xl border-input bg-background py-5 pl-10 text-foreground placeholder:text-muted-foreground focus:border-forest-ink dark:focus:border-lime-voltage"
            value={registerName}
            onChange={(e) => setRegisterName(e.target.value)}
            required
          />
        </div>
      </motion.div>

      {/* Email Field */}
      <motion.div variants={itemVariants} className="space-y-1.5">
        <Label htmlFor="register-email" className="text-xs font-semibold text-foreground">
          Email Address
        </Label>
        <div className="relative">
          <Mail className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="register-email"
            type="email"
            placeholder="you@example.com"
            className="rounded-xl border-input bg-background py-5 pr-10 pl-10 text-foreground placeholder:text-muted-foreground focus:border-forest-ink dark:focus:border-lime-voltage"
            value={registerEmail}
            onChange={(e) => setRegisterEmail(e.target.value)}
            onBlur={handleEmailBlur}
            required
          />

          <div className="absolute top-1/2 right-3.5 -translate-y-1/2">
            {isVerifying && (
              <Loader2 className="h-4 w-4 animate-spin text-lime-voltage" />
            )}

            {!isVerifying && emailData?.dns && !emailData?.disposable && (
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            )}

            {!isVerifying &&
              emailData &&
              (!emailData.dns || emailData.disposable) && (
                <XCircle className="h-4 w-4 text-alarm-red" />
              )}
          </div>
        </div>
      </motion.div>

      {/* Password Field */}
      <motion.div variants={itemVariants} className="space-y-1.5">
        <Label htmlFor="register-password" className="text-xs font-semibold text-foreground">
          Password
        </Label>
        <div className="relative">
          <Lock className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="register-password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            className="rounded-xl border-input bg-background py-5 pr-10 pl-10 text-foreground placeholder:text-muted-foreground focus:border-forest-ink dark:focus:border-lime-voltage"
            value={registerPassword}
            onChange={(e) => setRegisterPassword(e.target.value)}
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
        <div className="mt-1.5 space-y-1 text-[11px] text-muted-foreground">
          <p>Password requirements:</p>
          <ul className="ml-3 space-y-0.5">
            <li
              className={
                registerPassword.length >= 8
                  ? "text-emerald-500 font-semibold"
                  : "text-muted-foreground"
              }
            >
              ✓ At least 8 characters
            </li>
            <li
              className={
                /\d/.test(registerPassword)
                  ? "text-emerald-500 font-semibold"
                  : "text-muted-foreground"
              }
            >
              ✓ At least 1 number
            </li>
            <li
              className={
                /[!@#$%^&*]/.test(registerPassword)
                  ? "text-emerald-500 font-semibold"
                  : "text-muted-foreground"
              }
            >
              ✓ At least 1 special character (!@#$%^&*)
            </li>
          </ul>
        </div>
      </motion.div>

      {/* Confirm Password Field */}
      <motion.div variants={itemVariants} className="space-y-1.5">
        <Label htmlFor="register-confirm-password" className="text-xs font-semibold text-foreground">
          Confirm Password
        </Label>
        <div className="relative">
          <Lock className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="register-confirm-password"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="••••••••"
            className="rounded-xl border-input bg-background py-5 pr-10 pl-10 text-foreground placeholder:text-muted-foreground focus:border-forest-ink dark:focus:border-lime-voltage"
            value={registerConfirmPassword}
            onChange={(e) => setRegisterConfirmPassword(e.target.value)}
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute top-1/2 right-3.5 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showConfirmPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </motion.div>

      {/* Submit Button */}
      <motion.div variants={itemVariants}>
        <Button
          type="submit"
          className="w-full rounded-full bg-lime-voltage hover:bg-lime-voltage/90 text-forest-ink font-bold shadow-xs py-5 gap-2"
          disabled={!isEmailVerified || register.isPending || isLoading}
        >
          {register.isPending || isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            <>
              Create Account
              <ArrowRight className="h-4 w-4 stroke-[2.5]" />
            </>
          )}
        </Button>
      </motion.div>
    </motion.form>
  )
}
