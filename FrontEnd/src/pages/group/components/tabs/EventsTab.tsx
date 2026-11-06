import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useEvents } from "@/hooks/task/useTasks"
import EventForm from "../work/EventForm"
import EventDetail from "../work/EventDetail"
import { displayDate, QueryState, useWorkNavigation, WorkPagination } from "../work/WorkShared"

export default function EventsTab({ groupId }: { groupId: number }) {
  const { params, update } = useWorkNavigation()
  const [creating, setCreating] = useState(false)
  const page = Math.max(1, Number(params.get("eventPage")) || 1)
  const search = params.get("eventSearch") ?? ""
  const from = params.get("eventFrom") ?? ""
  const to = params.get("eventTo") ?? ""
  const validDate = (value: string) => !!value && !Number.isNaN(new Date(value).getTime())
  const invalidRange = !!from && !!to && (!validDate(from) || !validDate(to) || new Date(from) >= new Date(to))
  const query = useEvents(groupId, { pageIndex: page, pageSize: 20, search: search.trim(), from: validDate(from) ? new Date(from).toISOString() : undefined, to: validDate(to) ? new Date(to).toISOString() : undefined }, !invalidRange)
  const filter = (values: Record<string, string | null>) => update({ ...values, eventPage: null }, true)
  return <div className="space-y-4 pt-4">
    <div className="flex items-center justify-between gap-3"><h2 className="text-2xl font-bold">Sự kiện</h2><Button onClick={() => setCreating(true)}>Tạo sự kiện</Button></div>
    <div className="grid items-end gap-3 sm:grid-cols-3">
      <label className="space-y-1"><span className="text-sm">Tìm sự kiện</span><Input placeholder="Tìm theo tên…" maxLength={200} value={search} onChange={e => filter({ eventSearch: e.target.value })} /></label>
      <label className="space-y-1"><span className="text-sm">Từ (giờ địa phương)</span><Input type="datetime-local" value={from} onChange={e => filter({ eventFrom: e.target.value })} /></label>
      <label className="space-y-1"><span className="text-sm">Đến (giờ địa phương)</span><Input type="datetime-local" value={to} onChange={e => filter({ eventTo: e.target.value })} /></label>
    </div>
    {invalidRange ? <p role="alert" className="text-destructive">Mốc kết thúc phải sau mốc bắt đầu.</p> : <>
      <QueryState loading={query.isLoading} error={query.error} retry={() => void query.refetch()} />
      {!query.isLoading && !query.error && !query.data?.items.length && <p className="rounded-lg border bg-card p-8 text-center text-muted-foreground">Chưa có sự kiện phù hợp.</p>}
      <div className="grid gap-3 sm:grid-cols-2">
        {!query.error && query.data?.items.map(event => <article key={event.id} className="space-y-2 rounded-xl border bg-card p-4">
          <button className="text-left font-semibold text-primary hover:underline" onClick={() => update({ eventId: event.id })}>{event.title}</button>
          <p className="text-sm text-muted-foreground">{displayDate(event.startsAt)} → {displayDate(event.endsAt)}</p>
          <p className="text-sm">{event.location || "Chưa đặt địa điểm"}</p>
          <p className="text-sm">{event.taskCount ? `${event.completedTaskCount}/${event.taskCount} công việc hoàn thành` : "Chưa có công việc"}</p>
          {event.taskCount > 0 && <progress className="h-2 w-full" aria-label="Tiến độ công việc" value={event.completedTaskCount} max={event.taskCount} />}
        </article>)}
      </div>
      <WorkPagination page={page} totalPages={query.data?.totalPages ?? 0} onChange={next => update({ eventPage: String(next) })} busy={query.isFetching} />
    </>}
    {creating && <EventForm groupId={groupId} onClose={() => setCreating(false)} onSaved={eventId => { setCreating(false); update({ eventId }) }} />}
    {params.get("eventId") && <EventDetail key={params.get("eventId")} groupId={groupId} id={params.get("eventId")!} />}
  </div>
}
