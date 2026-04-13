import axios from "axios"
import { toast } from "sonner"

export const handleAxiosError = (err: Error, msgError: string) => {
  if (axios.isAxiosError(err)) {
    const errorMessage = err.response?.data?.message || msgError
    toast.error(errorMessage)
  } else {
    toast.error("Some thing went wrong!")
  }
}
