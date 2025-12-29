import { useState, useEffect, RefObject, useCallback } from 'react'
import { EditorState, Guide } from '../types/editor'
import { SCALE } from '../constants/units'

interface DragState {
  index: number
  region: 'title' | 'header' | 'footer'
  startX: number
  startY: number
  initialItemX: number
  initialItemY: number
}

import { PhysicsEngine } from '../core/PhysicsEngine'

export const useItemDrag = (
  editorRef: RefObject<HTMLDivElement>,
  onUpdateState: (updater: (prev: EditorState) => EditorState) => void
) => {
  const [dragItem, setDragItem] = useState<DragState | null>(null)
  const [guides, setGuides] = useState<Guide[]>([])

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
    const updateState = (e: MouseEvent, applyBodyConstraint: boolean) => {
      if (!dragItem || !editorRef.current) return

      const deltaX = (e.clientX - dragItem.startX) / SCALE
      const deltaY = (e.clientY - dragItem.startY) / SCALE

      // Calculate guides BEFORE updating state using synchronous state access
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
            deltaX,
            deltaY,
            dragItem.initialItemX,
            dragItem.initialItemY,
            prev.paperWidth,
            prev.paperHeight,
            prev.bodyTop,
            prev.footerTop,
            applyBodyConstraint,
            snapData,
            prev.margins
          )

          item.x = newX
          item.y = newY

          // Store guides for later update (only during drag)
          if (!applyBodyConstraint) {
            calculatedGuides = newGuides
          }

          // Update the array
          items[dragItem.index] = item

          if (dragItem.region === 'title') newState.titleItems = items
          else if (dragItem.region === 'header') newState.headerItems = items
          else if (dragItem.region === 'footer') newState.footerItems = items
        }

        return newState
      })

      // Update guides synchronously after state update
      // Safe because we're in an event handler, not during render
      if (!applyBodyConstraint) {
        setGuides(calculatedGuides)
      } else {
        setGuides([])
      }
    }

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault()
      // During drag, allow visual overlap (pass through)
      updateState(e, false)
    }

    const handleMouseUp = (e: MouseEvent) => {
      // Must prevent default to avoid any weird selection
      e.preventDefault()
      // Final update with strict constraints (snap out of body)
      updateState(e, true)
      setDragItem(null)
      setGuides([])
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
    guides,
  }
}
