import type { ColumnDef } from "@tanstack/react-table"
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Avatar } from "@/components/ui/avatar"
import type { TransactionViewDto } from "@/types/transaction/TransactionViewDto"

// Helper function to format numbers in Vietnamese style
const formatNumberVN = (value: number): string => {
  return value.toLocaleString("de-DE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })
}

interface SettlementHistoryRow {
  id: number
  recipient: {
    id: string
    name: string
    avatar?: string
  }
  amount: number
  date: string
  description?: string | null
}

interface SettlementHistoryTableProps {
  data: TransactionViewDto[]
}

export default function SettlementHistoryTable({
  data,
}: SettlementHistoryTableProps) {
  // Prepare settlement history data
  const settlementHistory: SettlementHistoryRow[] = data.map(
    (tx: TransactionViewDto) => ({
      id: tx.id,
      recipient: {
        id: tx.payer.id,
        name: tx.payer.fullName,
        avatar: tx.payer.avatar,
      },
      amount: tx.amount,
      date: new Date(tx.createdAt).toLocaleDateString("vi-VN"),
      description: tx.description || undefined,
    })
  )

  // Settlement History Table Columns
  const historyColumns: ColumnDef<SettlementHistoryRow>[] = [
    {
      accessorKey: "recipient",
      header: "Recipient",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            {row.original.recipient.avatar && (
              <img
                src={row.original.recipient.avatar}
                alt={row.original.recipient.name}
              />
            )}
          </Avatar>
          <span className="text-sm font-medium">
            {row.original.recipient.name}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => (
        <span className="font-semibold">
          {formatNumberVN(row.original.amount)} VND
        </span>
      ),
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.date}
        </span>
      ),
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => (
        <span className="text-sm">{row.original.description || "-"}</span>
      ),
    },
  ]

  const table = useReactTable({
    data: settlementHistory,
    columns: historyColumns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="w-full overflow-x-auto">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
