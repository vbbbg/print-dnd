import { EditorState, EditorItem, Guide } from '../types/editor'
import { SCALE } from '../constants/units'

// Threshold: 5px converted to mm
const SNAP_THRESHOLD_MM = 5 / SCALE

export class PhysicsEngine {
  /**
   * Constrain calculations to Paper Bounds
   */
  static constrainToPaperBounds(
    x: number,
    y: number,
    itemWidth: number,
    itemHeight: number,
    paperWidth: number,
    paperHeight: number,
    margins?: { top: number; bottom: number; left: number; right: number }
  ) {
    const minX = margins ? margins.left : 0
    const maxX = paperWidth - itemWidth - (margins ? margins.right : 0)
    const minY = margins ? margins.top : 0
    const maxY = paperHeight - itemHeight - (margins ? margins.bottom : 0)

    const newX = Math.max(minX, Math.min(x, maxX))
    const newY = Math.max(minY, Math.min(y, maxY))
    return { x: newX, y: newY }
  }

  /**
   * Constrain to avoid Body Region (Table)
   * Returns the adjusted Y coordinate
   */
  static constrainToAvoidBody(
    y: number,
    itemHeight: number,
    bodyTop: number,
    footerTop: number
  ) {
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

  /**
   * Calculate snap lines from editor state
   */
  static getSnapLines(
    state: EditorState,
    skipIndex: number,
    skipRegion: string
  ) {
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

  /**
   * Snap position to guides
   */
  static snapToGuides(
    x: number,
    y: number,
    width: number,
    height: number,
    xLines: number[],
    yLines: number[]
  ) {
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

  /**
   * Main calculation function to determine final item position
   */
  static calculateItemPosition(
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
    snapData?: { xLines: number[]; yLines: number[] },
    margins?: { top: number; bottom: number; left: number; right: number }
  ) {
    let newX = initialX + deltaX
    let newY = initialY + deltaY
    let guides: Guide[] = []

    // 0. Apply Snapping (Visual Soft Constraint)
    if (snapData) {
      const snapResult = this.snapToGuides(
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
    const bounded = this.constrainToPaperBounds(
      newX,
      newY,
      item.width,
      item.height,
      paperWidth,
      paperHeight,
      margins
    )
    newX = bounded.x
    newY = bounded.y

    // 2. Apply Body Avoidance (Only if requested, e.g., on drop)
    if (applyBodyConstraint) {
      newY = this.constrainToAvoidBody(newY, item.height, bodyTop, footerTop)
    }

    return { x: newX, y: newY, guides }
  }

  /**
   * Calculate new item dimensions and position during resize
   */
  static calculateResizedItem(
    initialX: number,
    initialY: number,
    initialWidth: number,
    initialHeight: number,
    deltaX: number,
    deltaY: number,
    direction: any, // ResizeDirection
    minSize: number,
    paperWidth: number,
    paperHeight: number,
    margins?: { top: number; bottom: number; left: number; right: number }
  ) {
    let newX = initialX
    let newY = initialY
    let newWidth = initialWidth
    let newHeight = initialHeight

    // Calculate new dimensions based on resize direction
    switch (direction) {
      case 'se': // Southeast: resize from bottom-right
        newWidth = initialWidth + deltaX
        newHeight = initialHeight + deltaY
        break
      case 'sw': // Southwest: resize from bottom-left
        newWidth = initialWidth - deltaX
        newHeight = initialHeight + deltaY
        newX = initialX + deltaX
        break
      case 'ne': // Northeast: resize from top-right
        newWidth = initialWidth + deltaX
        newHeight = initialHeight - deltaY
        newY = initialY + deltaY
        break
      case 'nw': // Northwest: resize from top-left
        newWidth = initialWidth - deltaX
        newHeight = initialHeight - deltaY
        newX = initialX + deltaX
        newY = initialY + deltaY
        break
      case 'e': //  East: resize right edge
        newWidth = initialWidth + deltaX
        break
      case 'w': // West: resize left edge
        newWidth = initialWidth - deltaX
        newX = initialX + deltaX
        break
      case 's': // South: resize bottom edge
        newHeight = initialHeight + deltaY
        break
      case 'n': // North: resize top edge
        newHeight = initialHeight - deltaY
        newY = initialY + deltaY
        break
    }

    // Apply minimum size constraint
    if (newWidth < minSize) {
      newWidth = minSize
      // Adjust X if resizing from left/northwest/southwest
      if (['w', 'nw', 'sw'].includes(direction)) {
        newX = initialX + initialWidth - minSize
      }
    }
    if (newHeight < minSize) {
      newHeight = minSize
      // Adjust Y if resizing from top/northwest/northeast
      if (['n', 'nw', 'ne'].includes(direction)) {
        newY = initialY + initialHeight - minSize
      }
    }

    // Apply margin/paper bounds constraint
    const safeMargins = margins || { top: 0, bottom: 0, left: 0, right: 0 }
    const minX = safeMargins.left
    const maxX = paperWidth - safeMargins.right
    const minY = safeMargins.top
    const maxY = paperHeight - safeMargins.bottom

    // Constraint Left (West)
    if (['w', 'nw', 'sw'].includes(direction)) {
      if (newX < minX) {
        newX = minX
        newWidth = initialX + initialWidth - newX
      }
    }

    // Constraint Top (North)
    if (['n', 'nw', 'ne'].includes(direction)) {
      if (newY < minY) {
        newY = minY
        newHeight = initialY + initialHeight - newY
      }
    }

    // Constraint Right (East) & General Bounds
    if (newX + newWidth > maxX) {
      newWidth = Math.max(minSize, maxX - newX)
    }

    // Constraint Bottom (South) & General Bounds
    if (newY + newHeight > maxY) {
      newHeight = Math.max(minSize, maxY - newY)
    }

    // Final safety check
    newX = Math.max(minX, newX)
    newY = Math.max(minY, newY)

    return { x: newX, y: newY, width: newWidth, height: newHeight }
  }
}
