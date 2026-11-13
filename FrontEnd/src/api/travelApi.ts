import axiosClient from "@/axios/axiosInstance"
import type {
  TravelPlan,
  TravelPlanCreateOrUpdatePayload,
  TravelHotel,
  TravelHotelPayload,
  TravelPlace,
  TravelPlacePayload,
  TravelBudgetItem,
  TravelBudgetItemPayload,
} from "@/types/travel/TravelPlan"

export const travelApi = {
  getPlanByGroupId: async (groupId: number): Promise<TravelPlan | null> => {
    const res = await axiosClient.get(`/TravelPlan/group/${groupId}`)
    return res.data?.data || null
  },

  savePlan: async (payload: TravelPlanCreateOrUpdatePayload): Promise<TravelPlan> => {
    const res = await axiosClient.post("/TravelPlan", payload)
    return res.data.data
  },

  addHotel: async (travelPlanId: number, payload: TravelHotelPayload): Promise<TravelHotel> => {
    const res = await axiosClient.post(`/TravelPlan/${travelPlanId}/hotels`, payload)
    return res.data.data
  },

  updateHotel: async (hotelId: number, payload: TravelHotelPayload): Promise<TravelHotel> => {
    const res = await axiosClient.put(`/TravelPlan/hotels/${hotelId}`, payload)
    return res.data.data
  },

  deleteHotel: async (hotelId: number): Promise<boolean> => {
    const res = await axiosClient.delete(`/TravelPlan/hotels/${hotelId}`)
    return res.data?.data ?? true
  },

  addPlace: async (travelPlanId: number, payload: TravelPlacePayload): Promise<TravelPlace> => {
    const res = await axiosClient.post(`/TravelPlan/${travelPlanId}/places`, payload)
    return res.data.data
  },

  updatePlace: async (placeId: number, payload: TravelPlacePayload): Promise<TravelPlace> => {
    const res = await axiosClient.put(`/TravelPlan/places/${placeId}`, payload)
    return res.data.data
  },

  togglePlaceVisit: async (placeId: number): Promise<boolean> => {
    const res = await axiosClient.patch(`/TravelPlan/places/${placeId}/toggle-visit`)
    return res.data?.data ?? true
  },

  deletePlace: async (placeId: number): Promise<boolean> => {
    const res = await axiosClient.delete(`/TravelPlan/places/${placeId}`)
    return res.data?.data ?? true
  },

  addBudgetItem: async (travelPlanId: number, payload: TravelBudgetItemPayload): Promise<TravelBudgetItem> => {
    const res = await axiosClient.post(`/TravelPlan/${travelPlanId}/budget-items`, payload)
    return res.data.data
  },

  updateBudgetItem: async (itemId: number, payload: TravelBudgetItemPayload): Promise<TravelBudgetItem> => {
    const res = await axiosClient.put(`/TravelPlan/budget-items/${itemId}`, payload)
    return res.data.data
  },

  deleteBudgetItem: async (itemId: number): Promise<boolean> => {
    const res = await axiosClient.delete(`/TravelPlan/budget-items/${itemId}`)
    return res.data?.data ?? true
  },
}
