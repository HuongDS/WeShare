import React, { createContext, useState } from "react"

export interface TableCellPosition {
  rowIndex: number
  columnId?: string
  columnIndex?: number
}

interface TableNavigationContextType {
  activeCell: TableCellPosition | null
  setActiveCell: (cell: TableCellPosition | null) => void
}

export const TableNavigationContext =
  createContext<TableNavigationContextType | null>(null)

export function TableNavigationProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [activeCell, setActiveCell] =
    useState<TableCellPosition | null>(null)

  return (
    <TableNavigationContext.Provider
      value={{
        activeCell,
        setActiveCell,
      }}
    >
      {children}
    </TableNavigationContext.Provider>
  )
}
