import { useState, useEffect, RefObject } from 'react'
import { EditorState } from '../types/editor'
import { SCALE } from '../constants/units'

export const useGlobalDrag = (
  editorRef: RefObject<HTMLDivElement>,
  onUpdateState: (updater: (prev: EditorState) => EditorState) => void
) => {
  const [dragging, setDragging] = useState<string | null>(null) // regionId

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault()
      if (!dragging || !editorRef.current) return

      const paperElement = editorRef.current.querySelector(
        '[data-paper-root="true"]'
      )
      if (!paperElement) return

      const rect = paperElement.getBoundingClientRect()
      const mouseRelY = (e.clientY - rect.top) / SCALE

      onUpdateState((prev) => {
        const newState = { ...prev }
        const minHeight = 5 // mm

        // Find the region associated with the resize handle
        // The handle belongs to `dragging` region, located at its bottom.
        // So we are effectively moving the START (top) of the NEXT region.
        const regionIndex = newState.regions.findIndex((r) => r.id === dragging)
        if (regionIndex === -1 || regionIndex >= newState.regions.length - 1)
          return prev

        const currentRegion = newState.regions[regionIndex]
        const nextRegionIndex = regionIndex + 1
        const nextRegion = newState.regions[nextRegionIndex]

        // 1. Calculate boundaries for constraints
        // Current Region Limits (Top is fixed, Bottom is changing)
        // Ensure newTop (which is effectively Current Region Bottom) is not ABOVE any item in Current Region
        let minTopForCurrentRegion = currentRegion.top + minHeight
        if (Array.isArray(currentRegion.data)) {
          // If Table, items are relative (y=0). Absolute Bottom = region.top + item.y + item.height
          const isRelativeItems = currentRegion.type === 'table'

          const maxItemBottom = currentRegion.data.reduce((max, item) => {
            const itemAbsBottom = isRelativeItems
              ? currentRegion.top + item.y + item.height
              : item.y + item.height
            return Math.max(max, itemAbsBottom)
          }, currentRegion.top)

          minTopForCurrentRegion = Math.max(
            minTopForCurrentRegion,
            maxItemBottom
          )
        }

        // Next Region Limits (Top is changing, Bottom is fixed)
        // Ensure newTop is not BELOW any item in Next Region (considering items will SHIFT)
        // Wait, if items shift with the top, they will never collide with the top?
        // Ah, if I move Header Top DOWN, Header Items move DOWN.
        // They might collide with Header Bottom (which is fixed? No, Header Bottom is Body Top).
        // If I move Header Top down, does Body Top move?
        // Depends on the interaction model.
        // "Standard" drag model: Resizing A vs B boundary. A grows, B shrinks. B's bottom is fixed.
        // So B items move down. B's available height shrinks. B items might hit B bottom.

        let nextRegionBottom = prev.paperHeight
        if (nextRegionIndex < newState.regions.length - 1) {
          nextRegionBottom = newState.regions[nextRegionIndex + 1].top
        }

        // Calculate max shift allowed for Next Region items
        // We need to check if ANY item in Next Region will be pushed past nextRegionBottom
        // delta = newTop - oldTop (of next region)
        // item.y_new = item.y_old + delta
        // item.y_new + height <= nextRegionBottom
        // item.y_old + delta + height <= nextRegionBottom
        // delta <= nextRegionBottom - height - item.y_old
        // newTop - oldTop <= nextRegionBottom - height - item.y_old
        // newTop <= nextRegionBottom - height - item.y_old + oldTop

        let maxTopForNextRegion = nextRegionBottom - minHeight
        if (Array.isArray(nextRegion.data)) {
          const isRelativeItems = nextRegion.type === 'table'

          const minAllowedTop = nextRegion.data.reduce((min, item) => {
            // For Relative Items (Table):
            // item.y is relative to New Top.
            // Item Abs Bottom = newTop + item.y + item.height <= nextRegionBottom
            // newTop <= nextRegionBottom - item.y - item.height

            // For Absolute Items (FreeLayout):
            // We shift item.y by delta (newTop - oldTop).
            // item.y_new = item.y_old + (newTop - oldTop)
            // item.y_new + height <= nextRegionBottom
            // newTop <= nextRegionBottom - height - item.y_old + oldTop hiding in math
            // Actually: relativeY = item.y_old - oldTop
            // limit = nextRegionBottom - height - relativeY

            let limit
            if (isRelativeItems) {
              limit = nextRegionBottom - item.height - item.y
            } else {
              const relativeY = item.y - nextRegion.top
              limit = nextRegionBottom - item.height - relativeY
            }
            return Math.min(min, limit)
          }, maxTopForNextRegion)
          maxTopForNextRegion = minAllowedTop
        }

        // Apply Constraints
        let newTop = Math.max(
          minTopForCurrentRegion,
          Math.min(mouseRelY, maxTopForNextRegion)
        )

        // Calculate shift delta
        const delta = newTop - nextRegion.top

        if (delta === 0) return prev

        // Update NEXT region top
        const newRegions = [...prev.regions]

        // Shift items in the Next Region ONLY?
        // Or all subsequent regions?
        // If we are resizing A vs B (stealing space), then C, D, E don't move.
        // So only A and B change. B's top changes. B's items shift.
        // B's bottom (C's top) stays fixed.

        const updatedNextRegion = { ...nextRegion, top: newTop }

        // Only shift items if they are ABSOLUTE (Free Layout).
        // Table Items (Relative) stay properties y=0 relative to the new top, so no update needed.
        if (Array.isArray(nextRegion.data) && nextRegion.type !== 'table') {
          updatedNextRegion.data = nextRegion.data.map((item) => ({
            ...item,
            y: item.y + delta,
          })) as any
        }

        newRegions[nextRegionIndex] = updatedNextRegion
        newState.regions = newRegions

        return newState
      })
    }

    const handleMouseUp = () => {
      setDragging(null)
    }

    if (dragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [dragging, editorRef, onUpdateState])

  return {
    dragging,
    setDragging,
  }
}
