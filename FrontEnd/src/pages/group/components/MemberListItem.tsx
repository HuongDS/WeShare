import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import type { GroupRoleEnum } from "@/constants/GroupRoleEnum"
import { useOtherUserProfile } from "@/hooks/user/useUser"
import { cn } from "@/lib/utils"

interface MemberListItemProps {
  userId: number
  role: GroupRoleEnum
  action?: React.ReactNode
}

const formatRole = (role: GroupRoleEnum) =>
  role === "Leader" ? "Admin" : "Member"

export default function MemberListItem({
  userId,
  role,
  action,
}: MemberListItemProps) {
  const { getOtherUserProfile } = useOtherUserProfile(String(userId))
  const member = getOtherUserProfile.data?.data

  if (getOtherUserProfile.isLoading) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-border/60 p-3">
        <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-1/2 animate-pulse rounded-full bg-muted" />
          <div className="h-3 w-2/3 animate-pulse rounded-full bg-muted" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border/60 p-3">
      <Avatar size="lg">
        <AvatarImage src={member?.avatar} alt={member?.fullName || "User"} />
        <AvatarFallback>
          {(member?.fullName || "U").charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-semibold text-foreground">
            {member?.fullName || "Unknown user"}
          </p>
          <div className="ml-auto flex items-center gap-2">
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] tracking-wide uppercase",
                role === "Leader"
                  ? "border-blue-300 bg-blue-50 text-blue-700"
                  : "border-slate-200 bg-slate-50 text-slate-600"
              )}
            >
              {formatRole(role)}
            </Badge>
            {action}
          </div>
        </div>
        <p className="truncate text-xs text-muted-foreground">
          {member?.email || "No email"}
        </p>
      </div>
    </div>
  )
}
