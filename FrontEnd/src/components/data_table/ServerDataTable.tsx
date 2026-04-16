import type {
  ColumnDef,
  SortingState,
} from "@tanstack/react-table";
import { DataTable } from "./DataTable";

interface ServerDataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading?: boolean;
  isFetching?: boolean;

  // PAGINATION
  pageIndex: number;
  pageSize: number;
  totalPage: number;
  onPageChange: (pageIndex: number) => void;
  onPageSizeChange?: (pageSize: number) => void;

  // SEARCH
  isSearch?: boolean;
  onSearchChange?: (search: string) => void;

  // SORTING
  sorting?: SortingState;
  onSortingChange?: (sorting: SortingState) => void;

  // ACTION
  headerActions?: React.ReactNode;
  facetedFilters?: React.ReactNode;

  onRowClick?: (row: TData) => void;
}

export function ServerDataTable<TData, TValue>({
  columns,
  data,
  isLoading,
  isFetching,
  pageIndex,
  pageSize,
  totalPage,
  onPageChange,
  onPageSizeChange,
  isSearch = false,
  onSearchChange,
  sorting,
  onSortingChange,
  headerActions,
  facetedFilters,
  onRowClick,
}: ServerDataTableProps<TData, TValue>) {
  return (
    <DataTable
      columns={columns}
      data={data}
      isLoading={isLoading}
      isFetching={isFetching}
      // SERVER MODE
      manualPagination
      manualSearch
      manualSorting
      pageIndex={pageIndex}
      pageSize={pageSize}
      totalPage={totalPage}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      // SEARCH
      isSearch={isSearch}
      onSearchChange={onSearchChange}
      // SORTING
      sorting={sorting}
      onSortingChange={onSortingChange}
      // ACTION
      headerActions={headerActions}
      facetedFilters={facetedFilters}
      onRowClick={onRowClick}
    />
  );
}
