import { useCallback } from 'react'
import { SCALE } from '../constants/units'
import { useEditorStoreApi } from '../store/editorStore'

export const useRegionResize = () => {
  const store = useEditorStoreApi()
  const handleRegionResizeMove = useCallback(
    (regionId: string, deltaY: number, initialNextRegionTop: number) => {
      store.setState((prev) => {
        const newState = { ...prev }
        const minHeight = 5 // mm

        const regionIndex = newState.regions.findIndex((r) => r.id === regionId)
        if (regionIndex === -1 || regionIndex >= newState.regions.length - 1)
          return prev

        const currentRegion = newState.regions[regionIndex]
        const nextRegionIndex = regionIndex + 1
        const nextRegion = newState.regions[nextRegionIndex]

        // Calculate target new top for the next region
        const deltaMm = deltaY / SCALE
        let newTop = initialNextRegionTop + deltaMm

        // --- Constraints Logic (Copied/Adapted from original) ---

        // 1. Min Height for Current Region
        let minTopForCurrentRegion = currentRegion.top + minHeight
        // If it's a table, we ignore its content height for resizing purposes (as per user request)
        if (
          currentRegion.type !== 'table' &&
          Array.isArray(currentRegion.data)
        ) {
          const maxItemBottom = currentRegion.data.reduce((max, item) => {
            const itemAbsBottom = item.y + item.height
            return Math.max(max, itemAbsBottom)
          }, currentRegion.top)

          minTopForCurrentRegion = Math.max(
            minTopForCurrentRegion,
            maxItemBottom
          )
        }

        // 2. Max Height (Min Top) for Next Region interactions
        // Basically we can't push Next Region items past the *subsequent* region (or page bottom).
        let nextRegionBottom = prev.paperHeight
        if (nextRegionIndex < newState.regions.length - 1) {
          nextRegionBottom = newState.regions[nextRegionIndex + 1].top
        }

        // We check if any item in Next Region would be pushed out of bounds.
        // If Next Region moves by (newTop - nextRegion.top), items move by that much (if absolute).
        // Wait, 'newTop' IS the proposed top.
        // We need to check against 'initialNextRegionTop' context?
        // Actually we can check against PRESENT nextRegion state constraints.
        // The constraint is: For every item in Next Region:
        // item.absBottom <= nextRegionBottom
        // If item is Absolute: item.y (relative to paper) changes with region shift?
        // The original logic shifted item.y by 'delta'.
        // Here we are setting absolute 'top'.
        // If we set 'top' to X, the shift is X - prev.nextRegion.top.
        // The original logic shifted item.y by 'delta'.
        // Here we are setting absolute 'top'.
        // If we set 'top' to X, the shift is X - prev.nextRegion.top.

        // Let's refine the constraint calculation to be simpler:
        // We just clamp 'newTop'.

        let maxTopForNextRegion = nextRegionBottom - minHeight
        // If next region is a table, we ignore its content height constraint (allow squishing)
        if (nextRegion.type !== 'table') {
          if (Array.isArray(nextRegion.data)) {
            const minAllowedTop = nextRegion.data.reduce((min, item) => {
              // We only handle non-table items here because table items are skipped above
              // But for type safety/completeness:
              // Absolute items: y is absolute paper coordinate.
              const relativeY = item.y - nextRegion.top
              const limit = nextRegionBottom - item.height - relativeY
              return Math.min(min, limit)
            }, maxTopForNextRegion)
            maxTopForNextRegion = minAllowedTop
          }
        }

        newTop = Math.max(
          minTopForCurrentRegion,
          Math.min(newTop, maxTopForNextRegion)
        )

        // Update State
        if (Math.abs(newTop - nextRegion.top) < 0.1) return prev // optimization

        const shiftDelta = newTop - nextRegion.top
        const updatedNextRegion = { ...nextRegion, top: newTop }

        // Shift items if Absolute
        if (Array.isArray(nextRegion.data) && nextRegion.type !== 'table') {
          updatedNextRegion.data = nextRegion.data.map((item) => ({
            ...item,
            y: item.y + shiftDelta,
          })) as any
        }

        const newRegions = [...prev.regions]
        newRegions[nextRegionIndex] = updatedNextRegion
        newState.regions = newRegions

        return newState
      })
    },
    []
  )

  return {
    handleRegionResizeMove,
  }
}
