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
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleDeleteAvatar = () => {
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
      <Card className="rounded-3xl border border-border/80 bg-card p-6 shadow-xs">
        {!isEditing ? (
          // Read-Only View
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold tracking-tight text-foreground">
                General Information
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="gap-2 rounded-full hover:bg-muted text-foreground"
              >
                <Edit2 className="h-4 w-4" />
                Edit Profile
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-10 gap-6 rounded-2xl bg-muted/40 border border-border/60 p-6">
              {/* Left Column - Avatar Section */}
              <div className="md:col-span-3 flex flex-col items-center">
                <div className="relative mb-3">
                  <Avatar className="h-28 w-28 border-4 border-card shadow-sm">
                    <AvatarImage
                      src={userData?.avatar || ""}
                      alt={userData?.fullName || "User"}
                    />
                    <AvatarFallback className="bg-forest-ink text-lime-voltage text-2xl font-bold">
                      {(userData?.fullName || "U")[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  {/* Loading Overlay */}
                  {updateAvatar.isPending && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60">
                      <Loader2 className="h-7 w-7 animate-spin text-lime-voltage" />
                    </div>
                  )}
                </div>

                {/* Avatar Action Buttons */}
                <div className="mt-2 flex items-center justify-center gap-2">
                  <Button
                    onClick={handleChangeAvatarClick}
                    disabled={updateAvatar.isPending || deleteAvatar.isPending}
                    variant="outline"
                    size="sm"
                    className="gap-1.5 rounded-full text-xs font-semibold"
                  >
                    {updateAvatar.isPending ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-3.5 w-3.5" />
                        Change
                      </>
                    )}
                  </Button>

                  {userData?.avatar && (
                    <Button
                      onClick={handleDeleteAvatar}
                      disabled={updateAvatar.isPending || deleteAvatar.isPending}
                      variant="outline"
                      size="sm"
                      className="gap-1.5 rounded-full text-xs font-semibold border-alarm-red/40 text-alarm-red hover:bg-alarm-red/10"
                    >
                      {deleteAvatar.isPending ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </>
                      )}
                    </Button>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarFileChange}
                  className="hidden"
                />
              </div>

              {/* Right Column - User Details */}
              <div className="md:col-span-7 flex flex-col justify-center space-y-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Full Name
                  </p>
                  <p className="mt-1 text-lg font-bold text-foreground">
                    {userData?.fullName || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Email Address
                  </p>
                  <p className="mt-1 text-sm font-medium text-muted-foreground">
                    {userData?.email || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Edit Mode
          <div className="space-y-4">
            <h2 className="text-lg font-bold tracking-tight text-foreground">
              Edit General Information
            </h2>

            <form onSubmit={handleSubmit(handleFormSubmit)}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="userName" className="text-sm font-semibold text-foreground">
                    Username / Full Name
                  </Label>
                  <Input
                    id="userName"
                    type="text"
                    placeholder="Enter your username"
                    className="mt-1.5 rounded-xl border-input bg-background py-5 text-foreground placeholder:text-muted-foreground focus:border-forest-ink dark:focus:border-lime-voltage"
                    {...register("userName")}
                  />
                  {errors.userName && (
                    <p className="mt-1 text-xs text-alarm-red">
                      {errors.userName.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="email" className="text-sm font-semibold text-foreground">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={userData?.email || ""}
                    disabled
                    className="mt-1.5 rounded-xl border-input bg-muted/60 py-5 text-muted-foreground cursor-not-allowed"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Email cannot be changed
                  </p>
                </div>
              </div>

              <div className="mt-6 flex gap-2">
                <Button
                  type="submit"
                  disabled={isPending}
                  className="rounded-full bg-lime-voltage hover:bg-lime-voltage/90 text-forest-ink font-bold shadow-xs px-5 gap-2"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 stroke-[2.5]" />
                      Save Changes
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsEditing(false)}
                  className="rounded-full gap-2 hover:bg-muted"
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
