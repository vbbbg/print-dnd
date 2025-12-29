import { useState, useCallback } from 'react'
import { EditorState, TableColumn } from '../types/editor'

export const useColumnResize = (
  setEditorState: React.Dispatch<React.SetStateAction<EditorState>>
) => {
  const [resizingColIndex, setResizingColIndex] = useState<number | null>(null)
  const [startX, setStartX] = useState<number>(0)
  const [startWidths, setStartWidths] = useState<number[]>([])
  const [minWidths, setMinWidths] = useState<{ left: number; right: number }>({
    left: 8,
    right: 8,
  })

  // Helper to get body/table columns
  const getBodyCols = (state: EditorState) => {
    const region = state.regions.find((r) => r.id === 'body')
    if (region && region.type === 'table' && region.data && region.data.cols) {
      return region.data.cols
    }
    return []
  }

  const handleColumnResizeStart = useCallback(
    (
      index: number,
      e: React.MouseEvent,
      minWidthLeft: number = 8,
      minWidthRight: number = 8
    ) => {
      e.preventDefault()
      e.stopPropagation()

      setResizingColIndex(index)
      setStartX(e.clientX)
      setMinWidths({ left: minWidthLeft, right: minWidthRight })

      // Capture current widths of all visible columns to use as base
      setEditorState((prevState) => {
        const cols = getBodyCols(prevState)
        const visibleCols = cols.filter((c: TableColumn) => c.visible !== false)
        const widths = visibleCols.map((c: TableColumn) => c.width)
        setStartWidths(widths)
        return prevState
      })
    },
    [setEditorState]
  )

  const handleColumnResizeMove = useCallback(
    (e: MouseEvent, currentState: EditorState) => {
      if (resizingColIndex === null) return

      // Find the visible columns again to match index
      const visibleColIndices: number[] = []
      const cols = getBodyCols(currentState)

      cols.forEach((col: TableColumn, idx: number) => {
        if (col.visible !== false) visibleColIndices.push(idx)
      })

      // The resizing column is the one at visibleColIndices[resizingColIndex]
      // The next column is visibleColIndices[resizingColIndex + 1]
      const leftColIdx = visibleColIndices[resizingColIndex]
      const rightColIdx = visibleColIndices[resizingColIndex + 1]

      if (leftColIdx === undefined || rightColIdx === undefined) return

      const deltaX = e.clientX - startX

      // Sensitivity factor
      const sensitivity = 0.2
      const deltaUnits = deltaX * sensitivity

      // Check limits using dynamic min widths
      let validDelta = deltaUnits

      if (startWidths[resizingColIndex] + validDelta < minWidths.left) {
        validDelta = minWidths.left - startWidths[resizingColIndex]
      }
      if (startWidths[resizingColIndex + 1] - validDelta < minWidths.right) {
        validDelta = startWidths[resizingColIndex + 1] - minWidths.right
      }

      const newLeftWidth = startWidths[resizingColIndex] + validDelta
      const newRightWidth = startWidths[resizingColIndex + 1] - validDelta

      // Update state
      setEditorState((prev) => {
        const bodyRegionIdx = prev.regions.findIndex((r) => r.id === 'body')
        if (bodyRegionIdx === -1) return prev
        const bodyRegion = prev.regions[bodyRegionIdx]
        if (!bodyRegion.data) return prev

        const newCols = [...(bodyRegion.data.cols || [])]

        if (newCols[leftColIdx])
          newCols[leftColIdx] = { ...newCols[leftColIdx], width: newLeftWidth }
        if (newCols[rightColIdx])
          newCols[rightColIdx] = {
            ...newCols[rightColIdx],
            width: newRightWidth,
          }

        const newRegions = [...prev.regions]
        newRegions[bodyRegionIdx] = {
          ...bodyRegion,
          data: {
            ...bodyRegion.data,
            cols: newCols,
          },
        }

        return {
          ...prev,
          regions: newRegions,
        }
      })
    },
    [resizingColIndex, startX, startWidths, setEditorState]
  )

  const handleColumnResizeEnd = useCallback(() => {
    setResizingColIndex(null)
    setStartX(0)
    setStartWidths([])
  }, [])

  return {
    handleColumnResizeStart,
    handleColumnResizeMove,
    handleColumnResizeEnd,
    resizingColIndex,
  }
}
