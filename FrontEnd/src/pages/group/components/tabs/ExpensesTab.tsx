import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useGetTransactions } from "@/hooks/transaction/useTransaction"
import ExpenseList from "@/pages/transaction/components/expense/ExpenseList"
import AddExpenseModal from "@/pages/transaction/components/expense/AddExpenseModal_v4"

interface ExpensesTabProps {
  groupId: string
}

export default function ExpensesTab({ groupId }: ExpensesTabProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 6
  const numericGroupId = Number(groupId)

  const { getTransactionsByGroupId } = useGetTransactions(
    PAGE_SIZE,
    page,
    Number.isNaN(numericGroupId) ? undefined : numericGroupId
  )

  const isLoading = getTransactionsByGroupId.isLoading
  const isFetching = getTransactionsByGroupId.isFetching
  const pageResult = getTransactionsByGroupId.data?.data
  const transactions = pageResult?.items || []
  const totalPages = pageResult?.totalPages || 0

  return (
    <div className="space-y-4 pt-4">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Expenses</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Track and manage this group's expenses.
          </p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          size="default"
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Expense
        </Button>
      </div>

      <ExpenseList
        expenses={transactions}
        isLoading={isLoading}
        onCreate={() => setIsModalOpen(true)}
      />

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between border-t pt-4">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1 || isFetching}
              onClick={() => setPage((old) => Math.max(1, old - 1))}
            >
              Previous
            </Button>
          </div>

          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages || isFetching}
              onClick={() => setPage((old) => old + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <AddExpenseModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        groupId={groupId}
        onSuccess={() => {
          setIsModalOpen(false)
          getTransactionsByGroupId.refetch()
        }}
      />
    </div>
  )
}
