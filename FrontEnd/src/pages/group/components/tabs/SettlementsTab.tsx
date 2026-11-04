import { useState } from "react"
import SettlementDetailsView from "@/pages/group/components/tabs/SettlementDetailsView"
import SettlementsTable, {
  type SettlementDebtDetails,
} from "@/pages/group/components/tabs/SettlementsTable"

interface SettlementsTabProps {
  groupId: number
}

export default function SettlementsTab({ groupId }: SettlementsTabProps) {
  const [selectedDebt, setSelectedDebt] =
    useState<SettlementDebtDetails | null>(null)

  if (selectedDebt) {
    return (
      <SettlementDetailsView
        key={selectedDebt.payerId}
        groupId={groupId}
        debtData={selectedDebt}
        onBack={() => setSelectedDebt(null)}
      />
    )
  }

  return <SettlementsTable groupId={groupId} onViewDetails={setSelectedDebt} />
}
