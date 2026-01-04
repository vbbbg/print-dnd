import { useCallback } from 'react'
import { EditorState } from '../types/editor'
import { SCALE } from '../constants/units'
import { ResizeDirection } from '../components/ResizeHandles'
import { PhysicsEngine } from '../core/PhysicsEngine'

const MIN_SIZE_MM = 5 // Minimum item size in mm

export const useItemResize = (
  onUpdateState: (updater: (prev: EditorState) => EditorState) => void
) => {
  const handleItemResizeMove = useCallback(
    (
      index: number,
      regionId: string,
      direction: ResizeDirection,
      deltaX: number,
      deltaY: number,
      initialItem: any // contains initialX, initialY, initialWidth, initialHeight
    ) => {
      // Scale delta
      const scaleDeltaX = deltaX / SCALE
      const scaleDeltaY = deltaY / SCALE

      onUpdateState((prev) => {
        const newState = { ...prev }

        const regionIndex = newState.regions.findIndex((r) => r.id === regionId)
        if (regionIndex === -1) return prev
        const region = newState.regions[regionIndex]
        if (!Array.isArray(region.data)) return prev

        const items = [...region.data]
        if (!items[index]) return prev

        // Physics calculation using generic engine
        const {
          x: newX,
          y: newY,
          width: newWidth,
          height: newHeight,
        } = PhysicsEngine.calculateResizedItem(
          initialItem.initialX,
          initialItem.initialY,
          initialItem.initialWidth,
          initialItem.initialHeight,
          scaleDeltaX,
          scaleDeltaY,
          direction,
          MIN_SIZE_MM,
          prev.paperWidth,
          prev.paperHeight,
          prev.margins
        )

        // Update item
        const updatedItem = {
          ...items[index],
          x: newX,
          y: newY,
          width: newWidth,
          height: newHeight,
        }

        items[index] = updatedItem
        newState.regions = [...prev.regions]
        newState.regions[regionIndex] = { ...region, data: items }

        return newState
      })
    },
    [onUpdateState]
  )

  return {
    handleItemResizeMove,
  }
}
