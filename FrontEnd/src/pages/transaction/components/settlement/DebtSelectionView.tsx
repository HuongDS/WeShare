import { useMemo, useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar } from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Search, ChevronDown } from "lucide-react"
import type { DebtItem } from "@/types/transaction/DebtItem"

// Helper function to format numbers in Vietnamese style
const formatNumberVN = (value: number): string => {
  return value.toLocaleString("de-DE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })
}

type ViewMode = "item" | "cluster"
type FilterMode = "all" | "group" | "person"

interface DebtSelectionViewProps {
  debtItems: DebtItem[]
  selectedItemIds: string[]
  onSelectedItemIdsChange: (ids: string[]) => void
  onContinueClicked: (selectedItems: DebtItem[]) => void
}

export default function DebtSelectionView({
  debtItems,
  selectedItemIds,
  onSelectedItemIdsChange,
  onContinueClicked,
}: DebtSelectionViewProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterMode, setFilterMode] = useState<FilterMode>("all")
  const [viewMode, setViewMode] = useState<ViewMode>("item")
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false)
  const [modeDropdownOpen, setModeDropdownOpen] = useState(false)

  // Filter items based on search and filter mode
  const filteredItems = useMemo(() => {
    let filtered = debtItems

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (item) =>
          item.description.toLowerCase().includes(query) ||
          item.recipientName.toLowerCase().includes(query) ||
          item.groupName.toLowerCase().includes(query)
      )
    }

    // Mode filter
    if (filterMode === "group") {
      // In future: could add group selection UI
    } else if (filterMode === "person") {
      // In future: could add person selection UI
    }

    return filtered
  }, [debtItems, searchQuery, filterMode])

  // Calculate total of selected items
  const selectedTotal = useMemo(() => {
    return debtItems
      .filter((item) => selectedItemIds.includes(item.id))
      .reduce((sum, item) => sum + item.amount, 0)
  }, [debtItems, selectedItemIds])

  // Get selected items as objects
  const selectedItems = useMemo(() => {
    return debtItems.filter((item) => selectedItemIds.includes(item.id))
  }, [debtItems, selectedItemIds])

  // Toggle item selection
  const handleItemToggle = (itemId: string) => {
    onSelectedItemIdsChange(
      selectedItemIds.includes(itemId)
        ? selectedItemIds.filter((id) => id !== itemId)
        : [...selectedItemIds, itemId]
    )
  }

  // Cluster View: Group items by recipient person
  const clusterByRecipient = useMemo(() => {
    const map: Record<
      string,
      {
        recipientId: string
        recipientName: string
        recipientAvatar?: string
        items: DebtItem[]
        totalDebt: number
      }
    > = {}

    filteredItems.forEach((item) => {
      if (!map[item.recipientId]) {
        map[item.recipientId] = {
          recipientId: item.recipientId,
          recipientName: item.recipientName,
          recipientAvatar: item.recipientAvatar,
          items: [],
          totalDebt: 0,
        }
      }
      map[item.recipientId].items.push(item)
      map[item.recipientId].totalDebt += item.amount
    })

    return Object.values(map)
  }, [filteredItems])

  // Check if all items in a cluster are selected
  const isClusterFullySelected = (cluster: (typeof clusterByRecipient)[0]) => {
    return cluster.items.every((item) => selectedItemIds.includes(item.id))
  }

  // Check if any item in a cluster is selected
  const isClusterPartiallySelected = (
    cluster: (typeof clusterByRecipient)[0]
  ) => {
    return cluster.items.some((item) => selectedItemIds.includes(item.id))
  }

  // Toggle entire cluster selection
  const handleClusterToggle = (cluster: (typeof clusterByRecipient)[0]) => {
    const clusterItemIds = cluster.items.map((item) => item.id)
    const isFullySelected = isClusterFullySelected(cluster)

    if (isFullySelected) {
      // Deselect all items in cluster
      onSelectedItemIdsChange(
        selectedItemIds.filter((id) => !clusterItemIds.includes(id))
      )
    } else {
      // Select all items in cluster
      const newIds = new Set(selectedItemIds)
      clusterItemIds.forEach((id) => newIds.add(id))
      onSelectedItemIdsChange(Array.from(newIds))
    }
  }

  return (
    <div className="space-y-6">
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Select Debt Items to Settle</CardTitle>
          <CardDescription>Choose specific items to pay</CardDescription>

          {/* Unified Toolbar */}
          <div className="mt-6 flex flex-col items-center gap-3 md:flex-row">
            {/* Search Input */}
            <div className="relative w-full flex-1 md:w-auto">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search items or people..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filter Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
                className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm font-medium hover:bg-accent"
              >
                Filter:{" "}
                {filterMode === "all"
                  ? "All"
                  : filterMode === "group"
                    ? "By Group"
                    : "By Person"}
                <ChevronDown className="h-4 w-4" />
              </button>
              {filterDropdownOpen && (
                <div className="absolute right-0 z-10 mt-2 w-40 rounded-md border bg-white shadow-lg">
                  {[
                    { value: "all" as const, label: "All Items" },
                    { value: "group" as const, label: "By Group" },
                    { value: "person" as const, label: "By Person" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setFilterMode(option.value)
                        setFilterDropdownOpen(false)
                      }}
                      className={`block w-full px-4 py-2 text-left text-sm hover:bg-gray-100 ${
                        filterMode === option.value
                          ? "bg-blue-50 font-semibold text-blue-600"
                          : ""
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Mode Toggle Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setModeDropdownOpen(!modeDropdownOpen)}
                className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm font-medium hover:bg-accent"
              >
                Mode: {viewMode === "item" ? "Item View" : "Cluster View"}
                <ChevronDown className="h-4 w-4" />
              </button>
              {modeDropdownOpen && (
                <div className="absolute right-0 z-10 mt-2 w-40 rounded-md border bg-white shadow-lg">
                  {[
                    { value: "item" as const, label: "Item View" },
                    { value: "cluster" as const, label: "Cluster View" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setViewMode(option.value)
                        setModeDropdownOpen(false)
                      }}
                      className={`block w-full px-4 py-2 text-left text-sm hover:bg-gray-100 ${
                        viewMode === option.value
                          ? "bg-blue-50 font-semibold text-blue-600"
                          : ""
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* ITEM VIEW */}
          {viewMode === "item" && (
            <div className="space-y-4">
              <div className="overflow-hidden rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-12 text-center">
                        <input
                          type="checkbox"
                          checked={
                            filteredItems.length > 0 &&
                            filteredItems.every((item) =>
                              selectedItemIds.includes(item.id)
                            )
                          }
                          onChange={() => {
                            if (
                              filteredItems.length > 0 &&
                              filteredItems.every((item) =>
                                selectedItemIds.includes(item.id)
                              )
                            ) {
                              // Deselect all filtered
                              onSelectedItemIdsChange(
                                selectedItemIds.filter(
                                  (id) =>
                                    !filteredItems.map((i) => i.id).includes(id)
                                )
                              )
                            } else {
                              // Select all filtered
                              const filteredIds = filteredItems.map((i) => i.id)
                              const newIds = new Set(selectedItemIds)
                              filteredIds.forEach((id) => newIds.add(id))
                              onSelectedItemIdsChange(Array.from(newIds))
                            }
                          }}
                          className="cursor-pointer"
                        />
                      </TableHead>
                      <TableHead>Item</TableHead>
                      <TableHead>Recipient</TableHead>
                      <TableHead>Group</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.length > 0 ? (
                      filteredItems.map((item) => (
                        <TableRow
                          key={item.id}
                          className={
                            selectedItemIds.includes(item.id)
                              ? "bg-blue-50"
                              : "hover:bg-muted/50"
                          }
                        >
                          <TableCell className="text-center">
                            <input
                              type="checkbox"
                              checked={selectedItemIds.includes(item.id)}
                              onChange={() => handleItemToggle(item.id)}
                              className="cursor-pointer"
                            />
                          </TableCell>
                          <TableCell className="font-medium">
                            {item.description || "Expense"}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                {item.recipientAvatar && (
                                  <img
                                    src={item.recipientAvatar}
                                    alt={item.recipientName}
                                  />
                                )}
                              </Avatar>
                              <span className="text-sm">
                                {item.recipientName}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {item.groupName}
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {formatNumberVN(item.amount)} VND
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="py-6 text-center text-muted-foreground"
                        >
                          No items match your search
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* CLUSTER VIEW */}
          {viewMode === "cluster" && (
            <div className="space-y-4">
              <div className="overflow-hidden rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-12 text-center">
                        <input
                          type="checkbox"
                          checked={
                            clusterByRecipient.length > 0 &&
                            clusterByRecipient.every((c) =>
                              isClusterFullySelected(c)
                            )
                          }
                          onChange={() => {
                            if (
                              clusterByRecipient.length > 0 &&
                              clusterByRecipient.every((c) =>
                                isClusterFullySelected(c)
                              )
                            ) {
                              onSelectedItemIdsChange([])
                            } else {
                              const allIds = clusterByRecipient.flatMap((c) =>
                                c.items.map((i) => i.id)
                              )
                              onSelectedItemIdsChange(allIds)
                            }
                          }}
                          className="cursor-pointer"
                        />
                      </TableHead>
                      <TableHead>Recipient</TableHead>
                      <TableHead>Items Count</TableHead>
                      <TableHead className="text-right">Total Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clusterByRecipient.length > 0 ? (
                      clusterByRecipient.map((cluster) => (
                        <TableRow
                          key={cluster.recipientId}
                          className={
                            isClusterFullySelected(cluster)
                              ? "bg-blue-50"
                              : isClusterPartiallySelected(cluster)
                                ? "bg-blue-100/50"
                                : "hover:bg-muted/50"
                          }
                        >
                          <TableCell className="text-center">
                            <input
                              type="checkbox"
                              checked={isClusterFullySelected(cluster)}
                              onChange={() => handleClusterToggle(cluster)}
                              className="cursor-pointer"
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                {cluster.recipientAvatar && (
                                  <img
                                    src={cluster.recipientAvatar}
                                    alt={cluster.recipientName}
                                  />
                                )}
                              </Avatar>
                              <span className="font-medium">
                                {cluster.recipientName}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {cluster.items.length} item
                            {cluster.items.length > 1 ? "s" : ""}
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {formatNumberVN(cluster.totalDebt)} VND
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="py-6 text-center text-muted-foreground"
                        >
                          No clusters match your search
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Continue Button - Sticky at bottom if selected items exist */}
          {selectedItemIds.length > 0 && (
            <div className="sticky bottom-0 flex flex-col items-center justify-between gap-4 rounded-lg border-2 border-blue-200 bg-blue-50 p-4 sm:flex-row">
              <div>
                <p className="text-sm font-semibold text-muted-foreground">
                  Selected: {selectedItemIds.length} item
                  {selectedItemIds.length > 1 ? "s" : ""}
                </p>
                <p className="text-lg font-bold text-blue-900">
                  Total: {formatNumberVN(selectedTotal)} VND
                </p>
              </div>
              <Button
                onClick={() => onContinueClicked(selectedItems)}
                size="lg"
                className="w-full sm:w-auto"
              >
                Continue to Settle
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
