import React, { useState, useCallback } from 'react'
import { Guide } from '../types/editor'
import { SCALE } from '../constants/units'
import { PhysicsEngine } from '../core/PhysicsEngine'
import { useEditorStoreApi } from '../store/editorStore'

interface DragState {
  index: number
  region: string
  initialItemX: number
  initialItemY: number
  startX: number
  startY: number
}

export const useItemDrag = () => {
  const store = useEditorStoreApi()
  const [dragItem, setDragItem] = useState<DragState | null>(null)
  const dragItemRef = React.useRef<DragState | null>(null)
  const [guides, setGuides] = useState<Guide[]>([])

  const handleDragStart = useCallback(
    (index: number, regionId: string, itemX: number, itemY: number) => {
      setDragItem({
        index,
        region: regionId,
        initialItemX: itemX,
        initialItemY: itemY,
        startX: itemX,
        startY: itemY,
      })
      dragItemRef.current = {
        index,
        region: regionId,
        initialItemX: itemX,
        initialItemY: itemY,
        startX: itemX,
        startY: itemY,
      }
    },
    []
  )

  const handleDragMove = useCallback((deltaX: number, deltaY: number) => {
    const currentDragItem = dragItemRef.current
    if (!currentDragItem) {
      console.log('useItemDrag: No drag item in ref during move')
      return
    }

    const mmDeltaX = deltaX / SCALE
    const mmDeltaY = deltaY / SCALE

    let calculatedGuides: Guide[] = []

    store.setState((prev) => {
      const newState = { ...prev }

      const regionIndex = newState.regions.findIndex(
        (r) => r.id === currentDragItem.region
      )
      if (regionIndex === -1) return prev

      const region = newState.regions[regionIndex]
      if (!Array.isArray(region.data)) return prev

      const items = [...region.data]

      if (items[currentDragItem.index]) {
        const item = { ...items[currentDragItem.index] }

        // PhysicsEngine.getSnapLines now implicitly iterates all regions
        const snapData = PhysicsEngine.getSnapLines(
          prev,
          currentDragItem.index,
          currentDragItem.region
        )

        // During drag, we do NOT apply exclusion zones (tables) so that the user can visually drag "over" them.
        // The exclusion constraint is applied on drag end.

        const {
          x: newX,
          y: newY,
          guides: newGuides,
        } = PhysicsEngine.calculateItemPosition(
          item,
          mmDeltaX,
          mmDeltaY,
          currentDragItem.initialItemX,
          currentDragItem.initialItemY,
          prev.paperWidth,
          prev.paperHeight,
          [], // exclusionZones: empty during drag
          snapData,
          prev.margins
        )

        item.x = newX
        item.y = newY

        calculatedGuides = newGuides

        items[currentDragItem.index] = item

        newState.regions = [...prev.regions]
        newState.regions[regionIndex] = { ...region, data: items }
      }

      return newState
    })

    setGuides(calculatedGuides)
  }, [])

  const handleDragEnd = useCallback(() => {
    const currentDragItem = dragItemRef.current
    if (!currentDragItem) return

    store.setState((prev) => {
      const newState = { ...prev }

      // Find the dragged item
      const regionIndex = newState.regions.findIndex(
        (r) => r.id === currentDragItem.region
      )
      if (regionIndex === -1) return prev

      const region = newState.regions[regionIndex]
      if (!Array.isArray(region.data)) return prev

      const items = [...region.data]
      const item = { ...items[currentDragItem.index] }

      // Calculate Exclusion Zones (Generic)
      const exclusionZones: { top: number; bottom: number }[] = []
      newState.regions.forEach((r, idx) => {
        if (r.type === 'table') {
          const top = r.top
          const bottom =
            idx < newState.regions.length - 1
              ? newState.regions[idx + 1].top
              : newState.paperHeight
          exclusionZones.push({ top, bottom })
        }
      })

      // Apply Constraint: Snap Out of Exclusion Zones
      const snappedY = PhysicsEngine.constrainToAvoidRegions(
        item.y,
        item.height,
        exclusionZones
      )

      if (Math.abs(snappedY - item.y) < 0.01) {
        return prev // No change needed
      }

      item.y = snappedY
      items[currentDragItem.index] = item
      newState.regions[regionIndex] = { ...region, data: items }

      return newState
    })

    setDragItem(null)
    dragItemRef.current = null
    setGuides([])
  }, [])

  return {
    handleDragStart,
    handleDragMove,
    handleDragEnd,
    dragItem,
    guides,
  }
}
