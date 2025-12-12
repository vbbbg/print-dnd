import { useState, useEffect, RefObject, useCallback } from 'react'
import { EditorState } from '../types/editor'
import { SCALE } from '../constants/units'

interface DragState {
  index: number
  region: 'title' | 'header' | 'footer'
  startX: number
  startY: number
  initialItemX: number
  initialItemY: number
}

export const useItemDrag = (
  editorRef: RefObject<HTMLDivElement>,
  onUpdateState: (updater: (prev: EditorState) => EditorState) => void
) => {
  const [dragItem, setDragItem] = useState<DragState | null>(null)

  const handleItemDragStart = useCallback(
    (
      index: number,
      region: 'title' | 'header' | 'footer',
      e: React.MouseEvent,
      itemX: number, // current item X
      itemY: number // current item Y
    ) => {
      e.preventDefault()
      e.stopPropagation()

      setDragItem({
        index,
        region,
        startX: e.clientX,
        startY: e.clientY,
        initialItemX: itemX,
        initialItemY: itemY,
      })
    },
    []
  )

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault()
      if (!dragItem || !editorRef.current) return

      const deltaX = (e.clientX - dragItem.startX) / SCALE
      const deltaY = (e.clientY - dragItem.startY) / SCALE

      onUpdateState((prev) => {
        const newState = { ...prev }
        let items: any[] = []

        if (dragItem.region === 'title') items = [...prev.titleItems]
        else if (dragItem.region === 'header') items = [...prev.headerItems]
        else if (dragItem.region === 'footer') items = [...prev.footerItems]

        // 1. Constrain to Paper Bounds
        const constrainToPaperBounds = (
          x: number,
          y: number,
          itemWidth: number,
          itemHeight: number,
          paperWidth: number,
          paperHeight: number
        ) => {
          const newX = Math.max(0, Math.min(x, paperWidth - itemWidth))
          const newY = Math.max(0, Math.min(y, paperHeight - itemHeight))
          return { x: newX, y: newY }
        }

        // 2. Constrain to avoid Body Region (Table)
        // Returns the adjusted Y coordinate
        const constrainToAvoidBody = (
          y: number,
          itemHeight: number,
          bodyTop: number,
          footerTop: number
        ) => {
          const itemBottom = y + itemHeight
          // Check if entering Body Region
          if (y < footerTop && itemBottom > bodyTop) {
            // "Snap to closest edge" logic allows jumping over the body
            const validTopY = bodyTop - itemHeight
            const validBottomY = footerTop

            const distToTop = Math.abs(y - validTopY)
            const distToBottom = Math.abs(y - validBottomY)

            if (distToTop < distToBottom) {
              return validTopY
            } else {
              return validBottomY
            }
          }
          return y
        }

        // Main calculation function
        const calculateItemPosition = (
          item: { width: number; height: number },
          deltaX: number,
          deltaY: number,
          initialX: number,
          initialY: number,
          paperWidth: number,
          paperHeight: number,
          bodyTop: number,
          footerTop: number
        ) => {
          let newX = initialX + deltaX
          let newY = initialY + deltaY

          // 1. Apply Paper Bounds
          const bounded = constrainToPaperBounds(
            newX,
            newY,
            item.width,
            item.height,
            paperWidth,
            paperHeight
          )
          newX = bounded.x
          newY = bounded.y

          // 2. Apply Body Avoidance
          newY = constrainToAvoidBody(newY, item.height, bodyTop, footerTop)

          return { x: newX, y: newY }
        }

        if (items[dragItem.index]) {
          const item = { ...items[dragItem.index] }

          const { x: newX, y: newY } = calculateItemPosition(
            item,
            deltaX,
            deltaY,
            dragItem.initialItemX,
            dragItem.initialItemY,
            prev.paperWidth,
            prev.paperHeight,
            prev.bodyTop,
            prev.footerTop
          )

          item.x = newX
          item.y = newY

          // Update the array
          items[dragItem.index] = item

          if (dragItem.region === 'title') newState.titleItems = items
          else if (dragItem.region === 'header') newState.headerItems = items
          else if (dragItem.region === 'footer') newState.footerItems = items
        }

        return newState
      })
    }

    const handleMouseUp = () => {
      setDragItem(null)
    }

    if (dragItem) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [dragItem, editorRef, onUpdateState])

  return {
    handleItemDragStart,
    dragItem,
  }
}
