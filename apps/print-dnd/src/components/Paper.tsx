import React, { useRef } from 'react'
import { useDrop } from 'react-dnd'
import { EditorState, Guide } from '../types/editor'
import { ResizeHandle } from './ResizeHandle'
import { DraggableItem } from './DraggableItem'
import { mmToPx } from '../constants/units'
import { ResizeDirection } from './ResizeHandles'
import { componentRegistry } from '../core/ComponentRegistry'
import { MarginsGuide } from './MarginsGuide'
import { AlignmentGuides } from './AlignmentGuides'

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
  onColumnResizeStart?: (
    index: number,
    e: React.MouseEvent,
    minWidthLeft: number,
    minWidthRight: number
  ) => void
  guides?: Guide[]
  selectedItemIdx?: {
    region: string
    index: number
  } | null
  data?: Record<string, any>
  onTableClick?: () => void
}

export const Paper: React.FC<PaperProps> = ({
  state,
  onResizeStart,
  onItemDragStart,
  onItemDragMove,
  onItemDragEnd,
  onItemResizeStart,
  guides,
  selectedItemIdx,
  data = {},
}) => {
  const { paperHeight, paperWidth, margins, regions } = state

  const paperRef = useRef<HTMLDivElement | null>(null)

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

  // Combine refs
  const setRefs = (element: HTMLDivElement | null) => {
    paperRef.current = element
    dropRef(element)
  }

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
      ref={setRefs}
      data-paper-root="true"
      className="relative bg-white shadow-xl mx-auto"
      style={{
        width: mmToPx(paperWidth),
        height: mmToPx(paperHeight),
      }}
    >
      <MarginsGuide margins={margins} />

      {/* Region Visual Boundaries - Separated from content to avoid positioning issues */}
      {regionRenderData.map((region) => (
        <div
          key={`guide-${region.id}`}
          className={`absolute w-full box-border pointer-events-none ${
            region.type === 'table'
              ? 'border-b border-dashed border-gray-300'
              : region.id !== regions[regions.length - 1].id
                ? 'border-b border-dashed border-gray-300'
                : ''
          }`}
          style={{
            top: mmToPx(region.top),
            height: mmToPx(region.height),
          }}
        />
      ))}

      {/* Region Content */}
      {regionRenderData.map((region, regionIndex) => {
        const isSelected = selectedItemIdx?.region === region.id

        return (
          <React.Fragment key={region.id}>
            {region.type === 'table' ? (
              /* Table Region needs a container for global positioning of the block */
              <div
                className="absolute z-0"
                style={{
                  top: mmToPx(region.top),
                  height: mmToPx(region.height),
                  left: mmToPx(margins?.left || 0),
                  right: mmToPx(margins?.right || 0),
                }}
              >
                {region.data &&
                  (() => {
                    const plugin = componentRegistry.get('table')
                    const Content =
                      plugin?.render ||
                      (() => <div>Table Plugin Not Found</div>)
                    const tableItemAdapter = {
                      ...region.data,
                      type: 'table',
                      rows: data.list,
                    } as any

                    return (
                      <Content
                        item={tableItemAdapter}
                        data={data}
                        isSelected={isSelected}
                      />
                    )
                  })()}
              </div>
            ) : (
              /* Free Layout Items: Rendered directly as children of Paper (absolute positioning) */
              <>
                {region.items?.map((item, index) => {
                  const plugin = componentRegistry.get(item.type)
                  const Content = plugin?.render || (() => <div>Unknown</div>)
                  return (
                    <DraggableItem
                      key={`${region.id}-${index}`}
                      item={item} // item.y is absolute paper coordinate
                      index={index}
                      region={region.id as any}
                      isSelected={
                        selectedItemIdx?.region === region.id &&
                        selectedItemIdx?.index === index
                      }
                      onDragStart={onItemDragStart}
                      onDragEnd={onItemDragEnd}
                      onClick={() =>
                        onItemDragStart(index, region.id as any, item.x, item.y)
                      }
                      onResizeStart={
                        onItemResizeStart
                          ? (direction, e) =>
                              onItemResizeStart(
                                index,
                                region.id as any,
                                direction,
                                e,
                                item.x,
                                item.y,
                                item.width,
                                item.height
                              )
                          : undefined
                      }
                    >
                      <Content
                        item={item}
                        data={data}
                        isSelected={
                          selectedItemIdx?.region === region.id &&
                          selectedItemIdx?.index === index
                        }
                      />
                    </DraggableItem>
                  )
                })}
              </>
            )}

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
