export interface PageResultResponse<T> {
  items: T[]
  totalItems: number
  totalPages: number
  pageIndex: number
  pageSize: number
}
