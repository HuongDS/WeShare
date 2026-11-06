import { useState } from "react"
import { motion, type Variants } from "framer-motion"
import { Zap } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/hooks/auth/useAuth"
import LoginForm from "./components/LoginForm"
import RegisterForm from "./components/RegisterForm"
import SocialAuth from "./components/SocialAuth"

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState("login")
  const { isLoging } = useAuth()

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
          {/* Branding Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 120, delay: 0.1 }}
            className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-lime-voltage text-forest-ink shadow-md"
          >
            <Zap className="h-7 w-7 fill-current stroke-[2.5]" />
          </motion.div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
            Welcome to WeShare
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Smart bill splitting &amp; shared task management
          </p>
        </motion.div>

        {/* Auth Card */}
        <motion.div variants={itemVariants}>
          <Card className="rounded-3xl border border-border/80 bg-card p-6 shadow-xl space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              {/* Tab List */}
              <TabsList className="grid w-full grid-cols-2 rounded-full p-1 bg-muted/60 dark:bg-muted/30 border border-border/70">
                <TabsTrigger
                  value="login"
                  className="rounded-full data-[state=active]:bg-lime-voltage data-[state=active]:text-forest-ink data-[state=active]:font-bold data-[state=active]:shadow-xs py-2 text-xs sm:text-sm transition-all"
                >
                  Log In
                </TabsTrigger>

                <TabsTrigger
                  value="register"
                  className="rounded-full data-[state=active]:bg-lime-voltage data-[state=active]:text-forest-ink data-[state=active]:font-bold data-[state=active]:shadow-xs py-2 text-xs sm:text-sm transition-all"
                >
                  Register
                </TabsTrigger>
              </TabsList>

              {/* Login Tab */}
              <TabsContent value="login" className="pt-4">
                <LoginForm
                  containerVariants={containerVariants}
                  itemVariants={itemVariants}
                />
              </TabsContent>

              {/* Register Tab */}
              <TabsContent value="register" className="pt-4">
                <RegisterForm
                  containerVariants={containerVariants}
                  itemVariants={itemVariants}
                  isLoading={isLoging}
                />
              </TabsContent>
            </Tabs>
          </Card>
        </motion.div>

        {/* Social Auth Section */}
        <SocialAuth itemVariants={itemVariants} />
      </motion.div>
    </div>
  )
}
