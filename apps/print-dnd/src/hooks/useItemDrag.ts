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

        // TODO: PhysicsEngine needs update to accept generic regions
        const snapData = PhysicsEngine.getSnapLines(
          prev,
          currentDragItem.index,
          currentDragItem.region
        )

        // TODO: PhysicsEngine.calculateItemPosition needs update
        // For now, we will assume bodyTop/footerTop are derived or we pass 0 for now until PhysicsEngine is updated
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
          0, // Temporary: bodyTop replacement
          0, // Temporary: footerTop replacement
          false,
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

      // Find Table Region (Body) to establish constraints
      // Assuming only one table region for now or finding the first one
      const tableRegion = newState.regions.find((r) => r.type === 'table')

      if (!tableRegion) {
        // No table, no constraint needed (or regular paper bounds?)
        // Assuming paper bounds already handled during move?
        // Move logic applies paper bounds hard constraint.
        return prev
      }

      // Calculate Table Bounds
      // Table Top is region.top
      // Table Bottom is region.top + calculated height?
      // Table Region 'height' property might be undefined if it's dynamic?
      // In RegionTable, it renders.
      // Paper.tsx calculates height for rendering:
      /*
        const regionRenderData = regions.map((region, idx) => {
            let height = 0
            if (idx < regions.length - 1) {
            height = regions[idx + 1].top - region.top
            } // ...
      */
      // We should use the same logic to find the 'exclusion zone'.

      // Better approach: Find the gap where the table is.
      // The table starts at tableRegion.top.
      // The region AFTER table starts at nextRegion.top.
      // The exclusion zone is [tableRegion.top, tableRegionWithHeight_Bottom].

      const tableRegionIndex = newState.regions.findIndex(
        (r) => r.type === 'table'
      )
      if (tableRegionIndex === -1) return prev

      const tableTop = newState.regions[tableRegionIndex].top

      // Find bottom of table (which is top of next region, or paper end)
      let tableBottom = newState.paperHeight
      if (tableRegionIndex < newState.regions.length - 1) {
        tableBottom = newState.regions[tableRegionIndex + 1].top
      }

      // Apply Constraint: Snap Out of Body
      const snappedY = PhysicsEngine.constrainToAvoidBody(
        item.y,
        item.height,
        tableTop,
        tableBottom
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
