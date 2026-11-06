import ExpenseSplitterDashboard from "@/pages/transaction/components/expense/ExpenseSplitterDashboard"

interface ExpensesTabProps {
  groupId: string
  groupName?: string
  taskId?: string
}

export default function ExpensesTab({ groupId, groupName, taskId }: ExpensesTabProps) {
  const numericGroupId = Number(groupId)

  if (Number.isNaN(numericGroupId) || numericGroupId <= 0) {
    return (
      <div className="py-8 text-center text-sm text-muted-foreground">
        Invalid group ID provided.
      </div>
    )
  }

  return (
    <div className="pt-2">
      <ExpenseSplitterDashboard
        groupId={numericGroupId}
        groupName={groupName}
        taskId={taskId}
      />
    </div>
  )
}
