import { useState, useEffect, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2, Edit2, Check, X, Upload, Trash2 } from "lucide-react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { useUser } from "@/hooks/user/useUser"
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
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { updateAvatar, deleteAvatar } = useUser()

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

  const handleChangeAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleAvatarFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]
    if (file) {
      updateAvatar.mutate(file)
      // Reset input so same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleDeleteAvatar = () => {
    // Assuming DeleteAvatarDto requires avatarPublicId
    // Adjust payload structure based on your actual DTO
    deleteAvatar.mutate({
      avatarPublicId: userData?.avatarPublicId || "",
    })
  }

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
          // Read-Only View with 3:7 Layout
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

            <div className="grid grid-cols-10 gap-6 rounded-lg bg-slate-50 p-6">
              {/* Left Column (3/10) - Avatar Section */}
              <div className="col-span-3 flex flex-col items-center">
                {/* Avatar Container with Loading Overlay */}
                <div className="relative mb-4">
                  <Avatar className="h-32 w-32 border-4 border-slate-200">
                    <AvatarImage
                      src={userData?.avatar || ""}
                      alt={userData?.fullName || "User"}
                    />
                    <AvatarFallback className="bg-linear-to-br from-primary to-primary/70 text-3xl font-semibold text-white">
                      {(userData?.fullName || "U")[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  {/* Loading Overlay */}
                  {updateAvatar.isPending && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
                      <Loader2 className="h-8 w-8 animate-spin text-white" />
                    </div>
                  )}
                </div>

                {/* Avatar Action Buttons */}
                <div className="mt-4 flex items-center justify-center gap-2">
                  {/* Change Avatar Button */}
                  <Button
                    onClick={handleChangeAvatarClick}
                    disabled={updateAvatar.isPending || deleteAvatar.isPending}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    {updateAvatar.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" />
                        Change
                      </>
                    )}
                  </Button>

                  {/* Delete Avatar Button - Only show if avatar exists */}
                  {userData?.avatar && (
                    <Button
                      onClick={handleDeleteAvatar}
                      disabled={updateAvatar.isPending || deleteAvatar.isPending}
                      variant="outline"
                      size="sm"
                      className="gap-2 border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600"
                    >
                      {deleteAvatar.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </>
                      )}
                    </Button>
                  )}
                </div>

                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarFileChange}
                  className="hidden"
                />
              </div>

              {/* Right Column (7/10) - User Details */}
              <div className="col-span-7 space-y-4">
                <div>
                  <p className="text-xs font-medium text-slate-500">
                    Full Name
                  </p>
                  <p className="mt-1.5 text-lg font-semibold text-slate-900">
                    {userData?.fullName || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Email</p>
                  <p className="mt-1.5 text-sm font-medium text-slate-900">
                    {userData?.email || "N/A"}
                  </p>
                </div>
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
