import { useState, useEffect, RefObject, useCallback } from 'react'
import { EditorState, EditorItem, Guide } from '../types/editor'
import { SCALE } from '../constants/units'

interface DragState {
  index: number
  region: 'title' | 'header' | 'footer'
  startX: number
  startY: number
  initialItemX: number
  initialItemY: number
}

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

// 3. Snapping Logic
// Threshold: 5px converted to mm
const SNAP_THRESHOLD_MM = 5 / SCALE

const getSnapLines = (
  state: EditorState,
  skipIndex: number,
  skipRegion: string
) => {
  const xLines: number[] = [0, state.paperWidth / 2, state.paperWidth]
  const yLines: number[] = [0, state.paperHeight / 2, state.paperHeight]

  // Explicit loop for better control
  const addItems = (items: EditorItem[], region: string) => {
    items.forEach((item, idx) => {
      // Skip the item being dragged
      if (region === skipRegion && idx === skipIndex) return

      xLines.push(item.x)
      xLines.push(item.x + item.width / 2)
      xLines.push(item.x + item.width)
      yLines.push(item.y)
      yLines.push(item.y + item.height / 2)
      yLines.push(item.y + item.height)
    })
  }

  addItems(state.titleItems, 'title')
  addItems(state.headerItems, 'header')
  addItems(state.footerItems, 'footer')

  return { xLines, yLines }
}

const snapToGuides = (
  x: number,
  y: number,
  width: number,
  height: number,
  xLines: number[],
  yLines: number[]
) => {
  let snappedX = x
  let snappedY = y
  const activeGuides: Guide[] = []

  // Define snap points for the item (left, center, right)
  const xPoints = [
    { value: x, offset: 0, label: 'left' },
    { value: x + width / 2, offset: -width / 2, label: 'center' },
    { value: x + width, offset: -width, label: 'right' },
  ]

  // Define snap points for the item (top, middle, bottom)
  const yPoints = [
    { value: y, offset: 0, label: 'top' },
    { value: y + height / 2, offset: -height / 2, label: 'middle' },
    { value: y + height, offset: -height, label: 'bottom' },
  ]

  // Find X-axis snapping (vertical lines)
  // For each snap point, find the nearest matching guide line
  let bestXSnap: { line: number; offset: number; distance: number } | null =
    null

  for (const pt of xPoints) {
    let closestLine: number | null = null
    let minDistance = SNAP_THRESHOLD_MM

    for (const line of xLines) {
      const distance = Math.abs(pt.value - line)
      if (distance < minDistance) {
        closestLine = line
        minDistance = distance
      }
    }

    // If this point has a matching guide, record it
    if (closestLine !== null) {
      // Track the best snap for positioning (closest overall)
      if (!bestXSnap || minDistance < bestXSnap.distance) {
        bestXSnap = {
          line: closestLine,
          offset: pt.offset,
          distance: minDistance,
        }
      }
      // Add this guide line (for this specific snap point)
      // Avoid duplicates
      if (
        !activeGuides.find(
          (g) => g.type === 'vertical' && g.pos === closestLine
        )
      ) {
        activeGuides.push({ type: 'vertical', pos: closestLine })
      }
    }
  }

  // Apply best X snap
  if (bestXSnap) {
    snappedX = bestXSnap.line + bestXSnap.offset
  }

  // Find Y-axis snapping (horizontal lines)
  // For each snap point, find the nearest matching guide line
  let bestYSnap: { line: number; offset: number; distance: number } | null =
    null

  for (const pt of yPoints) {
    let closestLine: number | null = null
    let minDistance = SNAP_THRESHOLD_MM

    for (const line of yLines) {
      const distance = Math.abs(pt.value - line)
      if (distance < minDistance) {
        closestLine = line
        minDistance = distance
      }
    }

    // If this point has a matching guide, record it
    if (closestLine !== null) {
      // Track the best snap for positioning (closest overall)
      if (!bestYSnap || minDistance < bestYSnap.distance) {
        bestYSnap = {
          line: closestLine,
          offset: pt.offset,
          distance: minDistance,
        }
      }
      // Add this guide line (for this specific snap point)
      // Avoid duplicates
      if (
        !activeGuides.find(
          (g) => g.type === 'horizontal' && g.pos === closestLine
        )
      ) {
        activeGuides.push({ type: 'horizontal', pos: closestLine })
      }
    }
  }

  // Apply best Y snap
  if (bestYSnap) {
    snappedY = bestYSnap.line + bestYSnap.offset
  }

  return { x: snappedX, y: snappedY, guides: activeGuides }
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
  footerTop: number,
  applyBodyConstraint: boolean,
  snapData?: { xLines: number[]; yLines: number[] }
) => {
  let newX = initialX + deltaX
  let newY = initialY + deltaY
  let guides: Guide[] = []

  // 0. Apply Snapping (Visual Soft Constraint)
  if (snapData) {
    const snapResult = snapToGuides(
      newX,
      newY,
      item.width,
      item.height,
      snapData.xLines,
      snapData.yLines
    )
    newX = snapResult.x
    newY = snapResult.y
    guides = snapResult.guides
  }

  // 1. Apply Paper Bounds (Hard Constraint)
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

  // 2. Apply Body Avoidance (Only if requested, e.g., on drop)
  if (applyBodyConstraint) {
    newY = constrainToAvoidBody(newY, item.height, bodyTop, footerTop)
  }

  return { x: newX, y: newY, guides }
}

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

          const snapData = getSnapLines(prev, dragItem.index, dragItem.region)

          const {
            x: newX,
            y: newY,
            guides: newGuides,
          } = calculateItemPosition(
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
            snapData
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
