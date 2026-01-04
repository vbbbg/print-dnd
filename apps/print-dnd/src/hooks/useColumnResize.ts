import { useCallback } from 'react'
import { EditorState, TableColumn } from '../types/editor'

export const useColumnResize = (
  setEditorState: React.Dispatch<React.SetStateAction<EditorState>>
) => {
  const handleColumnResizeMove = useCallback(
    (
      colIndex: number,
      deltaX: number,
      initialWidths: { left: number; right: number },
      minWidths: { left: number; right: number }
    ) => {
      // Sensitivity factor (keeping consistent with previous logic, or maybe 1:1 for DnD)
      // DnD delta is 1:1 pixels usually. Previous logic had 0.2 sensitivity.
      // If DnD delta is raw pixels, we might want to keep it 1:1 or apply scaling.
      // Let's assume 1:1 mapping for direct manipulation feel.
      const sensitivity = 0.5 // Adjust as needed
      const deltaUnits = deltaX * sensitivity

      const { left: startLeft, right: startRight } = initialWidths
      const { left: minLeft, right: minRight } = minWidths

      let validDelta = deltaUnits

      // Check constraints
      if (startLeft + validDelta < minLeft) {
        validDelta = minLeft - startLeft
      }
      if (startRight - validDelta < minRight) {
        validDelta = startRight - minRight
      }

      const newLeftWidth = startLeft + validDelta
      const newRightWidth = startRight - validDelta

      setEditorState((prev) => {
        // Find visible columns to map index correctly
        const bodyRegionIdx = prev.regions.findIndex((r) => r.id === 'body')
        if (bodyRegionIdx === -1) return prev
        const bodyRegion = prev.regions[bodyRegionIdx]
        if (!bodyRegion.data || !bodyRegion.data.cols) return prev

        const cols = bodyRegion.data.cols
        const visibleColsIndices: number[] = []
        cols.forEach((col: TableColumn, idx: number) => {
          if (col.visible !== false) visibleColsIndices.push(idx)
        })

        const leftColRealIdx = visibleColsIndices[colIndex]
        const rightColRealIdx = visibleColsIndices[colIndex + 1]

        if (leftColRealIdx === undefined || rightColRealIdx === undefined)
          return prev

        const newCols = [...cols]
        newCols[leftColRealIdx] = {
          ...newCols[leftColRealIdx],
          width: newLeftWidth,
        }
        newCols[rightColRealIdx] = {
          ...newCols[rightColRealIdx],
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
    [setEditorState]
  )

  return {
    handleColumnResizeMove,
  }
}
