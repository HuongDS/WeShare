import axios from "axios"

export interface DisifyResponse {
  format: boolean
  domain: string
  disposable: boolean
  dns: boolean
}

export const disifyApi = {
  verifyEmail: async (email: string) => {
    const response = await axios.get<DisifyResponse>(
      `/api/disify/api/email/${email}`
    )
    return response.data
  },
}
