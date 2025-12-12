import React, { useRef } from 'react'
import { EditorState } from '../types/editor'
import { ResizeHandle } from './ResizeHandle'
import { DraggableItem } from './DraggableItem'
import { RegionTable } from './RegionTable'
import { mmToPx } from '../constants/units'

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
}

export const Paper: React.FC<PaperProps> = ({
  state,
  onResizeStart,
  onItemDragStart,
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
      {/* Title Region Background */}
      <div
        className="absolute w-full border-b border-dashed border-gray-300 box-border"
        style={{
          top: 0,
          height: mmToPx(headerTop),
        }}
      >
        <div className="text-gray-400 text-xs text-center uppercase tracking-wider p-1 pointer-events-none">
          Title Region
        </div>
      </div>

      {/* Header Region Background */}
      <div
        className="absolute w-full border-b border-dashed border-gray-300 box-border"
        style={{
          top: mmToPx(headerTop),
          height: mmToPx(bodyTop - headerTop),
        }}
      >
        <div className="text-gray-400 text-xs text-center uppercase tracking-wider p-1 pointer-events-none">
          Header Region
        </div>
      </div>

      {/* Body Region (Table) */}
      <div
        className="absolute w-full border-b border-dashed border-gray-300 box-border"
        style={{
          top: mmToPx(bodyTop),
          height: mmToPx(footerTop - bodyTop),
        }}
      >
        <div className="absolute inset-0 p-2 z-0">
          {/* Render Table */}
          {bodyItems && <RegionTable data={bodyItems} />}
        </div>
        <div className="text-gray-400 text-xs text-center uppercase tracking-wider p-1 pointer-events-none relative z-10">
          Body Region
        </div>
      </div>

      {/* Footer Region Background */}
      <div
        className="absolute w-full box-border"
        style={{
          top: mmToPx(footerTop),
          height: mmToPx(paperHeight - footerTop),
        }}
      >
        <div className="text-gray-400 text-xs text-center uppercase tracking-wider p-1 pointer-events-none">
          Footer Region
        </div>
      </div>

      {/* Render Items (Global Coordinates) */}
      {titleItems?.map((item, index) => (
        <DraggableItem
          key={`title-${index}`}
          item={item}
          onMouseDown={(e) =>
            onItemDragStart(index, 'title', e, item.x, item.y)
          }
        />
      ))}

      {headerItems?.map((item, index) => (
        <DraggableItem
          key={`header-${index}`}
          item={item}
          onMouseDown={(e) =>
            onItemDragStart(index, 'header', e, item.x, item.y)
          }
        />
      ))}

      {footerItems?.map((item, index) => (
        <DraggableItem
          key={`footer-${index}`}
          item={item}
          onMouseDown={(e) =>
            onItemDragStart(index, 'footer', e, item.x, item.y)
          }
        />
      ))}

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
    </div>
  )
}
