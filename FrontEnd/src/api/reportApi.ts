import axiosClient from "@/axios/axiosInstance"
import type { ResponseDto } from "@/types/ResponseDto"
import type { GroupAnalyticsDto } from "@/types/report/GroupAnalyticsDto"

export const reportApi = {
  getGroupAnalytics: async (groupId: number) => {
    const res = await axiosClient.get<ResponseDto<GroupAnalyticsDto>>(
      `/Report/group/${groupId}/analytics`
    )
    return res.data
  },

  exportGroupReport: async (groupId: number, format: "xlsx" | "pdf", groupName?: string) => {
    const res = await axiosClient.get<Blob>(
      `/Report/group/${groupId}/export`,
      {
        params: { format },
        responseType: "blob",
      }
    )

    const disposition = res.headers["content-disposition"] as string | undefined
    let fileName = `WeShare_${groupName || `Group_${groupId}`}.${format}`
    if (disposition) {
      const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/i)
      const asciiMatch = disposition.match(/filename="?([^";]+)"?/i)
      if (utf8Match?.[1]) {
        fileName = decodeURIComponent(utf8Match[1])
      } else if (asciiMatch?.[1]) {
        fileName = asciiMatch[1]
      }
    }

    const blobUrl = window.URL.createObjectURL(res.data)
    const link = document.createElement("a")
    link.href = blobUrl
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(blobUrl)
  },
}
