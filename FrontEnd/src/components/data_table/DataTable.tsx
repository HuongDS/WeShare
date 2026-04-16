import { useState, useRef, useLayoutEffect } from "react"
import { useMemo } from "react"
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type ColumnFiltersState,
  type PaginationState,
  type VisibilityState,
  type SortingState,
  type ColumnDef,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, ChevronLeft, ChevronRight, Loader } from "lucide-react"
import "animate.css"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationEllipsis,
} from "@/components/ui/pagination"

import { cn } from "@/lib/utils"
import { usePagination } from "@/hooks/usePagination"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  isLoading?: boolean
  isFetching?: boolean
  // PAGINATION
  pageIndex?: number
  pageSize?: number
  totalPage?: number
  onPageChange?: (pageIndex: number) => void
  onPageSizeChange?: (pageSize: number) => void
  manualPagination?: boolean
  // SEARCH
  isSearch?: boolean
  manualSearch?: boolean
  searchValue?: string[]
  onSearchChange?: (search: string) => void
  //SORTED
  sorting?: SortingState
  onSortingChange?: (sorting: SortingState) => void
  manualSorting?: boolean
  // ACTION
  headerActions?: React.ReactNode
  // FACET FILTER
  facetedFilters?: React.ReactNode
  // Row click
  onRowClick?: (row: TData) => void
  // SELECTION
  rowSelection?: Record<string, boolean>
  onRowSelectionChange?: (selection: Record<string, boolean>) => void
}

