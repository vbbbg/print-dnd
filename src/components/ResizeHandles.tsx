import React from 'react'

export type ResizeDirection = 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw'

interface ResizeHandlesProps {
  onResizeStart: (direction: ResizeDirection, e: React.MouseEvent) => void
}

const HANDLE_SIZE = 8 // pixels

const handles: Array<{
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

export const ResizeHandles: React.FC<ResizeHandlesProps> = ({
  onResizeStart,
}) => {
  return (
    <>
      {handles.map(({ direction, cursor, style }) => (
        <div
          key={direction}
          className="absolute bg-white border-2 border-blue-500 rounded-sm hover:bg-blue-100"
          style={{
            ...style,
            width: HANDLE_SIZE,
            height: HANDLE_SIZE,
            cursor,
            zIndex: 100,
          }}
          onMouseDown={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onResizeStart(direction, e)
          }}
        />
      ))}
    </>
  )
}
