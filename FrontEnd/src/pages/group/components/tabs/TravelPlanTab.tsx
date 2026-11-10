import React, { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Hotel,
  MapPin,
  Calendar,
  Plus,
  DollarSign,
  Users,
  ExternalLink,
  Phone,
  Trash2,
  Edit2,
  CheckCircle2,
  Circle,
  Clock,
  Compass,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { travelApi } from "@/api/travelApi"
import type {
  TravelPlan,
  TravelHotel,
  TravelPlace,
  TravelPlanCreateOrUpdatePayload,
  TravelHotelPayload,
  TravelPlacePayload,
} from "@/types/travel/TravelPlan"
import type { GroupViewDto } from "@/types/group/GroupViewDto"
import { formatCurrency } from "@/lib/utils"
import AddMemberModal from "@/pages/group/components/AddMemberModal"

interface TravelPlanTabProps {
  groupId: number
  group?: GroupViewDto | null
}

const CATEGORY_LABELS = [
  { key: "Ăn uống", label: "Ăn uống 🍜", color: "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300" },
  { key: "Vui chơi", label: "Vui chơi 🎢", color: "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950/40 dark:text-purple-300" },
  { key: "Tham quan", label: "Tham quan 📸", color: "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/40 dark:text-blue-300" },
  { key: "Cà phê", label: "Cà phê ☕", color: "bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-950/40 dark:text-orange-300" },
  { key: "Mua sắm", label: "Mua sắm 🛍️", color: "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300" },
  { key: "Khác", label: "Khác 📍", color: "bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-300" },
]

export default function TravelPlanTab({ groupId, group }: TravelPlanTabProps) {
  const [plan, setPlan] = useState<TravelPlan | null>(null)
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>("ALL")
  const [activeSubTab, setActiveSubTab] = useState<"places" | "hotels" | "itinerary">("places")

  // Modals
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false)
  const [isHotelModalOpen, setIsHotelModalOpen] = useState(false)
  const [isPlaceModalOpen, setIsPlaceModalOpen] = useState(false)
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false)

  // Editing items
  const [editingHotel, setEditingHotel] = useState<TravelHotel | null>(null)
  const [editingPlace, setEditingPlace] = useState<TravelPlace | null>(null)

  // Form states
  const [planForm, setPlanForm] = useState<TravelPlanCreateOrUpdatePayload>({
    groupId,
    destination: "",
    startDate: "",
    endDate: "",
    estimatedBudget: null,
    notes: "",
  })

  const [hotelForm, setHotelForm] = useState<TravelHotelPayload>({
    name: "",
    address: "",
    checkInDate: "",
    checkOutDate: "",
    price: null,
    phoneNumber: "",
    bookingUrl: "",
    notes: "",
  })

  const [placeForm, setPlaceForm] = useState<TravelPlacePayload>({
    name: "",
    address: "",
    category: "Ăn uống",
    dayNumber: 1,
    visitTime: "",
    estimatedCost: null,
    notes: "",
    isVisited: false,
  })

  const fetchPlan = async () => {
    try {
      const data = await travelApi.getPlanByGroupId(groupId)
      setPlan(data)
      if (data) {
        setPlanForm({
          groupId,
          destination: data.destination || "",
          startDate: data.startDate ? data.startDate.split("T")[0] : "",
          endDate: data.endDate ? data.endDate.split("T")[0] : "",
          estimatedBudget: data.estimatedBudget,
          notes: data.notes || "",
        })
      } else {
        setPlanForm((prev) => ({
          ...prev,
          destination: group?.name || "Kế hoạch chuyến đi",
        }))
      }
    } catch (err) {
      console.error("Failed to fetch travel plan:", err)
    }
  }

  useEffect(() => {
    fetchPlan()
  }, [groupId])

  // Save or update plan details
  const handleSavePlan = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      const saved = await travelApi.savePlan({
        ...planForm,
        groupId,
        startDate: planForm.startDate ? new Date(planForm.startDate).toISOString() : null,
        endDate: planForm.endDate ? new Date(planForm.endDate).toISOString() : null,
      })
      setPlan((prev) => ({
        ...saved,
        hotels: prev?.hotels || [],
        places: prev?.places || [],
      }))
      setIsPlanModalOpen(false)
    } catch (err) {
      console.error("Failed to save plan:", err)
    }
  }

  // Hotel actions
  const handleOpenAddHotel = () => {
    setEditingHotel(null)
    setHotelForm({
      name: "",
      address: "",
      checkInDate: "",
      checkOutDate: "",
      price: null,
      phoneNumber: "",
      bookingUrl: "",
      notes: "",
    })
    setIsHotelModalOpen(true)
  }

  const handleOpenEditHotel = (hotel: TravelHotel) => {
    setEditingHotel(hotel)
    setHotelForm({
      name: hotel.name,
      address: hotel.address || "",
      checkInDate: hotel.checkInDate ? hotel.checkInDate.split("T")[0] : "",
      checkOutDate: hotel.checkOutDate ? hotel.checkOutDate.split("T")[0] : "",
      price: hotel.price,
      phoneNumber: hotel.phoneNumber || "",
      bookingUrl: hotel.bookingUrl || "",
      notes: hotel.notes || "",
    })
    setIsHotelModalOpen(true)
  }

  const handleSaveHotel = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!plan && !planForm.destination) {
      return
    }

    try {
      let activePlanId = plan?.id
      if (!activePlanId) {
        const newPlan = await travelApi.savePlan({
          ...planForm,
          groupId,
          destination: planForm.destination || group?.name || "Chuyến đi mới",
        })
        activePlanId = newPlan.id
        setPlan(newPlan)
      }

      const payload = {
        ...hotelForm,
        checkInDate: hotelForm.checkInDate ? new Date(hotelForm.checkInDate).toISOString() : null,
        checkOutDate: hotelForm.checkOutDate ? new Date(hotelForm.checkOutDate).toISOString() : null,
      }

      if (editingHotel) {
        const updated = await travelApi.updateHotel(editingHotel.id, payload)
        setPlan((prev) =>
          prev
            ? {
                ...prev,
                hotels: prev.hotels.map((h) => (h.id === updated.id ? updated : h)),
              }
            : prev
        )
      } else {
        const created = await travelApi.addHotel(activePlanId, payload)
        setPlan((prev) =>
          prev
            ? {
                ...prev,
                hotels: [...prev.hotels, created],
              }
            : prev
        )
      }
      setIsHotelModalOpen(false)
    } catch (err) {
      console.error("Failed to save hotel:", err)
    }
  }

  const handleDeleteHotel = async (hotelId: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa khách sạn này?")) return
    try {
      await travelApi.deleteHotel(hotelId)
      setPlan((prev) =>
        prev
          ? {
              ...prev,
              hotels: prev.hotels.filter((h) => h.id !== hotelId),
            }
          : prev
      )
    } catch (err) {
      console.error("Failed to delete hotel:", err)
    }
  }

  // Place actions
  const handleOpenAddPlace = () => {
    setEditingPlace(null)
    setPlaceForm({
      name: "",
      address: "",
      category: "Ăn uống",
      dayNumber: 1,
      visitTime: "",
      estimatedCost: null,
      notes: "",
      isVisited: false,
    })
    setIsPlaceModalOpen(true)
  }

  const handleOpenEditPlace = (place: TravelPlace) => {
    setEditingPlace(place)
    setPlaceForm({
      name: place.name,
      address: place.address || "",
      category: place.category,
      dayNumber: place.dayNumber ?? 1,
      visitTime: place.visitTime || "",
      estimatedCost: place.estimatedCost,
      notes: place.notes || "",
      isVisited: place.isVisited,
    })
    setIsPlaceModalOpen(true)
  }

  const handleSavePlace = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      let activePlanId = plan?.id
      if (!activePlanId) {
        const newPlan = await travelApi.savePlan({
          ...planForm,
          groupId,
          destination: planForm.destination || group?.name || "Chuyến đi mới",
        })
        activePlanId = newPlan.id
        setPlan(newPlan)
      }

      if (editingPlace) {
        const updated = await travelApi.updatePlace(editingPlace.id, placeForm)
        setPlan((prev) =>
          prev
            ? {
                ...prev,
                places: prev.places.map((p) => (p.id === updated.id ? updated : p)),
              }
            : prev
        )
      } else {
        const created = await travelApi.addPlace(activePlanId, placeForm)
        setPlan((prev) =>
          prev
            ? {
                ...prev,
                places: [...prev.places, created],
              }
            : prev
        )
      }
      setIsPlaceModalOpen(false)
    } catch (err) {
      console.error("Failed to save place:", err)
    }
  }

  const handleToggleVisited = async (placeId: number) => {
    try {
      await travelApi.togglePlaceVisit(placeId)
      setPlan((prev) =>
        prev
          ? {
              ...prev,
              places: prev.places.map((p) =>
                p.id === placeId ? { ...p, isVisited: !p.isVisited } : p
              ),
            }
          : prev
      )
    } catch (err) {
      console.error("Failed to toggle visited:", err)
    }
  }

  const handleDeletePlace = async (placeId: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa địa điểm này?")) return
    try {
      await travelApi.deletePlace(placeId)
      setPlan((prev) =>
        prev
          ? {
              ...prev,
              places: prev.places.filter((p) => p.id !== placeId),
            }
          : prev
      )
    } catch (err) {
      console.error("Failed to delete place:", err)
    }
  }

  // Filtered places
  const filteredPlaces = useMemo(() => {
    if (!plan?.places) return []
    if (activeCategoryFilter === "ALL") return plan.places
    return plan.places.filter((p) => p.category === activeCategoryFilter)
  }, [plan?.places, activeCategoryFilter])

  // Places grouped by day for Itinerary
  const itineraryDays = useMemo(() => {
    const daysMap = new Map<number | string, { places: TravelPlace[]; hotels: TravelHotel[] }>()

    if (plan?.places) {
      plan.places.forEach((p) => {
        const key = p.dayNumber ? p.dayNumber : "Chưa xếp ngày"
        if (!daysMap.has(key)) {
          daysMap.set(key, { places: [], hotels: [] })
        }
        daysMap.get(key)!.places.push(p)
      })
    }

    if (plan?.hotels) {
      plan.hotels.forEach((h) => {
        const key = "Khách sạn & Chỗ ở"
        if (!daysMap.has(key)) {
          daysMap.set(key, { places: [], hotels: [] })
        }
        daysMap.get(key)!.hotels.push(h)
      })
    }

    return Array.from(daysMap.entries())
  }, [plan?.places, plan?.hotels])

  const members = group?.members || []
  const existingMemberIds = useMemo(() => members.map((m) => m.userId), [members])

  return (
    <div className="space-y-6">
      {/* 1. HERO TRIP OVERVIEW BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-forest-ink text-paper p-6 sm:p-8 shadow-md">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-lime-voltage/20 text-lime-voltage px-3 py-1 text-xs font-bold uppercase tracking-wider">
              <Compass className="h-3.5 w-3.5" />
              <span>Kế hoạch Du lịch & Khám phá</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {plan?.destination || group?.name || "Chưa đặt tên điểm đến"}
            </h2>
            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-paper/80 font-medium">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-lime-voltage" />
                <span>
                  {plan?.startDate && plan?.endDate
                    ? `${new Date(plan.startDate).toLocaleDateString("vi-VN")} - ${new Date(plan.endDate).toLocaleDateString("vi-VN")}`
                    : "Chưa chọn ngày đi"}
                </span>
              </div>
              {plan?.estimatedBudget && (
                <div className="flex items-center gap-1.5">
                  <DollarSign className="h-4 w-4 text-lime-voltage" />
                  <span>Dự toán: {formatCurrency(plan.estimatedBudget)}</span>
                </div>
              )}
            </div>
            {plan?.notes && (
              <p className="text-xs sm:text-sm text-paper/70 pt-1 max-w-xl italic">
                "{plan.notes}"
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              className="rounded-full bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs sm:text-sm font-semibold"
              onClick={() => setIsPlanModalOpen(true)}
            >
              <Edit2 className="h-3.5 w-3.5 mr-1.5" />
              Sửa Kế Hoạch
            </Button>
            <Button
              className="rounded-full bg-lime-voltage hover:bg-lime-voltage/90 text-forest-ink font-bold text-xs sm:text-sm shadow-xs"
              onClick={() => setIsAddMemberModalOpen(true)}
            >
              <Users className="h-4 w-4 mr-1.5" />
              + Mời Thành Viên ({members.length})
            </Button>
          </div>
        </div>

        {/* Member Row */}
        <div className="relative z-10 mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-paper/80">Thành viên tham gia ({members.length}):</span>
            <div className="flex -space-x-2 overflow-hidden items-center">
              {members.slice(0, 6).map((m, idx: number) => (
                <div
                  key={idx}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-lime-voltage text-forest-ink text-xs font-bold ring-2 ring-forest-ink"
                  title={`Member #${m.userId}`}
                >
                  {`U${m.userId}`}
                </div>
              ))}
              {members.length > 6 && (
                <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white text-xs font-bold ring-2 ring-forest-ink">
                  +{members.length - 6}
                </div>
              )}
            </div>
          </div>

          {/* Quick Counter Badges */}
          <div className="flex items-center gap-3 text-xs font-semibold">
            <span className="rounded-full bg-white/10 px-3 py-1 text-white">
              🏨 {plan?.hotels?.length || 0} Khách sạn
            </span>
            <span className="rounded-full bg-white/10 px-3 py-1 text-white">
              📍 {plan?.places?.length || 0} Điểm đến
            </span>
          </div>
        </div>
      </div>

      {/* 2. SUB-NAVIGATION PILLS: Places, Hotels, Itinerary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/70 pb-3">
        <div className="inline-flex rounded-full bg-muted/60 p-1 border border-border/80">
          <button
            onClick={() => setActiveSubTab("places")}
            className={`rounded-full px-4 py-1.5 text-xs sm:text-sm font-semibold transition-all ${
              activeSubTab === "places"
                ? "bg-lime-voltage text-forest-ink font-bold shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            📍 Điểm Muốn Đến ({plan?.places?.length || 0})
          </button>
          <button
            onClick={() => setActiveSubTab("hotels")}
            className={`rounded-full px-4 py-1.5 text-xs sm:text-sm font-semibold transition-all ${
              activeSubTab === "hotels"
                ? "bg-lime-voltage text-forest-ink font-bold shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            🏨 Khách Sạn ({plan?.hotels?.length || 0})
          </button>
          <button
            onClick={() => setActiveSubTab("itinerary")}
            className={`rounded-full px-4 py-1.5 text-xs sm:text-sm font-semibold transition-all ${
              activeSubTab === "itinerary"
                ? "bg-lime-voltage text-forest-ink font-bold shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            📅 Lịch Trình Chi Tiết
          </button>
        </div>

        {/* Action Button for Current SubTab */}
        <div>
          {activeSubTab === "places" && (
            <Button
              className="rounded-full bg-forest-ink hover:bg-forest-ink/90 text-white font-bold text-xs sm:text-sm"
              onClick={handleOpenAddPlace}
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Thêm Điểm Muốn Đến
            </Button>
          )}
          {activeSubTab === "hotels" && (
            <Button
              className="rounded-full bg-forest-ink hover:bg-forest-ink/90 text-white font-bold text-xs sm:text-sm"
              onClick={handleOpenAddHotel}
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Lưu Khách Sạn Mới
            </Button>
          )}
        </div>
      </div>

      {/* 3. SUBTAB CONTENT: PLACES */}
      {activeSubTab === "places" && (
        <div className="space-y-4">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider shrink-0 mr-1">
              Nhãn:
            </span>
            <button
              onClick={() => setActiveCategoryFilter("ALL")}
              className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-all shrink-0 ${
                activeCategoryFilter === "ALL"
                  ? "bg-forest-ink text-white"
                  : "bg-muted/80 text-muted-foreground hover:text-foreground"
              }`}
            >
              Tất cả ({plan?.places?.length || 0})
            </button>
            {CATEGORY_LABELS.map((cat) => {
              const count = plan?.places?.filter((p) => p.category === cat.key).length || 0
              return (
                <button
                  key={cat.key}
                  onClick={() => setActiveCategoryFilter(cat.key)}
                  className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-all shrink-0 border ${
                    activeCategoryFilter === cat.key
                      ? "bg-forest-ink text-white border-forest-ink"
                      : `${cat.color} hover:opacity-80`
                  }`}
                >
                  {cat.label} ({count})
                </button>
              )
            })}
          </div>

          {/* Places Grid */}
          {filteredPlaces.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border/80 p-12 text-center bg-card/50">
              <Compass className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
              <h3 className="font-bold text-lg text-foreground">Chưa có địa điểm nào</h3>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto mt-1 mb-4">
                Lên danh sách các quán ăn ngon, điểm vui chơi, chụp ảnh check-in để nhóm cùng trải nghiệm nhé!
              </p>
              <Button
                className="rounded-full bg-forest-ink hover:bg-forest-ink/90 text-white font-bold"
                onClick={handleOpenAddPlace}
              >
                <Plus className="h-4 w-4 mr-1.5" />
                Thêm Điểm Muốn Đến Đầu Tiên
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence>
                {filteredPlaces.map((place) => {
                  const catConfig =
                    CATEGORY_LABELS.find((c) => c.key === place.category) || CATEGORY_LABELS[5]
                  return (
                    <motion.div
                      key={place.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className={`rounded-2xl border p-4 bg-card transition-shadow hover:shadow-md relative flex flex-col justify-between ${
                        place.isVisited
                          ? "border-muted-foreground/30 bg-muted/20 opacity-80"
                          : "border-border/80"
                      }`}
                    >
                      <div>
                        {/* Top Row: Category Badge + Day + Status Checkbox */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold border ${catConfig.color}`}
                            >
                              {catConfig.label}
                            </span>
                            {place.dayNumber && (
                              <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                                Ngày {place.dayNumber}
                              </span>
                            )}
                            {place.visitTime && (
                              <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {place.visitTime}
                              </span>
                            )}
                          </div>

                          <button
                            onClick={() => handleToggleVisited(place.id)}
                            className="text-muted-foreground hover:text-lime-voltage transition-colors"
                            title={place.isVisited ? "Đã ghé thăm" : "Đánh dấu đã ghé thăm"}
                          >
                            {place.isVisited ? (
                              <CheckCircle2 className="h-5 w-5 text-lime-voltage fill-forest-ink" />
                            ) : (
                              <Circle className="h-5 w-5 hover:text-forest-ink" />
                            )}
                          </button>
                        </div>

                        {/* Title & Address */}
                        <h4
                          className={`font-black text-base tracking-tight text-foreground ${
                            place.isVisited ? "line-through text-muted-foreground" : ""
                          }`}
                        >
                          {place.name}
                        </h4>
                        {place.address && (
                          <div className="flex items-start gap-1.5 text-xs text-muted-foreground mt-1">
                            <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                            <span className="line-clamp-2">{place.address}</span>
                          </div>
                        )}

                        {place.notes && (
                          <p className="text-xs text-muted-foreground/90 mt-2 bg-muted/40 p-2 rounded-xl italic">
                            "{place.notes}"
                          </p>
                        )}
                      </div>

                      {/* Bottom Row: Estimated Cost + Actions */}
                      <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between">
                        <span className="text-xs font-bold text-foreground">
                          {place.estimatedCost
                            ? formatCurrency(place.estimatedCost)
                            : "Miễn phí / Chưa rõ"}
                        </span>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-full text-muted-foreground hover:text-foreground"
                            onClick={() => handleOpenEditPlace(place)}
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-full text-alarm-red hover:bg-alarm-red/10"
                            onClick={() => handleDeletePlace(place.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      )}

      {/* 4. SUBTAB CONTENT: HOTELS */}
      {activeSubTab === "hotels" && (
        <div className="space-y-4">
          {(!plan?.hotels || plan.hotels.length === 0) ? (
            <div className="rounded-3xl border border-dashed border-border/80 p-12 text-center bg-card/50">
              <Hotel className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
              <h3 className="font-bold text-lg text-foreground">Chưa có khách sạn nào được lưu</h3>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto mt-1 mb-4">
                Lưu lại các khách sạn, resort, homestay dự định ở cùng thông tin liên hệ và link đặt phòng.
              </p>
              <Button
                className="rounded-full bg-forest-ink hover:bg-forest-ink/90 text-white font-bold"
                onClick={handleOpenAddHotel}
              >
                <Plus className="h-4 w-4 mr-1.5" />
                Lưu Khách Sạn Đầu Tiên
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {plan.hotels.map((hotel) => (
                <Card key={hotel.id} className="rounded-2xl border-border/80 shadow-xs flex flex-col justify-between">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Hotel className="h-4 w-4 text-forest-ink" />
                          <CardTitle className="text-lg font-black tracking-tight text-foreground">
                            {hotel.name}
                          </CardTitle>
                        </div>
                        {hotel.address && (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5 shrink-0" />
                            <span>{hotel.address}</span>
                          </div>
                        )}
                      </div>
                      <Badge className="bg-linen-mist text-forest-ink border-forest-ink/20 font-bold text-xs rounded-full">
                        {hotel.price ? formatCurrency(hotel.price) : "Chưa có giá"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-0">
                    {/* Dates */}
                    <div className="flex flex-wrap items-center gap-3 text-xs bg-muted/40 p-2.5 rounded-xl font-medium text-muted-foreground">
                      <div>
                        <span className="font-bold text-foreground">Check-in: </span>
                        {hotel.checkInDate
                          ? new Date(hotel.checkInDate).toLocaleDateString("vi-VN")
                          : "Chưa đặt"}
                      </div>
                      <span>→</span>
                      <div>
                        <span className="font-bold text-foreground">Check-out: </span>
                        {hotel.checkOutDate
                          ? new Date(hotel.checkOutDate).toLocaleDateString("vi-VN")
                          : "Chưa đặt"}
                      </div>
                    </div>

                    {/* Contacts & Links */}
                    <div className="flex flex-wrap items-center gap-3 text-xs">
                      {hotel.phoneNumber && (
                        <a
                          href={`tel:${hotel.phoneNumber}`}
                          className="flex items-center gap-1 text-forest-ink hover:underline font-semibold"
                        >
                          <Phone className="h-3.5 w-3.5" />
                          {hotel.phoneNumber}
                        </a>
                      )}
                      {hotel.bookingUrl && (
                        <a
                          href={hotel.bookingUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-forest-ink hover:underline font-semibold"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          Xem trang đặt phòng
                        </a>
                      )}
                    </div>

                    {hotel.notes && (
                      <p className="text-xs text-muted-foreground italic">
                        "{hotel.notes}"
                      </p>
                    )}

                    {/* Actions */}
                    <div className="pt-2 border-t border-border/60 flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-full text-muted-foreground hover:text-foreground"
                        onClick={() => handleOpenEditHotel(hotel)}
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-full text-alarm-red hover:bg-alarm-red/10"
                        onClick={() => handleDeleteHotel(hotel.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 5. SUBTAB CONTENT: ITINERARY / TIMELINE */}
      {activeSubTab === "itinerary" && (
        <div className="space-y-6">
          {itineraryDays.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border/80 p-12 text-center bg-card/50">
              <Calendar className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
              <h3 className="font-bold text-lg text-foreground">Chưa có lịch trình</h3>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto mt-1 mb-4">
                Hãy thêm các địa điểm muốn đến và gán vào Ngày 1, Ngày 2 để hệ thống tự động sắp xếp thành lịch trình hoàn chỉnh.
              </p>
              <Button
                className="rounded-full bg-forest-ink hover:bg-forest-ink/90 text-white font-bold"
                onClick={handleOpenAddPlace}
              >
                <Plus className="h-4 w-4 mr-1.5" />
                Thêm Điểm Đến Ngay
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {itineraryDays.map(([dayKey, groupItems]) => (
                <div
                  key={String(dayKey)}
                  className="rounded-3xl border border-border/80 bg-card p-5 shadow-xs space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-border/60 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-lime-voltage text-forest-ink font-black text-xs">
                        {typeof dayKey === "number" ? dayKey : "★"}
                      </span>
                      <h4 className="font-black text-lg text-foreground">
                        {typeof dayKey === "number" ? `Ngày ${dayKey}` : String(dayKey)}
                      </h4>
                    </div>
                    <span className="text-xs font-semibold text-muted-foreground">
                      {groupItems.places.length} hoạt động
                    </span>
                  </div>

                  {/* Day Activities */}
                  <div className="space-y-3">
                    {groupItems.places.map((place) => {
                      const catConfig =
                        CATEGORY_LABELS.find((c) => c.key === place.category) || CATEGORY_LABELS[5]
                      return (
                        <div
                          key={place.id}
                          className="flex items-center justify-between p-3 rounded-2xl bg-muted/40 hover:bg-muted/70 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleToggleVisited(place.id)}
                              className="text-muted-foreground hover:text-lime-voltage"
                            >
                              {place.isVisited ? (
                                <CheckCircle2 className="h-5 w-5 text-lime-voltage fill-forest-ink" />
                              ) : (
                                <Circle className="h-5 w-5 hover:text-forest-ink" />
                              )}
                            </button>
                            <div>
                              <div className="flex items-center gap-2">
                                <span
                                  className={`font-bold text-sm text-foreground ${
                                    place.isVisited ? "line-through text-muted-foreground" : ""
                                  }`}
                                >
                                  {place.name}
                                </span>
                                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${catConfig.color}`}>
                                  {catConfig.label}
                                </span>
                              </div>
                              {place.address && (
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {place.address}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="text-right">
                            {place.visitTime && (
                              <div className="text-xs font-semibold text-forest-ink">
                                🕒 {place.visitTime}
                              </div>
                            )}
                            {place.estimatedCost && (
                              <div className="text-xs text-muted-foreground">
                                {formatCurrency(place.estimatedCost)}
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 6. MODAL: EDIT PLAN */}
      <Dialog open={isPlanModalOpen} onOpenChange={setIsPlanModalOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black">Thông Tin Chuyến Đi</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Cập nhật điểm đến, khoảng thời gian và dự toán ngân sách cho chuyến du lịch.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSavePlan} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Điểm đến (Thành phố / Quốc gia) *</Label>
              <Input
                required
                className="rounded-xl"
                placeholder="Ví dụ: Đà Nẵng - Hội An, Đà Lạt, Bangkok..."
                value={planForm.destination}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPlanForm({ ...planForm, destination: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Ngày bắt đầu</Label>
                <Input
                  type="date"
                  className="rounded-xl"
                  value={planForm.startDate || ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPlanForm({ ...planForm, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Ngày kết thúc</Label>
                <Input
                  type="date"
                  className="rounded-xl"
                  value={planForm.endDate || ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPlanForm({ ...planForm, endDate: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Dự toán ngân sách (VND)</Label>
              <Input
                type="number"
                className="rounded-xl"
                placeholder="Ví dụ: 10000000"
                value={planForm.estimatedBudget || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setPlanForm({
                    ...planForm,
                    estimatedBudget: e.target.value ? Number(e.target.value) : null,
                  })
                }
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Ghi chú chuyến đi</Label>
              <textarea
                className="flex min-h-[70px] w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                rows={3}
                placeholder="Ví dụ: Mang theo kem chống nắng, vé máy bay đã mua..."
                value={planForm.notes || ""}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPlanForm({ ...planForm, notes: e.target.value })}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                onClick={() => setIsPlanModalOpen(false)}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                className="rounded-full bg-lime-voltage text-forest-ink font-bold hover:bg-lime-voltage/90"
              >
                Lưu Kế Hoạch
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 7. MODAL: ADD/EDIT HOTEL */}
      <Dialog open={isHotelModalOpen} onOpenChange={setIsHotelModalOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black">
              {editingHotel ? "Sửa Khách Sạn" : "Lưu Khách Sạn Mới"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Lưu thông tin chỗ ở, thời gian check-in/out và link đặt phòng.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveHotel} className="space-y-3.5 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Tên khách sạn / Homestay *</Label>
              <Input
                required
                className="rounded-xl"
                placeholder="Ví dụ: Vanda Hotel Danang, An Bang Beach Resort..."
                value={hotelForm.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setHotelForm({ ...hotelForm, name: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Địa chỉ</Label>
              <Input
                className="rounded-xl"
                placeholder="Số nhà, tên đường, khu vực..."
                value={hotelForm.address || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setHotelForm({ ...hotelForm, address: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Ngày Check-in</Label>
                <Input
                  type="date"
                  className="rounded-xl"
                  value={hotelForm.checkInDate || ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setHotelForm({ ...hotelForm, checkInDate: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Ngày Check-out</Label>
                <Input
                  type="date"
                  className="rounded-xl"
                  value={hotelForm.checkOutDate || ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setHotelForm({ ...hotelForm, checkOutDate: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Chi phí (VND)</Label>
                <Input
                  type="number"
                  className="rounded-xl"
                  placeholder="Ví dụ: 1500000"
                  value={hotelForm.price || ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setHotelForm({
                      ...hotelForm,
                      price: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Số điện thoại</Label>
                <Input
                  className="rounded-xl"
                  placeholder="0901234567..."
                  value={hotelForm.phoneNumber || ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setHotelForm({ ...hotelForm, phoneNumber: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Link đặt phòng (Booking / Agoda / Airbnb)</Label>
              <Input
                type="url"
                className="rounded-xl"
                placeholder="https://..."
                value={hotelForm.bookingUrl || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setHotelForm({ ...hotelForm, bookingUrl: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Ghi chú</Label>
              <textarea
                className="flex min-h-[60px] w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                rows={2}
                placeholder="Mã xác nhận phòng, chính sách bữa sáng..."
                value={hotelForm.notes || ""}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setHotelForm({ ...hotelForm, notes: e.target.value })}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                onClick={() => setIsHotelModalOpen(false)}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                className="rounded-full bg-lime-voltage text-forest-ink font-bold hover:bg-lime-voltage/90"
              >
                {editingHotel ? "Cập Nhật" : "Lưu Khách Sạn"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 8. MODAL: ADD/EDIT PLACE */}
      <Dialog open={isPlaceModalOpen} onOpenChange={setIsPlaceModalOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black">
              {editingPlace ? "Sửa Điểm Muốn Đến" : "Thêm Điểm Muốn Đến"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Lưu địa điểm ăn uống, vui chơi, tham quan muốn trải nghiệm cùng nhóm.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSavePlace} className="space-y-3.5 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Tên địa điểm *</Label>
              <Input
                required
                className="rounded-xl"
                placeholder="Ví dụ: Bà Nà Hills, Bánh xèo Bà Dưỡng, Cầu Rồng..."
                value={placeForm.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPlaceForm({ ...placeForm, name: e.target.value })}
              />
            </div>

            {/* Category Pill Selector */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Nhãn danh mục (Label) *</Label>
              <div className="grid grid-cols-3 gap-2">
                {CATEGORY_LABELS.map((cat) => (
                  <button
                    type="button"
                    key={cat.key}
                    onClick={() => setPlaceForm({ ...placeForm, category: cat.key })}
                    className={`rounded-xl py-2 px-2 text-xs font-bold border transition-all text-center ${
                      placeForm.category === cat.key
                        ? "bg-forest-ink text-white border-forest-ink shadow-xs"
                        : "bg-muted/40 text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Xếp vào Ngày số</Label>
                <Input
                  type="number"
                  min={1}
                  max={30}
                  className="rounded-xl"
                  placeholder="1, 2, 3..."
                  value={placeForm.dayNumber ?? ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setPlaceForm({
                      ...placeForm,
                      dayNumber: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Khung giờ ghé thăm</Label>
                <Input
                  className="rounded-xl"
                  placeholder="09:00, Buổi chiều, 19:30..."
                  value={placeForm.visitTime || ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPlaceForm({ ...placeForm, visitTime: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Địa chỉ</Label>
              <Input
                className="rounded-xl"
                placeholder="Tên đường, phường, quận..."
                value={placeForm.address || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPlaceForm({ ...placeForm, address: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Chi phí dự kiến (VND)</Label>
              <Input
                type="number"
                className="rounded-xl"
                placeholder="Ví dụ: 300000"
                value={placeForm.estimatedCost || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setPlaceForm({
                    ...placeForm,
                    estimatedCost: e.target.value ? Number(e.target.value) : null,
                  })
                }
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Ghi chú & Mẹo chơi</Label>
              <textarea
                className="flex min-h-[60px] w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                rows={2}
                placeholder="Nên đi lúc hoàng hôn, đặt bàn trước..."
                value={placeForm.notes || ""}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPlaceForm({ ...placeForm, notes: e.target.value })}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                onClick={() => setIsPlaceModalOpen(false)}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                className="rounded-full bg-lime-voltage text-forest-ink font-bold hover:bg-lime-voltage/90"
              >
                {editingPlace ? "Cập Nhật" : "Thêm Địa Điểm"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 9. ADD MEMBER MODAL */}
      <AddMemberModal
        open={isAddMemberModalOpen}
        onOpenChange={setIsAddMemberModalOpen}
        groupId={groupId}
        existingMemberIds={existingMemberIds}
      />
    </div>
  )
}
