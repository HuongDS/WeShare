import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import {
  ShieldAlert,
  FileQuestion,
  ServerCrash,
  Home,
  ArrowLeft,
} from "lucide-react"

interface ErrorPageProps {
  code: 403 | 404 | 500
}

export default function ErrorPage({ code }: ErrorPageProps) {
  const navigate = useNavigate()

  const errorConfig = {
    403: {
      icon: <ShieldAlert className="h-24 w-24 text-primary" />,
      bgColor: "bg-primary/10",
      title: "Access Denied",
      description:
        "You do not have permission to access this resource. Please contact the administrator if you believe this is a mistake.",
    },
    404: {
      icon: <FileQuestion className="h-24 w-24 text-primary" />,
      bgColor: "bg-primary/10",
      title: "Page Not Found",
      description:
        "The page you are looking for does not exist, has been removed, or has been renamed.",
    },
    500: {
      icon: <ServerCrash className="h-24 w-24 text-primary" />,
      bgColor: "bg-primary/10",
      title: "Server Error",
      description:
        "A system error has occurred. Our technical team is working to resolve this issue.",
    },
  }

  const { icon, title, description, bgColor } = errorConfig[code]

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex w-full max-w-md flex-col items-center text-center"
      >
        {/* Icon Container */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          className={`mb-6 rounded-full ${bgColor} p-6`}
        >
          {icon}
        </motion.div>

        {/* Error Code */}
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-2 text-7xl font-extrabold text-slate-900"
        >
          {code}
        </motion.h1>

        {/* Error Title */}
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-4 text-2xl font-bold text-slate-900"
        >
          {title}
        </motion.h2>

        {/* Error Description */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mb-8 text-slate-500"
        >
          {description}
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col gap-3 sm:flex-row sm:justify-center"
        >
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
          <Button
            onClick={() => navigate("/dashboard")}
            className="gap-2 bg-linear-to-r from-primary to-primary/80 text-white hover:from-primary/90 hover:to-primary/70"
          >
            <Home className="h-4 w-4" />
            Dashboard
          </Button>
        </motion.div>

        {/* Optional Help Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-12 border-t border-slate-200 pt-6"
        >
          <p className="text-xs text-slate-400">
            Need help?{" "}
            <a
              href="mailto:support@weshare.com"
              className="text-primary hover:underline"
            >
              Contact support
            </a>
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}
