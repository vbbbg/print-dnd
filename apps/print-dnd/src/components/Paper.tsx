import React, { useRef } from 'react'
import { EditorState, Guide } from '../types/editor'
import { ResizeHandle } from './ResizeHandle'
import { DraggableItem } from './DraggableItem'
import { mmToPx } from '../constants/units'
import { ResizeDirection } from './ResizeHandles'
import { componentRegistry } from '../core/ComponentRegistry'

interface PaperProps {
  state: EditorState
  onResizeStart: (
    region: 'header' | 'body' | 'footer',
    e: React.MouseEvent
  ) => void
  onItemDragStart: (
    index: number,
    region: 'title' | 'header' | 'footer',
    e: React.MouseEvent,
    itemX: number,
    itemY: number
  ) => void
  onItemResizeStart?: (
    index: number,
    region: 'title' | 'header' | 'footer',
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
    region: 'title' | 'header' | 'footer' | 'body'
    index: number
  } | null
  data?: Record<string, any>
  onTableClick?: () => void
}

export const Paper: React.FC<PaperProps> = ({
  state,
  onResizeStart,
  onItemDragStart,
  onItemResizeStart,
  onColumnResizeStart,
  guides,
  selectedItemIdx,
  data = {},
  onTableClick,
}) => {
  const {
    headerTop,
    bodyTop,
    footerTop,
    paperHeight,
    paperWidth,
    titleItems,
    headerItems,
    bodyItems,
    footerItems,
    margins,
  } = state

  const paperRef = useRef<HTMLDivElement>(null)

  return (
    <div
      ref={paperRef}
      data-paper-root="true"
      className="relative bg-white shadow-xl mx-auto"
      style={{
        width: mmToPx(paperWidth),
        height: mmToPx(paperHeight),
      }}
    >
      {/* Margins Guide */}
      {/* Margin Visuals */}
      {margins && (
        <>
          {/* Top Margin */}
          <div
            className="absolute left-0 right-0 top-0 pointer-events-none z-40 bg-gray-200 opacity-30"
            style={{
              height: mmToPx(margins.top),
            }}
          />
          {/* Bottom Margin */}
          <div
            className="absolute left-0 right-0 bottom-0 pointer-events-none z-40 bg-gray-200 opacity-30"
            style={{
              height: mmToPx(margins.bottom),
            }}
          />
          {/* Left Margin */}
          <div
            className="absolute left-0 top-0 bottom-0 pointer-events-none z-40 bg-gray-200 opacity-30"
            style={{
              width: mmToPx(margins.left),
            }}
          />
          {/* Right Margin */}
          <div
            className="absolute right-0 top-0 bottom-0 pointer-events-none z-40 bg-gray-200 opacity-30"
            style={{
              width: mmToPx(margins.right),
            }}
          />
          {/* Dashed Border for Printable Area */}
          <div
            className="absolute pointer-events-none z-50 border-dashed border-gray-400 opacity-50"
            style={{
              top: mmToPx(margins.top),
              bottom: mmToPx(margins.bottom),
              left: mmToPx(margins.left),
              right: mmToPx(margins.right),
              borderWidth: '1px',
            }}
          />
        </>
      )}

      {/* Title Region Background */}
      <div
        className="absolute w-full border-b border-dashed border-gray-300 box-border"
        style={{
          top: 0,
          height: mmToPx(headerTop),
        }}
      />

      {/* Header Region Background */}
      <div
        className="absolute w-full border-b border-dashed border-gray-300 box-border"
        style={{
          top: mmToPx(headerTop),
          height: mmToPx(bodyTop - headerTop),
        }}
      />

      {/* Body Region (Table) */}
      <div
        className="absolute w-full border-b border-dashed border-gray-300 box-border"
        style={{
          top: mmToPx(bodyTop),
          height: mmToPx(footerTop - bodyTop),
        }}
      >
        <div
          className="absolute z-0 top-0 bottom-0"
          style={{
            left: mmToPx(margins?.left || 0),
            right: mmToPx(margins?.right || 0),
          }}
        >
          {/* Render Table (via Plugin) */}
          {bodyItems &&
            (() => {
              const plugin = componentRegistry.get('table')
              const Content =
                plugin?.render || (() => <div>Table Plugin Not Found</div>)
              // Adapter: bodyItems is TableData, we cast it to EditorItem-like structure for the plugin
              const tableItemAdapter = {
                ...bodyItems,
                type: 'table',
                rows: data.list,
              } as any

              return (
                <Content
                  item={tableItemAdapter}
                  data={data} // Pass full data context if needed
                  isSelected={selectedItemIdx?.region === 'body'}
                />
              )
            })()}
        </div>
      </div>

      {/* Footer Region Background */}
      <div
        className="absolute w-full box-border"
        style={{
          top: mmToPx(footerTop),
          height: mmToPx(paperHeight - footerTop),
        }}
      />

      {/* Render Items (Global Coordinates) */}
      {titleItems?.map((item, index) => {
        const plugin = componentRegistry.get(item.type)
        const Content = plugin?.render || (() => <div>Unknown</div>)
        return (
          <DraggableItem
            key={`title-${index}`}
            item={item}
            isSelected={
              selectedItemIdx?.region === 'title' &&
              selectedItemIdx?.index === index
            }
            onMouseDown={(e) =>
              onItemDragStart(index, 'title', e, item.x, item.y)
            }
            onResizeStart={
              onItemResizeStart
                ? (direction, e) =>
                    onItemResizeStart(
                      index,
                      'title',
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
                selectedItemIdx?.region === 'title' &&
                selectedItemIdx?.index === index
              }
            />
          </DraggableItem>
        )
      })}

      {headerItems?.map((item, index) => {
        const plugin = componentRegistry.get(item.type)
        const Content = plugin?.render || (() => <div>Unknown</div>)
        return (
          <DraggableItem
            key={`header-${index}`}
            item={item}
            isSelected={
              selectedItemIdx?.region === 'header' &&
              selectedItemIdx?.index === index
            }
            onMouseDown={(e) =>
              onItemDragStart(index, 'header', e, item.x, item.y)
            }
            onResizeStart={
              onItemResizeStart
                ? (direction, e) =>
                    onItemResizeStart(
                      index,
                      'header',
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
                selectedItemIdx?.region === 'header' &&
                selectedItemIdx?.index === index
              }
            />
          </DraggableItem>
        )
      })}

      {footerItems?.map((item, index) => {
        const plugin = componentRegistry.get(item.type)
        const Content = plugin?.render || (() => <div>Unknown</div>)
        return (
          <DraggableItem
            key={`footer-${index}`}
            item={item}
            isSelected={
              selectedItemIdx?.region === 'footer' &&
              selectedItemIdx?.index === index
            }
            onMouseDown={(e) =>
              onItemDragStart(index, 'footer', e, item.x, item.y)
            }
            onResizeStart={
              onItemResizeStart
                ? (direction, e) =>
                    onItemResizeStart(
                      index,
                      'footer',
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
                selectedItemIdx?.region === 'footer' &&
                selectedItemIdx?.index === index
              }
            />
          </DraggableItem>
        )
      })}

      {/* Resize Handles */}
      {/* Higher z-index for upper handles ensures they are clickable even if they overlap with lower handles */}
      <ResizeHandle
        top={mmToPx(headerTop)}
        onMouseDown={(e) => onResizeStart('header', e)}
        className="resize-handle-header group z-30"
      />
      <ResizeHandle
        top={mmToPx(bodyTop)}
        onMouseDown={(e) => onResizeStart('body', e)}
        className="resize-handle-body group z-20"
      />
      <ResizeHandle
        top={mmToPx(footerTop)}
        onMouseDown={(e) => onResizeStart('footer', e)}
        className="resize-handle-footer group z-10"
      />

      {/* Alignment Guides */}
      {guides?.map((guide, idx) => {
        const isV = guide.type === 'vertical'
        return (
          <div
            key={`guide-${idx}`}
            className={`absolute bg-blue-500 z-50 pointer-events-none ${isV ? 'w-px h-full' : 'h-px w-full'}`}
            style={{
              left: isV ? mmToPx(guide.pos) : 0,
              top: isV ? 0 : mmToPx(guide.pos),
            }}
          />
        )
      })}
    </div>
  )
}
