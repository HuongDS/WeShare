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
      icon: <ShieldAlert className="h-24 w-24 text-orange-500" />,
      title: "Access Denied",
      description:
        "You do not have permission to access this resource. Please contact the administrator if you believe this is a mistake.",
    },
    404: {
      icon: <FileQuestion className="h-24 w-24 text-blue-500" />,
      title: "Page Not Found",
      description:
        "The page you are looking for does not exist, has been removed, or has been renamed.",
    },
    500: {
      icon: <ServerCrash className="h-24 w-24 text-red-500" />,
      title: "Server Error",
      description:
        "A system error has occurred. Our technical team is working to resolve this issue.",
    },
  }

  const { icon, title, description } = errorConfig[code]

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex max-w-md flex-col items-center text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          className="mb-6 rounded-full bg-slate-900 p-6 shadow-2xl"
        >
          {icon}
        </motion.div>

        <h1 className="mb-2 text-7xl font-extrabold text-white">{code}</h1>
        <h2 className="mb-4 text-2xl font-bold text-slate-200">{title}</h2>
        <p className="mb-8 text-slate-400">{description}</p>

        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
          <Button onClick={() => navigate("/dashboard")} className="gap-2">
            <Home className="h-4 w-4" />
            Home
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
