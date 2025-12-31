import { useState, useCallback } from 'react'
import { EditorState, Guide } from '../types/editor'
import { SCALE } from '../constants/units'
import { PhysicsEngine } from '../core/PhysicsEngine'

interface DragState {
  index: number
  region: string
  initialItemX: number
  initialItemY: number
  startX: number
  startY: number
}

export const useItemDrag = (
  onUpdateState: (updater: (prev: EditorState) => EditorState) => void
) => {
  const [dragItem, setDragItem] = useState<DragState | null>(null)
  const [guides, setGuides] = useState<Guide[]>([])

  const handleDragStart = useCallback(
    (index: number, regionId: string, itemX: number, itemY: number) => {
      setDragItem({
        index,
        region: regionId,
        initialItemX: itemX,
        initialItemY: itemY,
        startX: itemX,
        startY: itemY,
      })
    },
    []
  )

  const handleDragMove = useCallback(
    (deltaX: number, deltaY: number) => {
      if (!dragItem) return

      const mmDeltaX = deltaX / SCALE
      const mmDeltaY = deltaY / SCALE

      let calculatedGuides: Guide[] = []

      onUpdateState((prev) => {
        const newState = { ...prev }

        const regionIndex = newState.regions.findIndex(
          (r) => r.id === dragItem.region
        )
        if (regionIndex === -1) return prev

        const region = newState.regions[regionIndex]
        if (!Array.isArray(region.data)) return prev

        const items = [...region.data]

        if (items[dragItem.index]) {
          const item = { ...items[dragItem.index] }

          // TODO: PhysicsEngine needs update to accept generic regions
          const snapData = PhysicsEngine.getSnapLines(
            prev,
            dragItem.index,
            dragItem.region
          )

          // TODO: PhysicsEngine.calculateItemPosition needs update
          // For now, we will assume bodyTop/footerTop are derived or we pass 0 for now until PhysicsEngine is updated
          const {
            x: newX,
            y: newY,
            guides: newGuides,
          } = PhysicsEngine.calculateItemPosition(
            item,
            mmDeltaX,
            mmDeltaY,
            dragItem.initialItemX,
            dragItem.initialItemY,
            prev.paperWidth,
            prev.paperHeight,
            0, // Temporary: bodyTop replacement
            0, // Temporary: footerTop replacement
            false,
            snapData,
            prev.margins
          )

          item.x = newX
          item.y = newY

          calculatedGuides = newGuides

          items[dragItem.index] = item

          newState.regions = [...prev.regions]
          newState.regions[regionIndex] = { ...region, data: items }
        }

        return newState
      })

      setGuides(calculatedGuides)
    },
    [dragItem, onUpdateState]
  )

  const handleDragEnd = useCallback(() => {
    setDragItem(null)
    setGuides([])
    // Optionally trigger a final "snap" or constraint check here if needed
    // But for now, just clearing state is fine.
    // If strict constraints are needed on drop, we could do one last update.
  }, [])

  return {
    handleDragStart,
    handleDragMove,
    handleDragEnd,
    dragItem,
    guides,
  }
}
