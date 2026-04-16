import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "./DataTable";

interface ClientDataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading?: boolean;
  isFetching?: boolean;

  // SEARCH
  isSearch?: boolean;
  searchValue?: string[];

  // ACTION
  headerActions?: React.ReactNode;
  facetedFilters?: React.ReactNode;

  onRowClick?: (row: TData) => void;
}

export function ClientDataTable<TData, TValue>({
  columns,
  data,
  isLoading,
  isFetching,
  isSearch = false,
  searchValue = [],
  headerActions,
  facetedFilters,
  onRowClick,
}: ClientDataTableProps<TData, TValue>) {
  return (
    <DataTable
      columns={columns}
      data={data}
      isLoading={isLoading}
      isFetching={isFetching}
      // CLIENT MODE
      manualPagination={false}
      manualSearch={false}
      manualSorting={false}
      // SEARCH
      isSearch={isSearch}
      searchValue={searchValue}
      // ACTION
      headerActions={headerActions}
      facetedFilters={facetedFilters}
      onRowClick={onRowClick}
    />
  );
}
