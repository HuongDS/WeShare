import "@tanstack/react-table"

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData, TValue> {
    title?: string
    filterOptions?: Array<{ label: string; value: string }> | string[]
    labelOptions?: Record<string, string>
  }
}
