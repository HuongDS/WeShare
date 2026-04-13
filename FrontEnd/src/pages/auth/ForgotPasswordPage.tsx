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

  const validateEmail = (emailToValidate: string): boolean => {
    return EMAIL_REGEX.test(emailToValidate)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim()) {
      toast.error("Please enter your email address.")
      return
    }

    if (!validateEmail(email)) {
      toast.error("Please enter a valid email address.")
      return
    }

    try {
      await forgotPassword.mutateAsync({ email })
      // Navigate to reset password page with email in state
      navigate("/reset-password", { state: { email } })
    } catch (error) {
      console.error("Forgot password failed:", error)
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
              <Zap className="h-8 w-8 text-white" />
            </motion.div>

            {/* Title */}
            <h2 className="mb-2 text-2xl font-bold text-slate-800">
              Forgot Password?
            </h2>
            <p className="mb-8 text-sm text-slate-500">
              Enter your email address and we'll send you a code to reset your
              password.
            </p>

            {/* Card */}
            <motion.div variants={itemVariants}>
              <Card className="border border-slate-200 bg-white shadow-lg">
                <div className="p-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Email Field */}
                    <motion.div variants={itemVariants} className="space-y-2">
                      <Label htmlFor="email" className="text-slate-700">
                        Email Address
                      </Label>
                      <div className="relative">
                        <Mail className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-slate-400" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@example.com"
                          className="border-slate-300 bg-white py-6 pr-4 pl-10 text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          disabled={forgotPassword.isPending}
                          required
                        />
                      </div>
                    </motion.div>

                    {/* Submit Button */}
                    <motion.div variants={itemVariants}>
                      <Button
                        type="submit"
                        disabled={forgotPassword.isPending}
                        className="w-full bg-gradient-to-r from-primary to-primary/80 py-6 text-base font-semibold text-white hover:from-primary/90 hover:to-primary/70"
                      >
                        {forgotPassword.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            Send OTP
                            <ArrowRight className="ml-2 h-4 w-4" />
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
