import React, { useEffect } from 'react'
import { useDrag } from 'react-dnd'
import { getEmptyImage } from 'react-dnd-html5-backend'
import { EditorItem } from '../types/editor'

export type ResizeDirection = 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw'

interface ResizeHandlesProps {
  item: EditorItem
  regionId: string
  index: number
}

const HANDLE_SIZE = 8 // pixels

const handlesConfig: Array<{
  direction: ResizeDirection
  cursor: string
  style: React.CSSProperties
}> = [
  // Corners
  {
    direction: 'nw',
    cursor: 'nwse-resize',
    style: { top: -HANDLE_SIZE / 2, left: -HANDLE_SIZE / 2 },
  },
  {
    direction: 'ne',
    cursor: 'nesw-resize',
    style: { top: -HANDLE_SIZE / 2, right: -HANDLE_SIZE / 2 },
  },
  {
    direction: 'se',
    cursor: 'nwse-resize',
    style: { bottom: -HANDLE_SIZE / 2, right: -HANDLE_SIZE / 2 },
  },
  {
    direction: 'sw',
    cursor: 'nesw-resize',
    style: { bottom: -HANDLE_SIZE / 2, left: -HANDLE_SIZE / 2 },
  },
  // Edges
  {
    direction: 'n',
    cursor: 'ns-resize',
    style: {
      top: -HANDLE_SIZE / 2,
      left: '50%',
      transform: 'translateX(-50%)',
    },
  },
  {
    direction: 'e',
    cursor: 'ew-resize',
    style: {
      top: '50%',
      right: -HANDLE_SIZE / 2,
      transform: 'translateY(-50%)',
    },
  },
  {
    direction: 's',
    cursor: 'ns-resize',
    style: {
      bottom: -HANDLE_SIZE / 2,
      left: '50%',
      transform: 'translateX(-50%)',
    },
  },
  {
    direction: 'w',
    cursor: 'ew-resize',
    style: {
      top: '50%',
      left: -HANDLE_SIZE / 2,
      transform: 'translateY(-50%)',
    },
  },
]

const Handle: React.FC<{
  direction: ResizeDirection
  cursor: string
  style: React.CSSProperties
  item: EditorItem
  regionId: string
  index: number
}> = ({ direction, cursor, style, item, regionId, index }) => {
  const [{ isDragging }, dragRef, preview] = useDrag({
    type: 'RESIZE_HANDLE',
    item: () => {
      return {
        type: 'RESIZE_HANDLE',
        direction,
        item,
        regionId,
        index,
        initialX: item.x,
        initialY: item.y,
        initialWidth: item.width,
        initialHeight: item.height,
      }
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true })
  }, [preview])

  return (
    <div
      ref={dragRef}
      className="absolute bg-white border-2 border-blue-500 rounded-sm hover:bg-blue-100"
      style={{
        ...style,
        width: HANDLE_SIZE,
        height: HANDLE_SIZE,
        cursor,
        zIndex: 100,
        opacity: isDragging ? 0 : 1,
      }}
      onClick={(e) => {
        // Prevent click propagation to item selection
        e.stopPropagation()
      }}
    />
  )
}

export const ResizeHandles: React.FC<ResizeHandlesProps> = ({
  item,
  regionId,
  index,
}) => {
  return (
    <>
      {handlesConfig.map(({ direction, cursor, style }) => (
        <Handle
          key={direction}
          direction={direction}
          cursor={cursor}
          style={style}
          item={item}
          regionId={regionId}
          index={index}
        />
      ))}
    </>
  )
}
