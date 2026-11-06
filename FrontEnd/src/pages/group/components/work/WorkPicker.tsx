import { useId, useState } from "react"
import { Input } from "@/components/ui/input"
import { useEvents, useTasks } from "@/hooks/task/useTasks"
import type { TaskSummary } from "@/types/task/Task"
import { QueryState, selectClass, WorkPagination } from "./WorkShared"

type Option = { id: string; title: string }
function Picker({ label, value, onChange, options, search, onSearch, page, onPage, totalPages, loading, error, retry, disabled, emptyLabel }: {
  label: string; value: Option | null; onChange: (value: Option | null) => void
  options: Option[]; search: string; onSearch: (value: string) => void
  page: number; onPage: (page: number) => void; totalPages: number
  loading: boolean; error: unknown; retry: () => void; disabled?: boolean; emptyLabel: string
}) {
  const id = useId()
  const items = value && !options.some(option => String(option.id) === String(value.id)) ? [value, ...options] : options
  return <fieldset disabled={disabled} className="space-y-2 rounded-md border p-3">
    <legend className="px-1 text-sm font-medium">{label}</legend>
    <Input aria-label={`Tìm ${label}`} placeholder="Tìm theo tên…" value={search} maxLength={200} onChange={e => onSearch(e.target.value)} />
    <label htmlFor={id} className="sr-only">{label}</label>
    <select id={id} className={selectClass} value={value?.id ?? ""} onChange={e => onChange(items.find(option => String(option.id) === e.target.value) ?? null)}>
      <option value="">{emptyLabel}</option>
      {items.map(option => <option key={option.id} value={option.id}>{option.title}</option>)}
    </select>
    <QueryState loading={loading} error={error} retry={retry} />
    {!loading && !error && options.length === 0 && <p className="text-sm text-muted-foreground">Không có kết quả.</p>}
    <WorkPagination page={page} totalPages={totalPages} onChange={onPage} busy={loading} />
  </fieldset>
}
export function TaskPicker({ groupId, value, onChange, disabled }: { groupId: number; value: TaskSummary | null; onChange: (value: TaskSummary | null) => void; disabled?: boolean }) {
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const query = useTasks(groupId, { pageIndex: page, pageSize: 20, search: search.trim(), linkable: true })
  return <Picker label="Công việc liên quan — không bắt buộc" emptyLabel="Không liên kết công việc" value={value} disabled={disabled}
    onChange={option => onChange(option ? query.data?.items.find(item => String(item.id) === String(option.id)) ?? value : null)}
    options={query.data?.items ?? []} search={search} onSearch={text => { setSearch(text); setPage(1) }} page={page} onPage={setPage}
    totalPages={query.data?.totalPages ?? 0} loading={query.isFetching} error={query.error} retry={() => void query.refetch()} />
}
export function EventPicker({ groupId, value, onChange, disabled }: { groupId: number; value: Option | null; onChange: (value: Option | null) => void; disabled?: boolean }) {
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const query = useEvents(groupId, { pageIndex: page, pageSize: 20, search: search.trim() })
  return <Picker label="Sự kiện" emptyLabel="Không thuộc sự kiện" value={value} onChange={onChange} disabled={disabled}
    options={query.data?.items ?? []} search={search} onSearch={text => { setSearch(text); setPage(1) }} page={page} onPage={setPage}
    totalPages={query.data?.totalPages ?? 0} loading={query.isFetching} error={query.error} retry={() => void query.refetch()} />
}
