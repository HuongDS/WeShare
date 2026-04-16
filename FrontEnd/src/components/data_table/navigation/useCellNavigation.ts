import { useTableNavigation } from "./useTableNavigation"

export function useCellNavigation(
  rowIndex: number,
  columnIndex: number
) {
  const { setActiveCell } = useTableNavigation()

  const moveDown = () =>
    setActiveCell({
      rowIndex: rowIndex + 1,
      columnIndex,
    })

  const moveUp = () =>
    setActiveCell({
      rowIndex: rowIndex - 1,
      columnIndex,
    })

  const moveRight = () =>
    setActiveCell({
      rowIndex,
      columnIndex: columnIndex + 1,
    })

  const moveLeft = () =>
    setActiveCell({
      rowIndex,
      columnIndex: columnIndex - 1,
    })

  return {
    moveDown,
    moveUp,
    moveRight,
    moveLeft,
  }
}
