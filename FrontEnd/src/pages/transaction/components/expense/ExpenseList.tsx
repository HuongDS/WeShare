import { Receipt } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { TransactionViewDto } from "@/types/transaction/TransactionViewDto"
import ExpenseCard from "./ExpenseCard"

interface ExpenseListProps {
  expenses: TransactionViewDto[]
  isLoading: boolean
  onCreate: () => void
}

const skeletonItems = Array.from({ length: 6 }, (_, index) => index)

export default function ExpenseList({
  expenses,
  isLoading,
  onCreate,
}: ExpenseListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {skeletonItems.map((item) => (
          <div
            key={item}
            className="space-y-4 rounded-3xl border border-border/60 bg-card p-6"
          >
            <div className="h-4 w-24 animate-pulse rounded-full bg-muted" />
            <div className="h-6 w-32 animate-pulse rounded-full bg-muted" />
            <div className="h-4 w-full animate-pulse rounded-full bg-muted" />
            <div className="h-4 w-2/3 animate-pulse rounded-full bg-muted" />
          </div>
        ))}
      </div>
    )
  }

  if (!expenses.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-border bg-card px-6 py-12 text-center">
        <div className="rounded-full bg-muted p-4">
          <Receipt className="h-6 w-6 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-foreground">
            No expenses yet
          </h3>
          <p className="text-sm text-muted-foreground">
            Create your first expense to get started.
          </p>
        </div>
        <Button size="sm" className="mt-2" onClick={onCreate}>
          Add Expense
        </Button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {expenses.map((expense) => (
        <ExpenseCard key={expense.id} expense={expense} />
      ))}
    </div>
  )
}
