import { useMemo, useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { HandshakeIcon, HistoryIcon } from "lucide-react"
import DebtSelectionView from "@/pages/transaction/components/settlement/DebtSelectionView"
import SettlementHistoryTable from "@/pages/transaction/components/settlement/SettlementHistoryTable"
import SettlementForm from "@/pages/transaction/components/settlement/SettlementForm"
import { useGetTransactions } from "@/hooks/transaction/useTransaction"
import type { TransactionViewDto } from "@/types/transaction/TransactionViewDto"
import type { DebtItem } from "@/types/transaction/DebtItem"
import { Dialog, DialogContent } from "@/components/ui/dialog"

interface SettlementsTabProps {
  groupId: number
}

const formatNumberVN = (value: number): string => {
  return value.toLocaleString("de-DE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })
}

export default function SettlementsTab({ groupId }: SettlementsTabProps) {
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([])
  const [showFormModal, setShowFormModal] = useState(false)

  const { getTransactionsByGroupId } = useGetTransactions(100, 0, groupId)

  const transactionData = getTransactionsByGroupId.data?.data?.items || []

  const debtItems = useMemo(() => {
    const items: DebtItem[] = []

    transactionData.forEach((tx: TransactionViewDto) => {
      const groupName = `Group ${tx.groupId}`

      tx.transactionSplits?.forEach((split) => {
        const debtItem: DebtItem = {
          id: `tx:${tx.id}:debtor:${split.debtor.id}`,
          transactionId: tx.id,
          description: tx.description || "",
          amount: split.owedAmount,
          recipientId: split.debtor.id,
          recipientName: split.debtor.fullName,
          recipientAvatar: split.debtor.avatar,
          groupId: tx.groupId,
          groupName,
        }
        items.push(debtItem)
      })
    })

    return items
  }, [transactionData])

  const selectedDebtItems = useMemo(() => {
    return debtItems.filter((item) => selectedItemIds.includes(item.id))
  }, [debtItems, selectedItemIds])

  const totalDebt = useMemo(() => {
    return debtItems.reduce((sum, item) => sum + item.amount, 0)
  }, [debtItems])

  const handleContinueClicked = () => {
    setShowFormModal(true)
  }

  return (
    <div className="space-y-6 pt-4">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Settlements</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Settle debts inside this group and track payment records.
          </p>
        </div>
        <Card className="border-2 border-green-200 bg-green-50 md:w-fit">
          <CardContent>
            <div className="flex flex-col items-end">
              <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Total Owed
              </p>
              <div className="flex items-baseline">
                <span className="text-2xl font-bold text-green-800">
                  {formatNumberVN(totalDebt)}
                </span>
                <span className="text-sm font-semibold text-muted-foreground">
                  VND
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="settle" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="settle" className="gap-2">
            <HandshakeIcon className="h-4 w-4" />
            Settle Debt
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <HistoryIcon className="h-4 w-4" />
            Settlement History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="settle" className="space-y-6">
          <DebtSelectionView
            debtItems={debtItems}
            selectedItemIds={selectedItemIds}
            onSelectedItemIdsChange={setSelectedItemIds}
            onContinueClicked={handleContinueClicked}
          />
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Past Settlements</CardTitle>
              <CardDescription>
                View all settlement transactions in this group
              </CardDescription>
            </CardHeader>
            <CardContent>
              {transactionData.length > 0 ? (
                <SettlementHistoryTable data={transactionData} />
              ) : (
                <div className="flex h-32 items-center justify-center text-center">
                  <div>
                    <HistoryIcon className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">
                      No settlement history yet
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showFormModal} onOpenChange={setShowFormModal}>
        <DialogContent className="max-w-[95vw] p-0 md:max-w-3xl lg:max-w-225">
          <div className="border-b bg-linear-to-r from-blue-50 to-indigo-50 px-6 py-4">
            <h2 className="text-2xl font-bold">Complete Settlement</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Review and record your payment
            </p>
          </div>
          <div className="max-h-[75vh] overflow-y-auto p-4 md:p-6">
            <SettlementForm
              selectedDebtItems={selectedDebtItems}
              onSuccess={() => {
                setShowFormModal(false)
                setSelectedItemIds([])
                getTransactionsByGroupId.refetch()
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
