import { useState, useCallback } from 'react'
import { EditorState, Guide } from '../types/editor'
import { SCALE } from '../constants/units'
import { PhysicsEngine } from '../core/PhysicsEngine'

interface DragState {
  index: number
  region: 'title' | 'header' | 'footer'
  initialItemX: number
  initialItemY: number
}

export const useItemDrag = (
  onUpdateState: (updater: (prev: EditorState) => EditorState) => void
) => {
  const [dragItem, setDragItem] = useState<DragState | null>(null)
  const [guides, setGuides] = useState<Guide[]>([])

  const handleDragStart = useCallback(
    (
      index: number,
      region: 'title' | 'header' | 'footer',
      itemX: number,
      itemY: number
    ) => {
      setDragItem({
        index,
        region,
        initialItemX: itemX,
        initialItemY: itemY,
      })
    },
    []
  )

  const handleDragMove = useCallback(
    (deltaX: number, deltaY: number) => {
      if (!dragItem) return

      // Convert delta to paper units
      // Note: react-dnd delta is in pixels, we need to divide by SCALE if SCALE converts px to mm?
      // Wait, SCALE in units.ts is usually 3.78 (px per mm).
      // So delta / SCALE = mm.
      const mmDeltaX = deltaX / SCALE
      const mmDeltaY = deltaY / SCALE

      let calculatedGuides: Guide[] = []

      onUpdateState((prev) => {
        const newState = { ...prev }
        let items: any[] = []

        if (dragItem.region === 'title') items = [...prev.titleItems]
        else if (dragItem.region === 'header') items = [...prev.headerItems]
        else if (dragItem.region === 'footer') items = [...prev.footerItems]

        if (items[dragItem.index]) {
          const item = { ...items[dragItem.index] }

          const snapData = PhysicsEngine.getSnapLines(
            prev,
            dragItem.index,
            dragItem.region
          )

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
            prev.bodyTop,
            prev.footerTop,
            false, // applyBodyConstraint - usually false during drag
            snapData,
            prev.margins
          )

          item.x = newX
          item.y = newY

          calculatedGuides = newGuides

          // Update the array
          items[dragItem.index] = item

          if (dragItem.region === 'title') newState.titleItems = items
          else if (dragItem.region === 'header') newState.headerItems = items
          else if (dragItem.region === 'footer') newState.footerItems = items
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
