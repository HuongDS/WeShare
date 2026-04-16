import { useState } from "react"
import { motion } from "framer-motion"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useGetTransactions } from "@/hooks/transaction/useTransaction"
import TransactionTable from "./components/TransactionTable"
import AddExpenseModal from "./components/expense/AddExpenseModal_v4"

interface ExpensesPageProps {
  groupId?: number
}

export default function ExpensesPage({ groupId }: ExpensesPageProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [pageIndex, setPageIndex] = useState(0)
  const pageSize = 10

  const { getTransactionsByGroupId } = useGetTransactions(
    pageSize,
    pageIndex,
    groupId
  )

  const isLoading = getTransactionsByGroupId.isLoading
  const transactions = getTransactionsByGroupId.data?.data?.items || []
  const totalPages = getTransactionsByGroupId.data?.data?.totalPages || 0

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mx-auto max-w-6xl"
      >
        {/* Header Section */}
        <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Expenses</h1>
            <p className="mt-2 text-muted-foreground">
              Track and manage your group expenses
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

        {/* Main Content */}
        <Card className="overflow-hidden">
          {transactions.length > 0 ? (
            <div>
              <TransactionTable
                transactions={transactions}
                isLoading={isLoading}
              />

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-border px-6 py-4">
                  <p className="text-sm text-muted-foreground">
                    Page {pageIndex + 1} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pageIndex === 0}
                      onClick={() => setPageIndex(Math.max(0, pageIndex - 1))}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pageIndex >= totalPages - 1}
                      onClick={() => setPageIndex(pageIndex + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
              <div className="mb-4 text-4xl">📋</div>
              <h3 className="text-lg font-semibold text-foreground">
                No Expenses Found
              </h3>
              <p className="mt-2 text-muted-foreground">
                Start by creating your first expense
              </p>
              <Button
                onClick={() => setIsModalOpen(true)}
                variant="default"
                size="sm"
                className="mt-4 gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Expense
              </Button>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Add Expense Modal */}
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
