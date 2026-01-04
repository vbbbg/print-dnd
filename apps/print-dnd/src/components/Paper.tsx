import React from 'react'
import { useDrop } from 'react-dnd'
import { ResizeHandle } from './ResizeHandle'
import { mmToPx } from '../constants/units'
import { MarginsGuide } from './MarginsGuide'
import { AlignmentGuides } from './AlignmentGuides'
import { regionRegistry } from '../core/RegionRegistry'
import { useEditorContext } from '../contexts/EditorContext'
import { useEditorStore } from '../store/editorStore'
import '../regions/TableRegion'
import '../regions/FreeLayoutRegion'
import { RegionGuide } from './RegionGuide'

export const Paper: React.FC = () => {
  const state = useEditorStore((state) => state)
  const selectedItemIdx = useEditorStore((state) => state.selectedItemIdx)
  const { paperHeight, paperWidth, margins, regions } = state

  const { handlers, guides } = useEditorContext()
  const {
    onItemDragMove,
    onItemDragEnd,
    onItemResizeMove,
    onColumnResizeMove,
    onRegionResizeMove,
  } = handlers

  const [, dropRef] = useDrop({
    accept: [
      'DRAGGABLE_ITEM',
      'RESIZE_HANDLE',
      'RESIZE_COLUMN_HANDLE',
      'RESIZE_REGION_HANDLE',
    ],
    hover: (item: any, monitor) => {
      const delta = monitor.getDifferenceFromInitialOffset()
      const itemType = monitor.getItemType()

      if (!delta) return

      if (itemType === 'RESIZE_HANDLE' && onItemResizeMove) {
        onItemResizeMove(
          item.index,
          item.regionId,
          item.direction,
          delta.x,
          delta.y,
          {
            initialX: item.initialX,
            initialY: item.initialY,
            initialWidth: item.initialWidth,
            initialHeight: item.initialHeight,
          }
        )
      } else if (itemType === 'RESIZE_COLUMN_HANDLE' && onColumnResizeMove) {
        onColumnResizeMove(
          item.colIndex,
          delta.x,
          item.initialWidths,
          item.minWidths
        )
      } else if (itemType === 'RESIZE_REGION_HANDLE' && onRegionResizeMove) {
        onRegionResizeMove(
          item.regionId,
          delta.y,
          item.initialNextRegionTop // This was passed as handle's top
        )
      } else if (itemType === 'DRAGGABLE_ITEM' && onItemDragMove) {
        onItemDragMove(delta.x, delta.y)
      }
    },
    drop: () => {
      if (onItemDragEnd) {
        onItemDragEnd()
      }
    },
  })

  // Calculate region positions
  const regionRenderData = regions.map((region, idx) => {
    let height = 0
    if (idx < regions.length - 1) {
      height = regions[idx + 1].top - region.top
    } else {
      height = paperHeight - region.top
    }
    return { ...region, height }
  })

  return (
    <div
      ref={dropRef}
      data-paper-root="true"
      className="relative bg-white shadow-xl mx-auto"
      style={{
        width: mmToPx(paperWidth),
        height: mmToPx(paperHeight),
      }}
    >
      <MarginsGuide margins={margins} />

      <RegionGuide regions={regionRenderData} />

      {/* Region Content */}
      {regionRenderData.map((region, regionIndex) => {
        const isSelected = selectedItemIdx?.region === region.id

        return (
          <React.Fragment key={region.id}>
            <RegionContent region={region} isSelected={isSelected} />

            {/* Resize Handle (Bottom of region, except last one) */}
            {regionIndex < regions.length - 1 && (
              <ResizeHandle
                top={mmToPx(region.top + region.height)}
                regionId={region.id}
                initialNextRegionTop={region.top + region.height} // Pass in MM
                className={`resize-handle-${region.id} group z-${50 - regionIndex * 10}`}
              />
            )}
          </React.Fragment>
        )
      })}

      <AlignmentGuides guides={guides} />
    </div>
  )
}

// --- Sub-components for Abstraction ---
const RegionContent: React.FC<{
  region: any
  isSelected: boolean
}> = (props) => {
  const { region } = props
  const plugin = regionRegistry.get(region.type)

  if (plugin) {
    const Component = plugin.render
    return <Component {...props} />
  }

  return <div>Unknown Region Type: {region.type}</div>
}
