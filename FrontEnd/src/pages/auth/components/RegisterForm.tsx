import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion, type Variants } from "framer-motion"
import {
  Mail,
  Lock,
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

      // Navigate to OTP verification with email in state
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
      <motion.div variants={itemVariants} className="space-y-2">
        <Label htmlFor="register-name" className="text-slate-700">
          Full Name
        </Label>
        <Input
          id="register-name"
          type="text"
          placeholder="John Doe"
          className="border-slate-300 bg-white py-6 text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
          value={registerName}
          onChange={(e) => setRegisterName(e.target.value)}
          required
        />
      </motion.div>

      {/* Email Field */}
      <motion.div variants={itemVariants} className="space-y-2">
        <Label htmlFor="register-email" className="text-slate-700">
          Email Address
        </Label>
        <div className="relative">
          <Mail className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <Input
            id="register-email"
            type="email"
            placeholder="you@example.com"
            className="border-slate-300 bg-white py-6 pr-10 pl-10 text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
            value={registerEmail}
            onChange={(e) => setRegisterEmail(e.target.value)}
            onBlur={handleEmailBlur}
            required
          />

          <div className="absolute top-1/2 right-3 -translate-y-1/2">
            {isVerifying && (
              <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
            )}

            {!isVerifying && emailData?.dns && !emailData?.disposable && (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            )}

            {!isVerifying &&
              emailData &&
              (!emailData.dns || emailData.disposable) && (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
          </div>
        </div>
      </motion.div>

      {/* Password Field */}
      <motion.div variants={itemVariants} className="space-y-2">
        <Label htmlFor="register-password" className="text-slate-700">
          Password
        </Label>
        <div className="relative">
          <Lock className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <Input
            id="register-password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            className="border-slate-300 bg-white py-6 pr-10 pl-10 text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
            value={registerPassword}
            onChange={(e) => setRegisterPassword(e.target.value)}
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
        <div className="mt-2 space-y-1 text-xs text-slate-500">
          <p>Password must contain:</p>
          <ul className="ml-4 space-y-0.5">
            <li
              className={
                registerPassword.length >= 8
                  ? "text-green-600"
                  : "text-slate-400"
              }
            >
              ✓ At least 8 characters
            </li>
            <li
              className={
                /\d/.test(registerPassword)
                  ? "text-green-600"
                  : "text-slate-400"
              }
            >
              ✓ At least 1 number
            </li>
            <li
              className={
                /[!@#$%^&*]/.test(registerPassword)
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
        <Label htmlFor="register-confirm-password" className="text-slate-700">
          Confirm Password
        </Label>
        <div className="relative">
          <Lock className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <Input
            id="register-confirm-password"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="••••••••"
            className="border-slate-300 bg-white py-6 pr-10 pl-10 text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
            value={registerConfirmPassword}
            onChange={(e) => setRegisterConfirmPassword(e.target.value)}
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            {showConfirmPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>
      </motion.div>

      {/* Submit Button */}
      <motion.div variants={itemVariants}>
        <Button
          type="submit"
          className="w-full gap-2"
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
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </motion.div>
    </motion.form>
  )
}