export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading,
  isFetching,
  //PAGINATION
  pageIndex,
  pageSize,
  totalPage,
  onPageChange,
  onPageSizeChange,
  manualPagination = false,
  //SEARCH
  isSearch = false,
  searchValue = [],
  onSearchChange,
  manualSearch = false,
  //SORTED
  sorting,
  onSortingChange,
  manualSorting = false,
  // ACTION
  headerActions,
  // FACED FILTER
  facetedFilters,
  // row click
  onRowClick,
  // SELECTION
  rowSelection,
  onRowSelectionChange,
}: DataTableProps<TData, TValue>) {
  /** ------------------ SEARCH DATA ------------------ */
  const [searchText, setSearchText] = useState("")
  const filteredData = useMemo(() => {
    if (manualSearch) return data // if manualSearch is true, return data as is
    if (!searchText) return data // if searchText is empty, return data as is

    // if searchText is not empty, filter data
    // searchText is string[]
    // example: searchText = ["firstName", "lastName"]
    return data.filter((item) =>
      searchValue.some((key) =>
        String(item[key as keyof TData] ?? "")
          .toLowerCase()
          .includes(searchText.toLowerCase())
      )
    )
  }, [data, searchText, manualSearch, searchValue])

  /** ------------------ AUTO RESIZE PAGESIZE based on the container height ------------------ */
  // Create a ref to access the table container DOM element
  const tableContainerRef = useRef<HTMLDivElement>(null)

  // Run after layout to measure the container element
  useLayoutEffect(() => {
    // Get the table container element
    const el = tableContainerRef.current
    if (!el) return

    // MIN_ROWS of table
    const MIN_ROWS = 10
    const rowHeight = 48
    const headerHeight = 48
    // Observe changes in the container size
    const observer = new ResizeObserver(() => {
      const containerHeight = el.clientHeight
      const usableHeight = containerHeight - headerHeight
      const newSize = Math.max(
        1,
        Math.floor(usableHeight / rowHeight),
        MIN_ROWS
      )
      let pageSizeChanged = false
      // Update pagination state with new page size
      setPagination((prev) => {
        if (prev.pageSize === newSize) return prev // prevent re-render loop
        pageSizeChanged = true
        return { ...prev, pageSize: newSize }
      })
      if (pageSizeChanged && onPageSizeChange) onPageSizeChange(newSize)
    })

    observer.observe(el)
    // Cleanup: stop observing when the component unmounts to prevent memory leaks
    return () => observer.disconnect()
  }, [onPageSizeChange])

  /** ------------------ PAGINATION, FILTER, SELECTION, VISIBILITY STATE ------------------ */
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: pageIndex ?? 0,
    pageSize: pageSize ?? 10,
  })
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [internalRowSelection, setInternalRowSelection] = useState<
    Record<string, boolean>
  >({})
  const rowSelectionState = rowSelection ?? internalRowSelection
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  // internal sorting state when consumer does not control sorting
  const [internalSorting, setInternalSorting] = useState<SortingState>([])
  const sortingState = sorting ?? internalSorting

  /** ------------------ REACT TABLE ------------------ */
  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      columnFilters,
      rowSelection: rowSelectionState,
      pagination,
      columnVisibility,
      ...(sorting ? { sorting } : { sorting: sortingState }),
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: (updater) => {
      const next =
        typeof updater === "function" ? updater(rowSelectionState) : updater

      if (onRowSelectionChange) {
        onRowSelectionChange(next)
      } else {
        setInternalRowSelection(next)
      }
    },

    onColumnVisibilityChange: setColumnVisibility,
    enableColumnResizing: true,
    columnResizeMode: "onChange",
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: manualPagination,
    pageCount: totalPage, // when using manualPagination
    // Handle pagination change - manualPagination = false
    onPaginationChange: (updater) => {
      const next = typeof updater === "function" ? updater(pagination) : updater
      setPagination(next)
      const pageIndexChanged = next.pageIndex !== pagination.pageIndex
      const pageSizeChanged = next.pageSize !== pagination.pageSize

      if (pageIndexChanged && onPageChange) onPageChange(next.pageIndex)
      if (pageSizeChanged && onPageSizeChange) onPageSizeChange(next.pageSize)
      if (onSearchChange) onSearchChange(searchText)
    },
    // Handle sorting change - manualSorting = false
    ...(manualSorting ? {} : { getSortedRowModel: getSortedRowModel() }),
    manualSorting: manualSorting,
    onSortingChange: (updaterOrValue) => {
      if (onSortingChange) {
        if (typeof updaterOrValue === "function") {
          onSortingChange(updaterOrValue(sorting ?? []))
        } else {
          onSortingChange(updaterOrValue)
        }
      } else {
        // update internal sorting state
        if (typeof updaterOrValue === "function") {
          setInternalSorting((prev) => updaterOrValue(prev))
        } else {
          setInternalSorting(updaterOrValue)
        }
      }
    },
  })

  // Search handler: update, reset page
  const handleSearchInput = (value: string) => {
    setSearchText(value)
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
    if (onSearchChange) onSearchChange(value)
  }

  /* ---------- PAGINATION UI ---------- */
  const { pages, showLeftEllipsis, showRightEllipsis } = usePagination({
    currentPage: table.getState().pagination.pageIndex + 1,
    totalPages: table.getPageCount(),
    paginationItemsToDisplay: 5,
  })

  return (
    <div className="font-inter grid h-full grid-rows-[auto_1fr_auto] gap-4">
      {/* --- TABLE ACTIONS --- */}
      <div
        className={cn(
          "grid w-full grid-cols-1 gap-2",
          headerActions ? "lg:grid-cols-[1fr_auto]" : "lg:grid-cols-1"
        )}
      >
        <div
          className={cn("flex w-full flex-col items-center gap-2 lg:flex-row")}
        >
          {isSearch && (
            <div className="relative w-full lg:w-105">
              <Search
                size={16}
                className="absolute top-2.5 left-2 text-muted-foreground"
              />
              <Input
                placeholder="Search value..."
                value={searchText}
                onChange={(e) => handleSearchInput(e.target.value)}
                className="w-full pl-8"
              />
            </div>
          )}

          {/* Faceted filters */}
          {facetedFilters && (
            <div className={cn(!headerActions && "lg:ml-1")}>
              {facetedFilters}
            </div>
          )}
        </div>

        {/* Right: header actions */}
        <div className="flex flex-col justify-end gap-2 lg:flex-row">
          {headerActions}
        </div>
      </div>

      {/* --- TABLE --- */}
      <div
        className="flex h-full w-full table-auto flex-col overflow-x-auto rounded-md border bg-card text-foreground"
        ref={tableContainerRef}
      >
        <Table>
          {/*--- HEADER ---*/}
          <TableHeader className="sticky top-0 z-10 bg-background shadow-xs">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      style={{ position: "relative", width: header.getSize() }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      {header.column.getCanResize() && (
                        <div
                          onMouseDown={header.getResizeHandler()}
                          onTouchStart={header.getResizeHandler()}
                          className={`resizer ${header.column.getIsResizing() ? "isResizing" : ""}`}
                        ></div>
                      )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>

          {/*--- BODY ---*/}
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="w-full odd:bg-accent even:bg-background"
                  onClick={(e) => {
                    try {
                      const target = e.target as HTMLElement | null
                      // ignore clicks on interactive elements inside the row
                      if (target && target.closest("button, a, input, label"))
                        return
                    } catch (err) {
                      // ignore
                      console.warn("Error checking click target:", err)
                    }
                    if (onRowClick) onRowClick(row.original as TData)
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : isLoading || isFetching ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24">
                  <Loader className="mx-auto animate-spin text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* --- ROWS SELECTED ---*/}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        {/* LEFT: selected rows */}
        {table.getAllColumns().some((col) => col.id === "select") && (
          <div className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">
              {table.getSelectedRowModel().rows.length}
            </span>{" "}
            of{" "}
            <span className="font-medium text-foreground">
              {table.getFilteredRowModel().rows.length}
            </span>{" "}
            rows selected
          </div>
        )}

        {/* RIGHT: pagination */}
        <div className="flex flex-col items-end gap-5 sm:flex-row sm:items-center">
          {/* Page info */}
          <div
            className="text-sm whitespace-nowrap text-muted-foreground"
            aria-live="polite"
          >
            Page{" "}
            <span className="font-medium text-foreground">
              {table.getState().pagination.pageIndex + 1}
            </span>{" "}
            of{" "}
            <span className="font-medium text-foreground">
              {table.getPageCount()}
            </span>
          </div>

          {/* Pagination buttons */}
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  <ChevronLeft />
                </Button>
              </PaginationItem>

              {showLeftEllipsis && <PaginationEllipsis />}

              {pages.map((p) => (
                <PaginationItem key={p}>
                  <Button
                    size="icon"
                    variant={
                      p === table.getState().pagination.pageIndex + 1
                        ? "outline"
                        : "ghost"
                    }
                    onClick={() => table.setPageIndex(p - 1)}
                  >
                    {p}
                  </Button>
                </PaginationItem>
              ))}

              {showRightEllipsis && <PaginationEllipsis />}

              <PaginationItem>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  <ChevronRight />
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  )
}
