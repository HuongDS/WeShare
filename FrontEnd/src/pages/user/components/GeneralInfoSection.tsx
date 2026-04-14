import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2, Edit2, Check, X } from "lucide-react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import type { UserViewDto } from "@/types/user/UserViewDto"

const generalProfileSchema = z.object({
  userName: z
    .string()
    .min(2, "Username must be at least 2 characters")
    .max(100, "Username must be at most 100 characters"),
})

type GeneralProfileFormData = z.infer<typeof generalProfileSchema>

interface GeneralInfoSectionProps {
  userData: UserViewDto | undefined
  isLoading: boolean
  isPending: boolean
  onSubmit: (data: GeneralProfileFormData) => void
}

export function GeneralInfoSection({
  userData,
  isLoading,
  isPending,
  onSubmit,
}: GeneralInfoSectionProps) {
  const [isEditing, setIsEditing] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<GeneralProfileFormData>({
    resolver: zodResolver(generalProfileSchema),
  })

  useEffect(() => {
    if (userData) {
      reset({
        userName: userData.fullName || "",
      })
    }
  }, [userData, reset])

  const handleFormSubmit = (data: GeneralProfileFormData) => {
    onSubmit(data)
  }

  if (isLoading) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <Card className="border border-slate-200 bg-white p-6">
        {!isEditing ? (
          // Read-Only View
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                General Information
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="gap-2 hover:bg-slate-100"
              >
                <Edit2 className="h-4 w-4" />
                Edit General Info
              </Button>
            </div>

            <div className="space-y-4 rounded-lg bg-slate-50 p-4">
              {/* Avatar Section */}
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border-2 border-slate-200">
                  <AvatarImage
                    src={userData?.avatar || ""}
                    alt={userData?.fullName || "User"}
                  />
                  <AvatarFallback className="bg-linear-to-br from-primary to-primary/70 font-semibold text-white">
                    {(userData?.fullName || "U")[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-xs font-medium text-slate-500">
                    Full Name
                  </p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">
                    {userData?.fullName || "N/A"}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Email</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {userData?.email || "N/A"}
                </p>
              </div>
            </div>
          </div>
        ) : (
          // Edit Mode
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">
              Edit General Information
            </h2>

            <form onSubmit={handleSubmit(handleFormSubmit)}>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="userName" className="text-slate-700">
                    Username
                  </Label>
                  <Input
                    id="userName"
                    type="text"
                    placeholder="Enter your username"
                    className="mt-2 border-slate-300 bg-white py-6 text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
                    {...register("userName")}
                  />
                  {errors.userName && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.userName.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="email" className="text-slate-700">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={userData?.email || ""}
                    disabled
                    className="mt-2 border-slate-300 bg-slate-100 py-6 text-slate-400"
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    Email cannot be changed
                  </p>
                </div>
              </div>

              <div className="mt-6 flex gap-2">
                <Button
                  type="submit"
                  disabled={isPending}
                  className="gap-2 bg-linear-to-r from-primary to-primary/80 text-white hover:from-primary/90 hover:to-primary/70"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsEditing(false)}
                  className="gap-2"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}
      </Card>
    </motion.div>
  )
}
