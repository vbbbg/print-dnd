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

        if (items[dragItem.index]) {
          const item = { ...items[dragItem.index] }
          item.x = dragItem.initialItemX + deltaX
          item.y = dragItem.initialItemY + deltaY
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
