import React, { useState, useEffect, useMemo, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Hotel,
  MapPin,
  Calendar,
  Plus,
  Users,
  ExternalLink,
  Phone,
  Trash2,
  Edit2,
  CheckCircle2,
  Circle,
  Clock,
  Compass,
  Calculator,
  Wallet,
  AlertTriangle,
  Sparkles,
  ChevronLeft,
  ChevronRight,
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
import {
  extractTikTokUrl,
  extractTikTokVideoId,
  combineNotesAndTikTok,
  getCleanNotesWithoutTikTok,
} from "@/lib/tiktok"
import type {
  TravelPlan,
  TravelHotel,
  TravelPlace,
  TravelBudgetItem,
  TravelPlanCreateOrUpdatePayload,
  TravelHotelPayload,
  TravelPlacePayload,
  TravelBudgetItemPayload,
} from "@/types/travel/TravelPlan"
import type { GroupViewDto } from "@/types/group/GroupViewDto"
import { formatCurrency } from "@/lib/utils"
import { toast } from "sonner"
import AddMemberModal from "@/pages/group/components/AddMemberModal"

interface TravelPlanTabProps {
  groupId: number
  group?: GroupViewDto | null
}

const CATEGORY_LABELS = [
  { key: "Ăn uống", label: "Ăn uống", color: "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300" },
  { key: "Vui chơi", label: "Vui chơi", color: "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950/40 dark:text-purple-300" },
  { key: "Tham quan", label: "Tham quan", color: "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/40 dark:text-blue-300" },
  { key: "Cà phê", label: "Cà phê", color: "bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-950/40 dark:text-orange-300" },
  { key: "Mua sắm", label: "Mua sắm", color: "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300" },
  { key: "Khác", label: "Khác", color: "bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-300" },
]

const BUDGET_CATEGORIES = [
  { key: "Di chuyển", label: "Di chuyển / Vé xe / Máy bay", color: "bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-950/40 dark:text-sky-300" },
  { key: "Ăn uống chung", label: "Quỹ ăn uống chung", color: "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300" },
  { key: "Vé & Tour", label: "Vé tham quan / Tour", color: "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950/40 dark:text-purple-300" },
  { key: "Thuê xe & Xăng", label: "Thuê xe & Nhiên liệu", color: "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300" },
  { key: "Dự phòng", label: "Chi phí dự phòng", color: "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300" },
  { key: "Khác", label: "Khoản khác", color: "bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-300" },
]

export default function TravelPlanTab({ groupId, group }: TravelPlanTabProps) {
  const [plan, setPlan] = useState<TravelPlan | null>(null)
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>("ALL")
  const [activeSubTab, setActiveSubTab] = useState<"places" | "hotels" | "itinerary" | "budget">("places")
  const [contingencyPercent, setContingencyPercent] = useState<number>(10)

  // Modals
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false)
  const [isHotelModalOpen, setIsHotelModalOpen] = useState(false)
  const [isPlaceModalOpen, setIsPlaceModalOpen] = useState(false)
  const [isBudgetItemModalOpen, setIsBudgetItemModalOpen] = useState(false)
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false)

  // Editing items
  const [editingHotel, setEditingHotel] = useState<TravelHotel | null>(null)
  const [editingPlace, setEditingPlace] = useState<TravelPlace | null>(null)
  const [editingBudgetItem, setEditingBudgetItem] = useState<TravelBudgetItem | null>(null)

  // TikTok Quick Paste & Horizontal Reel states
  const [quickTikTokUrl, setQuickTikTokUrl] = useState<string>("")
  const [quickTikTokTitle, setQuickTikTokTitle] = useState<string>("")
  const [quickTikTokCategory, setQuickTikTokCategory] = useState<string>("Ăn uống")
  const [isAddingTikTok, setIsAddingTikTok] = useState<boolean>(false)
  const [placeTiktokInput, setPlaceTiktokInput] = useState<string>("")
  const tiktokReelRef = useRef<HTMLDivElement>(null)

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

  const [budgetItemForm, setBudgetItemForm] = useState<TravelBudgetItemPayload>({
    name: "",
    category: "Di chuyển",
    unitCost: 0,
    quantity: 1,
    notes: "",
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
        budgetItems: prev?.budgetItems || [],
      }))
      setIsPlanModalOpen(false)
      toast.success("Đã lưu kế hoạch chuyến đi!")
    } catch (err) {
      console.error("Failed to save plan:", err)
      toast.error("Không thể lưu kế hoạch chuyến đi.")
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
    setPlaceTiktokInput("")
    setPlaceForm({
      name: "",
      address: "",
      category: activeCategoryFilter === "ALL" ? "Ăn uống" : activeCategoryFilter,
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
    const existingTikTok = extractTikTokUrl(place.notes)
    setPlaceTiktokInput(existingTikTok || "")
    setPlaceForm({
      name: place.name,
      address: place.address || "",
      category: place.category,
      dayNumber: place.dayNumber ?? 1,
      visitTime: place.visitTime || "",
      estimatedCost: place.estimatedCost,
      notes: getCleanNotesWithoutTikTok(place.notes),
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

      const mergedNotes = combineNotesAndTikTok(placeForm.notes, placeTiktokInput)
      const payload: TravelPlacePayload = {
        ...placeForm,
        notes: mergedNotes,
      }

      if (editingPlace) {
        const updated = await travelApi.updatePlace(editingPlace.id, payload)
        setPlan((prev) =>
          prev
            ? {
                ...prev,
                places: prev.places.map((p) => (p.id === updated.id ? updated : p)),
              }
            : prev
        )
        toast.success("Đã cập nhật địa điểm!")
      } else {
        const created = await travelApi.addPlace(activePlanId, payload)
        setPlan((prev) =>
          prev
            ? {
                ...prev,
                places: [...prev.places, created],
              }
            : prev
        )
        toast.success("Đã thêm địa điểm mới!")
      }
      setIsPlaceModalOpen(false)
    } catch (err) {
      console.error("Failed to save place:", err)
      toast.error("Không thể lưu địa điểm.")
    }
  }

  // Quick Add TikTok link for current category
  const handleQuickAddTikTok = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const rawUrl = quickTikTokUrl.trim()
    if (!rawUrl) {
      toast.error("Vui lòng dán link video TikTok.")
      return
    }

    const detectedUrl = extractTikTokUrl(rawUrl) || (rawUrl.includes("tiktok.com") ? rawUrl : null)
    if (!detectedUrl) {
      toast.error("Link không hợp lệ. Vui lòng dán link video từ TikTok.")
      return
    }

    const targetCategory = activeCategoryFilter === "ALL" ? (quickTikTokCategory || "Ăn uống") : activeCategoryFilter
    const placeName = quickTikTokTitle.trim() || `Review ${targetCategory}`

    setIsAddingTikTok(true)
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

      const payload: TravelPlacePayload = {
        name: placeName,
        address: "",
        category: targetCategory,
        dayNumber: 1,
        visitTime: "",
        estimatedCost: null,
        notes: detectedUrl,
        isVisited: false,
      }

      const created = await travelApi.addPlace(activePlanId, payload)
      setPlan((prev) =>
        prev
          ? {
              ...prev,
              places: [...prev.places, created],
            }
          : prev
      )

      setQuickTikTokUrl("")
      setQuickTikTokTitle("")
      toast.success(`Đã thêm clip TikTok vào mục "${targetCategory}"!`)
    } catch (err) {
      console.error("Failed to add TikTok place:", err)
      toast.error("Không thể thêm clip TikTok. Vui lòng thử lại.")
    } finally {
      setIsAddingTikTok(false)
    }
  }

  // Scroll TikTok horizontal reel
  const scrollTikTokReel = (direction: "left" | "right") => {
    if (tiktokReelRef.current) {
      const offset = direction === "left" ? -340 : 340
      tiktokReelRef.current.scrollBy({ left: offset, behavior: "smooth" })
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

  // Budget Item actions
  const handleOpenAddBudgetItem = () => {
    setEditingBudgetItem(null)
    setBudgetItemForm({
      name: "",
      category: "Di chuyển",
      unitCost: 0,
      quantity: Math.max(1, members.length || 1),
      notes: "",
    })
    setIsBudgetItemModalOpen(true)
  }

  const handleOpenEditBudgetItem = (item: TravelBudgetItem) => {
    setEditingBudgetItem(item)
    setBudgetItemForm({
      name: item.name,
      category: item.category,
      unitCost: item.unitCost,
      quantity: item.quantity || 1,
      notes: item.notes || "",
    })
    setIsBudgetItemModalOpen(true)
  }

  const handleSaveBudgetItem = async (e: React.FormEvent<HTMLFormElement>) => {
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

      if (editingBudgetItem) {
        const updated = await travelApi.updateBudgetItem(editingBudgetItem.id, budgetItemForm)
        setPlan((prev) =>
          prev
            ? {
                ...prev,
                budgetItems: (prev.budgetItems || []).map((b) =>
                  b.id === updated.id ? updated : b
                ),
              }
            : prev
        )
        toast.success("Đã cập nhật khoản dự toán!")
      } else {
        const created = await travelApi.addBudgetItem(activePlanId, budgetItemForm)
        setPlan((prev) =>
          prev
            ? {
                ...prev,
                budgetItems: [...(prev.budgetItems || []), created],
              }
            : prev
        )
        toast.success("Đã thêm khoản dự toán chi phí!")
      }
      setIsBudgetItemModalOpen(false)
    } catch (err) {
      console.error("Failed to save budget item:", err)
      toast.error("Không thể lưu khoản dự toán.")
    }
  }

  const handleDeleteBudgetItem = async (itemId: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa khoản dự toán này?")) return
    try {
      await travelApi.deleteBudgetItem(itemId)
      setPlan((prev) =>
        prev
          ? {
              ...prev,
              budgetItems: (prev.budgetItems || []).filter((b) => b.id !== itemId),
            }
          : prev
      )
      toast.success("Đã xóa khoản dự toán!")
    } catch (err) {
      console.error("Failed to delete budget item:", err)
    }
  }

  const handleApplyCalculatedToTargetBudget = async (calculatedTotal: number) => {
    try {
      const saved = await travelApi.savePlan({
        ...planForm,
        groupId,
        destination: plan?.destination || planForm.destination || group?.name || "Chuyến đi mới",
        startDate: plan?.startDate || (planForm.startDate ? new Date(planForm.startDate).toISOString() : null),
        endDate: plan?.endDate || (planForm.endDate ? new Date(planForm.endDate).toISOString() : null),
        estimatedBudget: Math.round(calculatedTotal),
        notes: plan?.notes ?? planForm.notes,
      })
      setPlan((prev) => ({
        ...saved,
        hotels: prev?.hotels || [],
        places: prev?.places || [],
        budgetItems: prev?.budgetItems || [],
      }))
      setPlanForm((prev) => ({ ...prev, estimatedBudget: Math.round(calculatedTotal) }))
      toast.success("Đã cập nhật ngân sách mục tiêu theo tổng dự toán!")
    } catch (err) {
      console.error("Failed to update target budget:", err)
      toast.error("Không thể cập nhật ngân sách mục tiêu.")
    }
  }

  // Filtered places
  const filteredPlaces = useMemo(() => {
    if (!plan?.places) return []
    if (activeCategoryFilter === "ALL") return plan.places
    return plan.places.filter((p) => p.category === activeCategoryFilter)
  }, [plan?.places, activeCategoryFilter])

  // Places with TikTok review clips for horizontal reel
  const tiktokPlaces = useMemo(() => {
    return filteredPlaces.filter((p) => Boolean(extractTikTokUrl(p.notes)))
  }, [filteredPlaces])

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

  // Budget & Cost Estimation Summary
  const budgetSummary = useMemo(() => {
    const hotelsCost = (plan?.hotels || []).reduce((sum, h) => sum + (h.price || 0), 0)
    const placesCost = (plan?.places || []).reduce((sum, p) => sum + (p.estimatedCost || 0), 0)
    const customItems = plan?.budgetItems || []
    const customItemsCost = customItems.reduce(
      (sum, b) => sum + (b.totalCost ?? b.unitCost * (b.quantity || 1)),
      0
    )

    const baseTotal = hotelsCost + placesCost + customItemsCost
    const contingencyAmount = Math.round((baseTotal * contingencyPercent) / 100)
    const grandTotal = baseTotal + contingencyAmount
    const memberCount = Math.max(1, members.length)
    const perMemberCost = Math.ceil(grandTotal / memberCount)
    const targetBudget = plan?.estimatedBudget || 0
    const budgetDiff = targetBudget > 0 ? targetBudget - grandTotal : 0

    // Breakdown by place category
    const placesByCategory = CATEGORY_LABELS.map((cat) => {
      const items = (plan?.places || []).filter((p) => p.category === cat.key)
      const cost = items.reduce((s, p) => s + (p.estimatedCost || 0), 0)
      return { ...cat, count: items.length, cost }
    }).filter((c) => c.cost > 0 || c.count > 0)

    return {
      hotelsCost,
      placesCost,
      customItemsCost,
      baseTotal,
      contingencyAmount,
      grandTotal,
      memberCount,
      perMemberCost,
      targetBudget,
      budgetDiff,
      placesByCategory,
    }
  }, [plan?.hotels, plan?.places, plan?.budgetItems, plan?.estimatedBudget, contingencyPercent, members.length])

  return (
    <div className="space-y-6">
      {/* 1. HERO TRIP OVERVIEW BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-forest-ink text-paper p-6 sm:p-8 shadow-md">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center rounded-full bg-lime-voltage/20 text-lime-voltage px-3 py-1 text-xs font-bold uppercase tracking-wider">
              <span>Kế hoạch Du lịch &amp; Khám phá</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {plan?.destination || group?.name || "Chưa đặt tên điểm đến"}
            </h2>
            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-paper/80 font-medium">
              <div>
                <span>
                  {plan?.startDate && plan?.endDate
                    ? `${new Date(plan.startDate).toLocaleDateString("vi-VN")} - ${new Date(plan.endDate).toLocaleDateString("vi-VN")}`
                    : "Chưa chọn ngày đi"}
                </span>
              </div>
              {plan?.estimatedBudget && (
                <div>
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
              Sửa Kế Hoạch
            </Button>
            <Button
              className="rounded-full bg-lime-voltage hover:bg-lime-voltage/90 text-forest-ink font-bold text-xs sm:text-sm shadow-xs"
              onClick={() => setIsAddMemberModalOpen(true)}
            >
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
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs font-semibold">
            <span className="rounded-full bg-white/10 px-3 py-1 text-white">
              {plan?.hotels?.length || 0} Khách sạn
            </span>
            <span className="rounded-full bg-white/10 px-3 py-1 text-white">
              {plan?.places?.length || 0} Điểm đến
            </span>
            <button
              type="button"
              onClick={() => setActiveSubTab("budget")}
              className="rounded-full bg-lime-voltage/20 hover:bg-lime-voltage/30 border border-lime-voltage/40 px-3 py-1 text-lime-voltage transition-colors cursor-pointer"
            >
              Dự toán: {formatCurrency(budgetSummary.grandTotal)} (~{formatCurrency(budgetSummary.perMemberCost)}/người)
            </button>
          </div>
        </div>
      </div>

      {/* 2. SUB-NAVIGATION PILLS: Places, Hotels, Itinerary, Budget */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/70 pb-3">
        <div className="inline-flex flex-wrap rounded-full bg-muted/60 p-1 border border-border/80 gap-1">
          <button
            onClick={() => setActiveSubTab("places")}
            className={`rounded-full px-4 py-1.5 text-xs sm:text-sm font-semibold transition-all ${
              activeSubTab === "places"
                ? "bg-lime-voltage text-forest-ink font-bold shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Điểm Muốn Đến ({plan?.places?.length || 0})
          </button>
          <button
            onClick={() => setActiveSubTab("hotels")}
            className={`rounded-full px-4 py-1.5 text-xs sm:text-sm font-semibold transition-all ${
              activeSubTab === "hotels"
                ? "bg-lime-voltage text-forest-ink font-bold shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Khách Sạn ({plan?.hotels?.length || 0})
          </button>
          <button
            onClick={() => setActiveSubTab("itinerary")}
            className={`rounded-full px-4 py-1.5 text-xs sm:text-sm font-semibold transition-all ${
              activeSubTab === "itinerary"
                ? "bg-lime-voltage text-forest-ink font-bold shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Lịch Trình Chi Tiết
          </button>
          <button
            onClick={() => setActiveSubTab("budget")}
            className={`rounded-full px-4 py-1.5 text-xs sm:text-sm font-semibold transition-all ${
              activeSubTab === "budget"
                ? "bg-lime-voltage text-forest-ink font-bold shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Dự Toán Chi Phí
          </button>
        </div>

        {/* Action Button for Current SubTab */}
        <div>
          {activeSubTab === "places" && (
            <Button
              className="rounded-full bg-forest-ink hover:bg-forest-ink/90 text-white font-bold text-xs sm:text-sm"
              onClick={handleOpenAddPlace}
            >
              + Thêm Điểm Muốn Đến
            </Button>
          )}
          {activeSubTab === "hotels" && (
            <Button
              className="rounded-full bg-forest-ink hover:bg-forest-ink/90 text-white font-bold text-xs sm:text-sm"
              onClick={handleOpenAddHotel}
            >
              + Lưu Khách Sạn Mới
            </Button>
          )}
          {activeSubTab === "budget" && (
            <Button
              className="rounded-full bg-forest-ink hover:bg-forest-ink/90 text-white font-bold text-xs sm:text-sm"
              onClick={handleOpenAddBudgetItem}
            >
              + Thêm Khoản Dự Toán
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

          {/* Quick TikTok Paste Bar for Category */}
          <div className="rounded-2xl border border-border/80 bg-card p-3 sm:p-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-foreground">
                  Dán link TikTok review {activeCategoryFilter === "ALL" ? "" : `• ${activeCategoryFilter}`}
                </span>
                <span className="text-[11px] text-muted-foreground hidden sm:inline">
                  (Xem và lướt clip trực tiếp sang ngang cùng nhóm)
                </span>
              </div>
            </div>

            <form onSubmit={handleQuickAddTikTok} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              {activeCategoryFilter === "ALL" && (
                <select
                  value={quickTikTokCategory}
                  onChange={(e) => setQuickTikTokCategory(e.target.value)}
                  className="rounded-xl border border-input bg-background px-3 py-2 text-xs font-semibold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring shrink-0 h-9"
                >
                  {CATEGORY_LABELS.map((cat) => (
                    <option key={cat.key} value={cat.key}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              )}
              <Input
                className="rounded-xl text-xs flex-1 h-9"
                placeholder="Dán link TikTok review (ví dụ: https://www.tiktok.com/@.../video/...)"
                value={quickTikTokUrl}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuickTikTokUrl(e.target.value)}
              />
              <Input
                className="rounded-xl text-xs sm:w-52 h-9"
                placeholder="Tên quán / địa điểm (tuỳ chọn)"
                value={quickTikTokTitle}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuickTikTokTitle(e.target.value)}
              />
              <Button
                type="submit"
                disabled={isAddingTikTok}
                className="rounded-xl bg-forest-ink hover:bg-forest-ink/90 text-white font-bold text-xs h-9 shrink-0 px-4"
              >
                {isAddingTikTok ? "Đang lưu..." : "+ Lưu Clip TikTok"}
              </Button>
            </form>
          </div>

          {/* Horizontal Reel: Lướt clip TikTok sang ngang */}
          {tiktokPlaces.length > 0 && (
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-foreground">
                    Clips TikTok Review • {activeCategoryFilter === "ALL" ? "Tất cả" : activeCategoryFilter} ({tiktokPlaces.length})
                  </span>
                  <span className="text-[11px] text-muted-foreground hidden md:inline">
                    Lướt sang ngang để xem nhanh video
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-7 w-7 rounded-full border-border/80"
                    onClick={() => scrollTikTokReel("left")}
                    title="Cuộn sang trái"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-7 w-7 rounded-full border-border/80"
                    onClick={() => scrollTikTokReel("right")}
                    title="Cuộn sang phải"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Horizontal Scroll Reel Container */}
              <div
                ref={tiktokReelRef}
                className="flex items-start gap-4 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scroll-smooth no-scrollbar"
              >
                {tiktokPlaces.map((place) => {
                  const tiktokUrl = extractTikTokUrl(place.notes)
                  const videoId = extractTikTokVideoId(tiktokUrl)
                  const cleanNotes = getCleanNotesWithoutTikTok(place.notes)
                  const catConfig = CATEGORY_LABELS.find((c) => c.key === place.category) || CATEGORY_LABELS[5]

                  return (
                    <div
                      key={place.id}
                      className="w-[280px] sm:w-[315px] shrink-0 snap-start rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                    >
                      {/* Video Player or Fallback Link Card */}
                      <div className="w-full bg-black/95 relative flex items-center justify-center overflow-hidden">
                        {videoId ? (
                          <iframe
                            src={`https://www.tiktok.com/player/v1/${videoId}?autoplay=0`}
                            title={place.name}
                            className="w-full h-[460px] border-0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        ) : (
                          <div className="w-full h-[320px] flex flex-col items-center justify-center p-6 text-center text-white space-y-3 bg-gradient-to-b from-zinc-900 to-black">
                            <span className="text-sm font-bold">Clip TikTok Review</span>
                            <p className="text-xs text-white/70 line-clamp-3 break-all">
                              {tiktokUrl}
                            </p>
                            {tiktokUrl && (
                              <Button
                                type="button"
                                size="sm"
                                className="rounded-full bg-white text-black hover:bg-white/90 font-bold text-xs"
                                onClick={() => window.open(tiktokUrl, "_blank")}
                              >
                                Mở xem trên TikTok <ExternalLink className="h-3.5 w-3.5 ml-1" />
                              </Button>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Video Card Meta */}
                      <div className="p-3.5 space-y-2 bg-card">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${catConfig.color}`}>
                            {catConfig.label}
                          </span>
                          <div className="flex items-center gap-1.5">
                            {place.estimatedCost && (
                              <span className="text-xs font-bold text-foreground">
                                {formatCurrency(place.estimatedCost)}
                              </span>
                            )}
                            <button
                              onClick={() => handleToggleVisited(place.id)}
                              className="text-muted-foreground hover:text-lime-voltage transition-colors"
                              title={place.isVisited ? "Đã ghé thăm" : "Đánh dấu đã ghé thăm"}
                            >
                              {place.isVisited ? (
                                <CheckCircle2 className="h-4 w-4 text-lime-voltage fill-forest-ink" />
                              ) : (
                                <Circle className="h-4 w-4 hover:text-forest-ink" />
                              )}
                            </button>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-bold text-sm tracking-tight text-foreground line-clamp-1">
                            {place.name}
                          </h4>
                          {place.address && (
                            <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                              {place.address}
                            </p>
                          )}
                          {cleanNotes && (
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-1 italic">
                              "{cleanNotes}"
                            </p>
                          )}
                        </div>

                        <div className="pt-2 border-t border-border/60 flex items-center justify-between">
                          {tiktokUrl ? (
                            <a
                              href={tiktokUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] font-bold text-foreground hover:text-lime-voltage flex items-center gap-1"
                            >
                              Mở TikTok <ExternalLink className="h-3 w-3" />
                            </a>
                          ) : (
                            <span />
                          )}

                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 rounded-full text-muted-foreground hover:text-foreground"
                              onClick={() => handleOpenEditPlace(place)}
                            >
                              <Edit2 className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 rounded-full text-alarm-red hover:bg-alarm-red/10"
                              onClick={() => handleDeletePlace(place.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

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

                        {extractTikTokUrl(place.notes) && (
                          <div className="mt-2">
                            <a
                              href={extractTikTokUrl(place.notes)!}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 rounded-full bg-forest-ink text-white px-2.5 py-0.5 text-[11px] font-bold hover:bg-forest-ink/90 transition-colors"
                            >
                              Clip TikTok <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        )}

                        {getCleanNotesWithoutTikTok(place.notes) && (
                          <p className="text-xs text-muted-foreground/90 mt-2 bg-muted/40 p-2 rounded-xl italic">
                            "{getCleanNotesWithoutTikTok(place.notes)}"
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
                        {typeof dayKey === "number" ? dayKey : "D"}
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
                                {place.visitTime}
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

      {/* 5.5. SUBTAB CONTENT: BUDGET & COST ESTIMATION CALCULATOR */}
      {activeSubTab === "budget" && (
        <div className="space-y-6">
          {/* Top Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Total Estimated Cost */}
            <div className="rounded-3xl p-5 bg-forest-ink text-white shadow-md flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-lime-voltage flex items-center gap-1.5">
                  <Calculator className="h-4 w-4" />
                  Tổng Dự Toán Chuyến Đi
                </span>
              </div>
              <div className="my-3">
                <p className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  {formatCurrency(budgetSummary.grandTotal)}
                </p>
                <p className="text-xs text-white/75 mt-1">
                  Gốc: {formatCurrency(budgetSummary.baseTotal)} (+{contingencyPercent}% dự phòng)
                </p>
              </div>
              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-lime-voltage font-semibold">
                <span>Tự động tổng hợp</span>
                <Sparkles className="h-3.5 w-3.5" />
              </div>
            </div>

            {/* Per Member Cost */}
            <div className="rounded-3xl p-5 border border-border/80 bg-card shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-forest-ink dark:text-lime-voltage" />
                  Bình Quân Mỗi Thành Viên
                </span>
                <Badge className="bg-linen-mist text-forest-ink font-bold rounded-full text-[11px]">
                  {budgetSummary.memberCount} người
                </Badge>
              </div>
              <div className="my-3">
                <p className="text-2xl sm:text-3xl font-black tracking-tight text-forest-ink dark:text-lime-voltage">
                  {formatCurrency(budgetSummary.perMemberCost)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Mức góp quỹ dự kiến cho mỗi thành viên
                </p>
              </div>
              <div className="pt-2 border-t border-border/60 text-xs text-muted-foreground">
                Chia đều cho {budgetSummary.memberCount} thành viên trong nhóm
              </div>
            </div>

            {/* Target Budget Comparison */}
            <div className="rounded-3xl p-5 border border-border/80 bg-card shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Wallet className="h-4 w-4 text-blue-600" />
                  Ngân Sách Mục Tiêu
                </span>
                {budgetSummary.targetBudget > 0 && (
                  <Badge
                    className={`rounded-full text-[11px] font-bold ${
                      budgetSummary.budgetDiff >= 0
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-red-100 text-alarm-red"
                    }`}
                  >
                    {budgetSummary.budgetDiff >= 0 ? "Trong hạn mức" : "Vượt ngân sách"}
                  </Badge>
                )}
              </div>
              <div className="my-3">
                <p className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                  {budgetSummary.targetBudget > 0
                    ? formatCurrency(budgetSummary.targetBudget)
                    : "Chưa đặt"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {budgetSummary.targetBudget > 0 ? (
                    budgetSummary.budgetDiff >= 0 ? (
                      <span className="text-emerald-600 font-semibold">
                        Còn dư {formatCurrency(budgetSummary.budgetDiff)} so với mục tiêu
                      </span>
                    ) : (
                      <span className="text-alarm-red font-semibold flex items-center gap-1">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        Vượt {formatCurrency(Math.abs(budgetSummary.budgetDiff))} so với mục tiêu
                      </span>
                    )
                  ) : (
                    "Bấm nút bên dưới để chốt làm ngân sách mục tiêu"
                  )}
                </p>
              </div>
              <div className="pt-2 border-t border-border/60 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleApplyCalculatedToTargetBudget(budgetSummary.grandTotal)}
                  className="text-xs font-bold text-forest-ink dark:text-lime-voltage hover:underline cursor-pointer"
                >
                  Đặt tổng dự toán làm mục tiêu →
                </button>
              </div>
            </div>

            {/* Contingency Buffer Control */}
            <div className="rounded-3xl p-5 border border-border/80 bg-card shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Quỹ Dự Phòng Phát Sinh
                </span>
                <Badge variant="outline" className="rounded-full font-bold text-xs">
                  {contingencyPercent}%
                </Badge>
              </div>
              <div className="my-3">
                <p className="text-2xl font-black tracking-tight text-amber-600">
                  +{formatCurrency(budgetSummary.contingencyAmount)}
                </p>
                <div className="flex items-center gap-1.5 mt-2">
                  {[0, 5, 10, 15, 20].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setContingencyPercent(pct)}
                      className={`rounded-full px-2.5 py-0.5 text-xs font-bold border transition-all ${
                        contingencyPercent === pct
                          ? "bg-forest-ink text-lime-voltage border-forest-ink"
                          : "bg-muted/60 text-muted-foreground hover:text-foreground border-border"
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>
              <div className="pt-2 border-t border-border/60 text-xs text-muted-foreground">
                Khuyến nghị 10% - 15% khi đi du lịch nhóm
              </div>
            </div>
          </div>

          {/* Breakdown Grid: Left (Auto-calculated from Hotels & Places) | Right (Custom Budget Items) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column (5 cols): Auto-aggregated breakdown */}
            <div className="lg:col-span-5 rounded-3xl border border-border/80 bg-card p-5 shadow-xs space-y-4">
              <div className="border-b border-border/60 pb-3">
                <h4 className="font-black text-base text-foreground flex items-center gap-2">
                  Cơ Cấu Chi Phí Dự Toán
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Tổng hợp tự động từ khách sạn, điểm đến và các khoản dự toán chung
                </p>
              </div>

              <div className="space-y-3">
                {/* 1. Hotels */}
                <div className="rounded-2xl bg-muted/40 p-3.5 space-y-1.5">
                  <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-foreground">
                    <span>Lưu trú &amp; Khách sạn ({plan?.hotels?.length || 0})</span>
                    <span>{formatCurrency(budgetSummary.hotelsCost)}</span>
                  </div>
                  {(plan?.hotels?.length || 0) > 0 && (
                    <div className="space-y-1 pt-1 border-t border-border/40 text-xs text-muted-foreground">
                      {plan!.hotels.map((h) => (
                        <div key={h.id} className="flex justify-between">
                          <span className="truncate pr-2">• {h.name}</span>
                          <span className="font-medium shrink-0">
                            {h.price ? formatCurrency(h.price) : "0 ₫"}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2. Places & Activities */}
                <div className="rounded-2xl bg-muted/40 p-3.5 space-y-1.5">
                  <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-foreground">
                    <span>Ăn uống &amp; Vui chơi ({plan?.places?.length || 0} điểm)</span>
                    <span>{formatCurrency(budgetSummary.placesCost)}</span>
                  </div>
                  {budgetSummary.placesByCategory.length > 0 && (
                    <div className="space-y-1 pt-1 border-t border-border/40 text-xs text-muted-foreground">
                      {budgetSummary.placesByCategory.map((c) => (
                        <div key={c.key} className="flex justify-between">
                          <span>
                            • {c.label} ({c.count} điểm)
                          </span>
                          <span className="font-medium">{formatCurrency(c.cost)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 3. Custom Budget Items */}
                <div className="rounded-2xl bg-muted/40 p-3.5 flex items-center justify-between text-xs sm:text-sm font-bold text-foreground">
                  <span>Di chuyển, Vé &amp; Khoản chung ({plan?.budgetItems?.length || 0})</span>
                  <span>{formatCurrency(budgetSummary.customItemsCost)}</span>
                </div>

                {/* 4. Contingency */}
                <div className="rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/70 p-3.5 flex items-center justify-between text-xs sm:text-sm font-bold text-amber-800 dark:text-amber-300">
                  <span>Dự phòng phát sinh ({contingencyPercent}%)</span>
                  <span>+{formatCurrency(budgetSummary.contingencyAmount)}</span>
                </div>

                {/* Total Footer */}
                <div className="pt-3 border-t border-border flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground font-semibold">Tổng cộng cần chuẩn bị</p>
                    <p className="text-lg font-black text-foreground">
                      {formatCurrency(budgetSummary.grandTotal)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground font-semibold">Mỗi người đóng</p>
                    <p className="text-lg font-black text-forest-ink dark:text-lime-voltage">
                      {formatCurrency(budgetSummary.perMemberCost)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column (7 cols): Custom Budget Line Items Table */}
            <div className="lg:col-span-7 rounded-3xl border border-border/80 bg-card p-5 shadow-xs space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
                  <div>
                    <h4 className="font-black text-base text-foreground flex items-center gap-2">
                      Danh Sách Khoản Dự Toán Thêm (Vé xe, Máy bay, Quỹ chung...)
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Thêm các chi phí cố định như vé máy bay, tàu xe, thuê xe máy, bảo hiểm du lịch...
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={handleOpenAddBudgetItem}
                    className="rounded-full bg-lime-voltage text-forest-ink hover:bg-lime-voltage/90 font-bold text-xs shrink-0"
                  >
                    + Thêm khoản mục
                  </Button>
                </div>

                {(!plan?.budgetItems || plan.budgetItems.length === 0) ? (
                  <div className="rounded-2xl border border-dashed border-border p-8 text-center">
                    <Calculator className="h-10 w-10 text-muted-foreground/40 mx-auto mb-2" />
                    <p className="text-sm font-bold text-foreground">
                      Chưa có khoản dự toán di chuyển / chung nào
                    </p>
                    <p className="text-xs text-muted-foreground max-w-md mx-auto mt-1 mb-4">
                      Ngoài tiền khách sạn và các điểm ăn chơi đã được tính tự động bên trái, bạn có thể thêm vé máy bay, vé tàu xe, thuê xe... tại đây.
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleOpenAddBudgetItem}
                      className="rounded-full font-bold text-xs"
                    >
                      + Thêm khoản dự toán đầu tiên
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {plan.budgetItems.map((item) => {
                      const catInfo =
                        BUDGET_CATEGORIES.find((c) => c.key === item.category) ||
                        BUDGET_CATEGORIES[BUDGET_CATEGORIES.length - 1]
                      const lineTotal = item.totalCost ?? item.unitCost * (item.quantity || 1)
                      return (
                        <div
                          key={item.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-border/70 bg-muted/20 hover:bg-muted/40 p-3.5 transition-colors"
                        >
                          <div className="space-y-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-bold text-sm text-foreground">{item.name}</span>
                              <span
                                className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${catInfo.color}`}
                              >
                                {catInfo.label}
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-2">
                              <span>
                                Đơn giá: <strong>{formatCurrency(item.unitCost)}</strong> ×{" "}
                                <strong>{item.quantity}</strong> (số lượng/người)
                              </span>
                              {item.notes && <span className="italic">• "{item.notes}"</span>}
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-border/50">
                            <span className="text-sm sm:text-base font-black text-foreground">
                              {formatCurrency(lineTotal)}
                            </span>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 rounded-full text-muted-foreground hover:text-foreground"
                                onClick={() => handleOpenEditBudgetItem(item)}
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 rounded-full text-alarm-red hover:bg-alarm-red/10"
                                onClick={() => handleDeleteBudgetItem(item.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-border/60 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                <span>
                  Lưu ý: Giá khách sạn và chi phí tại từng địa điểm được tự động cộng vào bảng dự toán.
                </span>
                <span className="font-bold text-foreground">
                  Tổng mục thêm: {formatCurrency(budgetSummary.customItemsCost)}
                </span>
              </div>
            </div>
          </div>
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
              <Label className="text-xs font-bold">Link video TikTok review (tuỳ chọn)</Label>
              <Input
                type="url"
                className="rounded-xl"
                placeholder="https://www.tiktok.com/@.../video/..."
                value={placeTiktokInput}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPlaceTiktokInput(e.target.value)}
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

      {/* 8.5. MODAL: ADD/EDIT BUDGET ITEM */}
      <Dialog open={isBudgetItemModalOpen} onOpenChange={setIsBudgetItemModalOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black">
              {editingBudgetItem ? "Sửa Khoản Dự Toán" : "Thêm Khoản Dự Toán Chi Phí"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Tính toán chi phí vé máy bay, tàu xe, thuê phương tiện, vé tham quan hoặc quỹ ăn uống chung.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveBudgetItem} className="space-y-3.5 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Tên khoản chi phí dự kiến *</Label>
              <Input
                required
                className="rounded-xl"
                placeholder="Ví dụ: Vé máy bay khứ hồi, Thuê xe 7 chỗ, Quỹ ăn hải sản..."
                value={budgetItemForm.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setBudgetItemForm({ ...budgetItemForm, name: e.target.value })
                }
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Danh mục dự toán *</Label>
              <div className="grid grid-cols-2 gap-2">
                {BUDGET_CATEGORIES.map((cat) => (
                  <button
                    type="button"
                    key={cat.key}
                    onClick={() => setBudgetItemForm({ ...budgetItemForm, category: cat.key })}
                    className={`rounded-xl py-2 px-2.5 text-xs font-bold border transition-all text-left truncate ${
                      budgetItemForm.category === cat.key
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
                <Label className="text-xs font-bold">Đơn giá (VND) *</Label>
                <Input
                  type="number"
                  required
                  min={0}
                  className="rounded-xl"
                  placeholder="Ví dụ: 1200000"
                  value={budgetItemForm.unitCost || ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setBudgetItemForm({
                      ...budgetItemForm,
                      unitCost: e.target.value ? Number(e.target.value) : 0,
                    })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold">Số lượng / Số người *</Label>
                  {members.length > 0 && (
                    <button
                      type="button"
                      onClick={() =>
                        setBudgetItemForm({ ...budgetItemForm, quantity: members.length })
                      }
                      className="text-[10px] font-bold text-forest-ink dark:text-lime-voltage hover:underline"
                    >
                      Theo số TV ({members.length})
                    </button>
                  )}
                </div>
                <Input
                  type="number"
                  required
                  min={1}
                  className="rounded-xl"
                  placeholder="1"
                  value={budgetItemForm.quantity || 1}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setBudgetItemForm({
                      ...budgetItemForm,
                      quantity: e.target.value ? Math.max(1, Number(e.target.value)) : 1,
                    })
                  }
                />
              </div>
            </div>

            <div className="rounded-2xl bg-linen-mist/60 dark:bg-muted/40 p-3 flex items-center justify-between text-xs">
              <span className="font-semibold text-muted-foreground">Thành tiền dự kiến:</span>
              <span className="text-base font-black text-forest-ink dark:text-lime-voltage">
                {formatCurrency((budgetItemForm.unitCost || 0) * (budgetItemForm.quantity || 1))}
              </span>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Ghi chú</Label>
              <textarea
                className="flex min-h-[60px] w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                rows={2}
                placeholder="Ghi chú thêm về hãng xe, điều kiện vé..."
                value={budgetItemForm.notes || ""}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setBudgetItemForm({ ...budgetItemForm, notes: e.target.value })
                }
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                onClick={() => setIsBudgetItemModalOpen(false)}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                className="rounded-full bg-lime-voltage text-forest-ink font-bold hover:bg-lime-voltage/90"
              >
                {editingBudgetItem ? "Cập Nhật" : "Lưu Khoản Dự Toán"}
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
