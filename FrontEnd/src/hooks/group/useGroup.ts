import { groupApi } from "@/api/groupApi"
import { handleAxiosError } from "@/utils/HandleAxiosError"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export const useGetGroups = (pageSize: number, pageIndex: number) => {
  const groups = useQuery({
    queryKey: ["groups", pageSize, pageIndex],
    queryFn: () => groupApi.getGroups(pageSize, pageIndex),
  })

  return { groups }
}

export const useGetGroup = (groupId?: number) => {
  const group = useQuery({
    queryKey: ["group", groupId],
    queryFn: () => {
      if (!groupId) {
        return null
      }
      return groupApi.getGroup(groupId)
    },
    enabled: !!groupId,
  })

  return { group }
}

export const useCreateGroup = () => {
  const queryClient = useQueryClient()

  const createGroup = useMutation({
    mutationFn: groupApi.createGroup,
    onSuccess: (res) => {
      toast.success(res.message || "Create group successfully!")
      queryClient.invalidateQueries({ queryKey: ["groups"] })
    },
    onError: (err) => {
      handleAxiosError(err, "Create group failed.")
    },
  })

  return { createGroup }
}

export const useUpdateGroup = () => {
  const queryClient = useQueryClient()

  const updateGroup = useMutation({
    mutationFn: groupApi.updateGroup,
    onSuccess: (res) => {
      toast.success(res.message || "Update group successfully!")
      queryClient.invalidateQueries({ queryKey: ["groups"] })
      queryClient.invalidateQueries({ queryKey: ["group"] })
    },
    onError: (err) => {
      handleAxiosError(err, "Update group failed.")
    },
  })

  return { updateGroup }
}

export const useAddGroupMembers = () => {
  const queryClient = useQueryClient()

  const addMembers = useMutation({
    mutationFn: groupApi.addMembers,
    onSuccess: (res) => {
      toast.success(res.message || "Add members successfully!")
      queryClient.invalidateQueries({ queryKey: ["groups"] })
      queryClient.invalidateQueries({ queryKey: ["group"] })
    },
    onError: (err) => {
      handleAxiosError(err, "Add members failed.")
    },
  })

  return { addMembers }
}

export const useRemoveGroupMembers = () => {
  const queryClient = useQueryClient()

  const removeMembers = useMutation({
    mutationFn: groupApi.removeMembers,
    onSuccess: (res) => {
      toast.success(res.message || "Remove members successfully!")
      queryClient.invalidateQueries({ queryKey: ["groups"] })
      queryClient.invalidateQueries({ queryKey: ["group"] })
    },
    onError: (err) => {
      handleAxiosError(err, "Remove members failed.")
    },
  })

  return { removeMembers }
}

export const useDeleteGroup = () => {
  const queryClient = useQueryClient()

  const deleteGroup = useMutation({
    mutationFn: groupApi.deleteGroup,
    onSuccess: (res) => {
      toast.success(res.message || "Delete group successfully!")
      queryClient.invalidateQueries({ queryKey: ["groups"] })
      queryClient.invalidateQueries({ queryKey: ["group"] })
    },
    onError: (err) => {
      handleAxiosError(err, "Delete group failed.")
    },
  })

  return { deleteGroup }
}

export const useGetGroupMembers = (groupId: number) => {
  const members = useQuery({
    queryKey: ["groupMembers", groupId],
    queryFn: () => {
      return groupApi.getMemberGroups(groupId)
    },
    enabled: !!groupId,
  })
  return { members }
}
