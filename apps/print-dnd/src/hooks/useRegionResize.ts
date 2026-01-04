import { useCallback } from 'react'
import { EditorState } from '../types/editor'
import { SCALE } from '../constants/units'

export const useRegionResize = (
  onUpdateState: (updater: (prev: EditorState) => EditorState) => void
) => {
  const handleRegionResizeMove = useCallback(
    (regionId: string, deltaY: number, initialNextRegionTop: number) => {
      onUpdateState((prev) => {
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
        if (Array.isArray(currentRegion.data)) {
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

        // Let's refine the constraint calculation to be simpler:
        // We just clamp 'newTop'.

        let maxTopForNextRegion = nextRegionBottom - minHeight
        if (Array.isArray(nextRegion.data)) {
          const isRelativeItems = nextRegion.type === 'table'
          const minAllowedTop = nextRegion.data.reduce((min, item) => {
            let limit
            if (isRelativeItems) {
              // Relative items don't move abs position when region moves (they ride with it).
              // limit = bottom - item.y - item.h
              limit = nextRegionBottom - item.height - item.y
            } else {
              // Absolute items: y is absolute paper coordinate.
              // In original logic, we shifted them.
              // If we shift them, their distance to bottom decreases if valid space shrinks?
              // Actually if we move Top down, and shift items down, everything moves down.
              // So they hit the bottom wall.
              // The relative distance (item.y - top) stays constant?
              // Yes, the intention of the original 'map' was to keep relative position constant.
              // So: relativeY = item.y_current - current_nextRegion.top
              // limit = nextRegionBottom - item.height - relativeY
              const relativeY = item.y - nextRegion.top
              limit = nextRegionBottom - item.height - relativeY
            }
            return Math.min(min, limit)
          }, maxTopForNextRegion)
          maxTopForNextRegion = minAllowedTop
        }

        // Apply Clamping
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
    [onUpdateState]
  )

  return {
    handleRegionResizeMove,
  }
}
