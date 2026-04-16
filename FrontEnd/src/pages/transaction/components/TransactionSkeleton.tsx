export default function TransactionSkeleton() {
  return (
    <div className="flex animate-pulse items-center gap-4 rounded-lg p-4">
      <div className="h-4 w-24 rounded bg-muted" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-full rounded bg-muted" />
        <div className="h-3 w-3/4 rounded bg-muted" />
      </div>
      <div className="h-4 w-20 rounded bg-muted" />
      <div className="h-8 w-16 rounded bg-muted" />
    </div>
  )
}
