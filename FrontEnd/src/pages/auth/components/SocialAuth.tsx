import { motion, type Variants } from "framer-motion"
import { useAuth } from "@/hooks/auth/useAuth"
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google"

interface SocialAuthProps {
  itemVariants: Variants
}

export default function SocialAuth({ itemVariants }: SocialAuthProps) {
  const { loginWithGoogle } = useAuth()

  const handleGoogleSuccess = async (
    credentialResponse: CredentialResponse
  ) => {
    if (credentialResponse?.credential) {
      try {
        await loginWithGoogle.mutateAsync({
          idToken: credentialResponse.credential,
        })
      } catch (error) {
        console.error("Google login failed:", error)
      }
    }
  }

  const handleGoogleError = () => {
    console.error("Google login failed")
  }

  return (
    <>
      <motion.div
        variants={itemVariants}
        className="my-6 flex items-center gap-4"
      >
        <div className="h-px flex-1 bg-slate-300" />
        <span className="text-xs text-slate-500">OR</span>
        <div className="h-px flex-1 bg-slate-300" />
      </motion.div>

      {/* Google Login */}
      <motion.div variants={itemVariants} className="flex justify-center">
        <div className="scale-95">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            text="signin_with"
            width="290"
          />
        </div>
      </motion.div>

      {/* Footer */}
      <motion.p
        variants={itemVariants}
        className="text-center text-xs text-slate-600"
      >
        By signing in, you agree to our{" "}
        <button className="text-primary transition-colors hover:text-primary/80">
          Terms of Service
        </button>{" "}
        and{" "}
        <button className="text-primary transition-colors hover:text-primary/80">
          Privacy Policy
        </button>
        .
      </motion.p>
    </>
  )
}
