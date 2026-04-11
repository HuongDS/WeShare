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

  return (
    <div className="min-h-screen overflow-hidden bg-linear-to-br from-white to-slate-50">
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
              className="mb-6 inline-flex items-center justify-center rounded-full bg-linear-to-br from-primary to-primary/80 p-3"
            >
              <Zap className="h-8 w-8 text-white" />
            </motion.div>

            {/* Welcome Message */}
            <h2 className="mb-4 text-2xl font-bold text-slate-800">
              Welcome Back
            </h2>

            {/* Auth Card */}
            <motion.div variants={itemVariants}>
              <Card className="border border-slate-200 bg-white shadow-lg">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  {/* Tab List */}
                  <TabsList className="grid w-full grid-cols-2 rounded-none border-b border-slate-200 bg-transparent p-0">
                    <TabsTrigger
                      value="login"
                      className="flex h-12 items-center justify-center rounded-none border-b-2 border-transparent bg-transparent text-base text-slate-500 transition-all hover:text-slate-700 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:font-bold data-[state=active]:text-primary data-[state=active]:shadow-none"
                    >
                      Login
                    </TabsTrigger>

                    <TabsTrigger
                      value="register"
                      className="flex h-12 items-center justify-center rounded-none border-b-2 border-transparent bg-transparent text-base text-slate-500 transition-all hover:text-slate-700 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:font-bold data-[state=active]:text-primary data-[state=active]:shadow-none"
                    >
                      Register
                    </TabsTrigger>
                  </TabsList>

                  {/* Login Tab */}
                  <TabsContent value="login" className="p-6">
                    <LoginForm
                      containerVariants={containerVariants}
                      itemVariants={itemVariants}
                    />
                  </TabsContent>

                  {/* Register Tab */}
                  <TabsContent value="register" className="p-6">
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
        </motion.div>
      </div>
    </div>
  )
}
