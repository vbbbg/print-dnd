import { useState, useCallback } from 'react'
import { EditorState } from '../types/editor'

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
        const visibleCols = prevState.bodyItems.cols.filter(
          (c) => c.visible !== false
        )
        const widths = visibleCols.map((c) => c.width)
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
      currentState.bodyItems.cols.forEach((col, idx) => {
        if (col.visible !== false) visibleColIndices.push(idx)
      })

      // The resizing column is the one at visibleColIndices[resizingColIndex]
      // The next column is visibleColIndices[resizingColIndex + 1]
      const leftColIdx = visibleColIndices[resizingColIndex]
      const rightColIdx = visibleColIndices[resizingColIndex + 1]

      if (leftColIdx === undefined || rightColIdx === undefined) return

      const deltaX = e.clientX - startX

      // Calculate delta in "width units" approximate
      // Since widths are generic units, we need a scale factor.
      // Ideally we map pixels to these units.
      // For now, let's assume 1 unit ~= 1mm ~= 3.78px (approx) or simpler:
      // Just scale by zoom? Or relative to table width?
      // Simple approach: Use a sensitivity factor, e.g. 0.5 unit per pixel
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
        const newCols = [...prev.bodyItems.cols]
        newCols[leftColIdx] = { ...newCols[leftColIdx], width: newLeftWidth }
        newCols[rightColIdx] = { ...newCols[rightColIdx], width: newRightWidth }

        return {
          ...prev,
          bodyItems: {
            ...prev.bodyItems,
            cols: newCols,
          },
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
