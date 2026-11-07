export interface TravelHotel {
  id: number
  travelPlanId: number
  name: string
  address?: string | null
  checkInDate?: string | null
  checkOutDate?: string | null
  price?: number | null
  phoneNumber?: string | null
  bookingUrl?: string | null
  notes?: string | null
}

export interface TravelPlace {
  id: number
  travelPlanId: number
  name: string
  address?: string | null
  category: string // "Ăn uống" | "Vui chơi" | "Tham quan" | "Cà phê" | "Mua sắm" | "Khác"
  dayNumber?: number | null
  visitTime?: string | null
  estimatedCost?: number | null
  notes?: string | null
  isVisited: boolean
}

export interface TravelPlan {
  id: number
  groupId: number
  destination: string
  startDate?: string | null
  endDate?: string | null
  estimatedBudget?: number | null
  notes?: string | null
  hotels: TravelHotel[]
  places: TravelPlace[]
}

export interface TravelPlanCreateOrUpdatePayload {
  groupId: number
  destination: string
  startDate?: string | null
  endDate?: string | null
  estimatedBudget?: number | null
  notes?: string | null
}

export interface TravelHotelPayload {
  name: string
  address?: string | null
  checkInDate?: string | null
  checkOutDate?: string | null
  price?: number | null
  phoneNumber?: string | null
  bookingUrl?: string | null
  notes?: string | null
}

export interface TravelPlacePayload {
  name: string
  address?: string | null
  category: string
  dayNumber?: number | null
  visitTime?: string | null
  estimatedCost?: number | null
  notes?: string | null
  isVisited?: boolean
}
