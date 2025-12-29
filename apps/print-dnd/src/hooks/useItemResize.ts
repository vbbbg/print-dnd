import { useState, useEffect, RefObject, useCallback } from 'react'
import { EditorState } from '../types/editor'
import { SCALE } from '../constants/units'
import { ResizeDirection } from '../components/ResizeHandles'
import { PhysicsEngine } from '../core/PhysicsEngine'

interface ResizeState {
  index: number
  region: string
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
      regionId: string,
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
        region: regionId,
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

        const regionIndex = newState.regions.findIndex(
          (r) => r.id === resizing.region
        )
        if (regionIndex === -1) return prev
        const region = newState.regions[regionIndex]
        if (!region.items) return prev

        const items = [...region.items]

        if (!items[resizing.index]) return prev

        const item = { ...items[resizing.index] }

        const {
          x: newX,
          y: newY,
          width: newWidth,
          height: newHeight,
        } = PhysicsEngine.calculateResizedItem(
          resizing.initialX,
          resizing.initialY,
          resizing.initialWidth,
          resizing.initialHeight,
          deltaX,
          deltaY,
          resizing.direction,
          MIN_SIZE_MM,
          prev.paperWidth,
          prev.paperHeight,
          prev.margins
        )

        // Update item
        item.x = newX
        item.y = newY
        item.width = newWidth
        item.height = newHeight

        items[resizing.index] = item

        newState.regions = [...prev.regions]
        newState.regions[regionIndex] = { ...region, items }

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
