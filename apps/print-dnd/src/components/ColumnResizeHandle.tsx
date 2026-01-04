import React, { useEffect } from 'react'
import { useDrag } from 'react-dnd'
import { getEmptyImage } from 'react-dnd-html5-backend'

interface ColumnResizeHandleProps {
  colIndex: number
  initialWidths: { left: number; right: number }
  minWidths: { left: number; right: number }
  className?: string
}

export const ColumnResizeHandle: React.FC<ColumnResizeHandleProps> = ({
  colIndex,
  initialWidths,
  minWidths,
  className,
}) => {
  const [{ isDragging }, dragRef, preview] = useDrag({
    type: 'RESIZE_COLUMN_HANDLE',
    item: () => {
      return {
        type: 'RESIZE_COLUMN_HANDLE',
        colIndex,
        initialWidths,
        minWidths,
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
      className={className}
      title="Drag to resize column"
      style={{
        cursor: 'col-resize',
        opacity: isDragging ? 0 : undefined, // Hide original handle while dragging? Or keep visible?
        // Usually handles stay visible or dim. Let's keep it visible but maybe dimmed.
        // Actually for columns, seeing the handle move is confusing if it's not following mouse perfectly.
        // Since we update column width in real-time, the handle WILL follow.
      }}
      onClick={(e) => {
        e.stopPropagation()
      }}
    />
  )
}
