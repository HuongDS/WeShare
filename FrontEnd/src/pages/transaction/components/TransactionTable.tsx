import { useMemo, useCallback } from "react"
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table"
import type { CellContext } from "@tanstack/react-table"
import { Trash2, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { DataTable } from "@/components/data_table/DataTable"
import { useDeleteTransaction } from "@/hooks/transaction/useTransaction"
import type { TransactionViewDto } from "@/types/transaction/TransactionViewDto"
import { formatCurrency } from "@/lib/utils"

interface TransactionTableProps {
  transactions: TransactionViewDto[]
  isLoading?: boolean
}

function formatDate(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  })
}

export default function TransactionTable({
  transactions,
  isLoading = false,
}: TransactionTableProps) {
  const { deleteTransaction } = useDeleteTransaction()

  const handleDelete = useCallback(
    (id: number): void => {
      if (confirm("Are you sure you want to delete this transaction?")) {
        deleteTransaction.mutate(id)
      }
    },
    [deleteTransaction]
  )

  // Define columns using createColumnHelper
  const columnHelper = useMemo(
    () => createColumnHelper<TransactionViewDto>(),
    []
  )

  const columns = useMemo<ColumnDef<TransactionViewDto>[]>(
    () => [
      columnHelper.accessor("createdAt", {
        id: "date",
        header: "Date",
        cell: (info: CellContext<TransactionViewDto, Date>) =>
          formatDate(info.getValue()),
        size: 120,
      }) as unknown as ColumnDef<TransactionViewDto>,
      columnHelper.accessor("description", {
        id: "description",
        header: "Description",
        cell: (
          info: CellContext<TransactionViewDto, string | null | undefined>
        ) => info.getValue() || "—",
        size: 200,
      }) as unknown as ColumnDef<TransactionViewDto>,
      columnHelper.display({
        id: "payer",
        header: "Payer",
        cell: (info: CellContext<TransactionViewDto, unknown>) => {
          const payer = info.row.original.payer
          return (
            <div className="flex items-center gap-2">
              <Avatar className="h-7 w-7">
                {payer.avatar && (
                  <AvatarImage src={payer.avatar} alt={payer.fullName} />
                )}
                <AvatarFallback className="text-xs">
                  {payer.fullName
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{payer.fullName}</span>
            </div>
          )
        },
        size: 180,
      }) as unknown as ColumnDef<TransactionViewDto>,
      columnHelper.accessor("amount", {
        id: "amount",
        header: () => <div className="text-right">Amount</div>,
        cell: (info: CellContext<TransactionViewDto, number>) => (
          <div className="text-right">
            <span className="text-sm font-semibold text-primary">
              {formatCurrency(info.getValue())}
            </span>
          </div>
        ),
        size: 120,
      }) as unknown as ColumnDef<TransactionViewDto>,
      columnHelper.display({
        id: "actions",
        header: () => <div className="text-center">Actions</div>,
        cell: (info: CellContext<TransactionViewDto, unknown>) => (
          <div className="flex items-center justify-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0"
              title="View Details"
              disabled={false}
            >
              <Eye className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0"
              onClick={() => handleDelete(info.row.original.id)}
              disabled={deleteTransaction.isPending}
              title="Delete"
            >
              <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
            </Button>
          </div>
        ),
        size: 100,
      }) as unknown as ColumnDef<TransactionViewDto>,
    ],
    [columnHelper, handleDelete, deleteTransaction.isPending]
  )

  return (
    <DataTable
      columns={columns}
      data={transactions}
      isLoading={isLoading}
      isSearch={false}
      manualPagination={false}
    />
  )
}
