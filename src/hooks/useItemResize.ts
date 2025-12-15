import { useState, useEffect, RefObject, useCallback } from 'react'
import { EditorState } from '../types/editor'
import { SCALE } from '../constants/units'
import { ResizeDirection } from '../components/ResizeHandles'

interface ResizeState {
  index: number
  region: 'title' | 'header' | 'footer'
  direction: ResizeDirection
  startX: number
  startY: number
  initialX: number
  initialY: number
  initialWidth: number
  initialHeight: number
}

const MIN_SIZE_MM = 5 // Minimum item size in mm

export const useItemResize = (
  editorRef: RefObject<HTMLDivElement>,
  onUpdateState: (updater: (prev: EditorState) => EditorState) => void
) => {
  const [resizing, setResizing] = useState<ResizeState | null>(null)

  const handleResizeStart = useCallback(
    (
      index: number,
      region: 'title' | 'header' | 'footer',
      direction: ResizeDirection,
      e: React.MouseEvent,
      itemX: number,
      itemY: number,
      itemWidth: number,
      itemHeight: number
    ) => {
      e.preventDefault()
      e.stopPropagation()

      setResizing({
        index,
        region,
        direction,
        startX: e.clientX,
        startY: e.clientY,
        initialX: itemX,
        initialY: itemY,
        initialWidth: itemWidth,
        initialHeight: itemHeight,
      })
    },
    []
  )

  useEffect(() => {
    if (!resizing || !editorRef.current) return

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault()

      const deltaX = (e.clientX - resizing.startX) / SCALE
      const deltaY = (e.clientY - resizing.startY) / SCALE

      onUpdateState((prev) => {
        const newState = { ...prev }
        let items: any[] = []

        if (resizing.region === 'title') items = [...prev.titleItems]
        else if (resizing.region === 'header') items = [...prev.headerItems]
        else if (resizing.region === 'footer') items = [...prev.footerItems]

        if (!items[resizing.index]) return prev

        const item = { ...items[resizing.index] }
        let newX = resizing.initialX
        let newY = resizing.initialY
        let newWidth = resizing.initialWidth
        let newHeight = resizing.initialHeight

        // Calculate new dimensions based on resize direction
        switch (resizing.direction) {
          case 'se': // Southeast: resize from bottom-right
            newWidth = resizing.initialWidth + deltaX
            newHeight = resizing.initialHeight + deltaY
            break
          case 'sw': // Southwest: resize from bottom-left
            newWidth = resizing.initialWidth - deltaX
            newHeight = resizing.initialHeight + deltaY
            newX = resizing.initialX + deltaX
            break
          case 'ne': // Northeast: resize from top-right
            newWidth = resizing.initialWidth + deltaX
            newHeight = resizing.initialHeight - deltaY
            newY = resizing.initialY + deltaY
            break
          case 'nw': // Northwest: resize from top-left
            newWidth = resizing.initialWidth - deltaX
            newHeight = resizing.initialHeight - deltaY
            newX = resizing.initialX + deltaX
            newY = resizing.initialY + deltaY
            break
          case 'e': //  East: resize right edge
            newWidth = resizing.initialWidth + deltaX
            break
          case 'w': // West: resize left edge
            newWidth = resizing.initialWidth - deltaX
            newX = resizing.initialX + deltaX
            break
          case 's': // South: resize bottom edge
            newHeight = resizing.initialHeight + deltaY
            break
          case 'n': // North: resize top edge
            newHeight = resizing.initialHeight - deltaY
            newY = resizing.initialY + deltaY
            break
        }

        // Apply minimum size constraint
        if (newWidth < MIN_SIZE_MM) {
          newWidth = MIN_SIZE_MM
          // Adjust X if resizing from left/northwest/southwest
          if (['w', 'nw', 'sw'].includes(resizing.direction)) {
            newX = resizing.initialX + resizing.initialWidth - MIN_SIZE_MM
          }
        }
        if (newHeight < MIN_SIZE_MM) {
          newHeight = MIN_SIZE_MM
          // Adjust Y if resizing from top/northwest/northeast
          if (['n', 'nw', 'ne'].includes(resizing.direction)) {
            newY = resizing.initialY + resizing.initialHeight - MIN_SIZE_MM
          }
        }

        // Apply paper bounds constraint
        newX = Math.max(0, newX)
        newY = Math.max(0, newY)
        if (newX + newWidth > prev.paperWidth) {
          newWidth = prev.paperWidth - newX
        }
        if (newY + newHeight > prev.paperHeight) {
          newHeight = prev.paperHeight - newY
        }

        // Update item
        item.x = newX
        item.y = newY
        item.width = newWidth
        item.height = newHeight

        items[resizing.index] = item

        if (resizing.region === 'title') newState.titleItems = items
        else if (resizing.region === 'header') newState.headerItems = items
        else if (resizing.region === 'footer') newState.footerItems = items

        return newState
      })
    }

    const handleMouseUp = () => {
      setResizing(null)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [resizing, editorRef, onUpdateState])

  return {
    handleResizeStart,
    resizing,
  }
}
