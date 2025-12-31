import React from 'react'
import { useDrop } from 'react-dnd'
import { EditorState, Guide } from '../types/editor'
import { ResizeHandle } from './ResizeHandle'
import { mmToPx } from '../constants/units'
import { ResizeDirection } from './ResizeHandles'
import { MarginsGuide } from './MarginsGuide'
import { AlignmentGuides } from './AlignmentGuides'
import { regionRegistry } from '../core/RegionRegistry'
import '../regions/TableRegion'
import '../regions/FreeLayoutRegion'
import { RegionGuide } from './RegionGuide'

interface PaperProps {
  state: EditorState
  onResizeStart: (regionId: string, e: React.MouseEvent) => void
  onItemDragStart: (
    index: number,
    regionId: string,
    itemX: number,
    itemY: number
  ) => void
  onItemDragMove?: (deltaX: number, deltaY: number) => void
  onItemDragEnd?: () => void
  onItemResizeStart?: (
    index: number,
    regionId: string,
    direction: ResizeDirection,
    e: React.MouseEvent,
    itemX: number,
    itemY: number,
    itemWidth: number,
    itemHeight: number
  ) => void
  onColumnResizeStart?: any

  guides?: Guide[]
  selectedItemIdx?: {
    region: string
    index: number
  } | null
  data?: Record<string, any>
}

export const Paper: React.FC<PaperProps> = ({
  state,
  onResizeStart,
  onItemDragStart,
  onItemDragMove,
  onItemDragEnd,
  onItemResizeStart,
  onColumnResizeStart,
  guides,
  selectedItemIdx,
  data = {},
}) => {
  const { paperHeight, paperWidth, margins, regions } = state

  const [, dropRef] = useDrop({
    accept: 'DRAGGABLE_ITEM',
    hover: (_item, monitor) => {
      const delta = monitor.getDifferenceFromInitialOffset()
      if (delta && onItemDragMove) {
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
            <RegionContent
              region={region}
              data={data}
              margins={margins}
              isSelected={isSelected}
              onItemDragStart={onItemDragStart}
              onItemDragEnd={onItemDragEnd}
              onItemResizeStart={onItemResizeStart}
              onColumnResizeStart={onColumnResizeStart}
              selectedItemIdx={selectedItemIdx}
            />

            {/* Resize Handle (Bottom of region, except last one) */}
            {regionIndex < regions.length - 1 && (
              <ResizeHandle
                top={mmToPx(region.top + region.height)}
                onMouseDown={(e) => onResizeStart(region.id as any, e)}
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
  data: any
  margins: any
  isSelected: boolean
  onItemDragStart: any
  onItemDragEnd: any
  onItemResizeStart: any
  onColumnResizeStart?: any
  selectedItemIdx: any
}> = (props) => {
  const { region } = props
  const plugin = regionRegistry.get(region.type)

  if (plugin) {
    const Component = plugin.render
    return <Component {...props} />
  }

  return <div>Unknown Region Type: {region.type}</div>
}
