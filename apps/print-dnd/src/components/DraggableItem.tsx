import React, { useState } from 'react'
import { EditorItem } from '../types/editor'
import { mmToPx } from '../constants/units'
import { ResizeHandles, ResizeDirection } from './ResizeHandles'

interface DraggableItemProps {
  item: EditorItem
  isSelected?: boolean
  onMouseDown?: (e: React.MouseEvent) => void
  onClick?: () => void
  onResizeStart?: (direction: ResizeDirection, e: React.MouseEvent) => void
  data?: Record<string, any>
}

export const DraggableItem: React.FC<DraggableItemProps> = ({
  item,
  isSelected,
  onMouseDown,
  onResizeStart,
  data = {},
}) => {
  const [isHovered, setIsHovered] = useState(false)

  // Style based on item properties
  const style: React.CSSProperties = {
    position: 'absolute',
    left: mmToPx(item.x),
    top: mmToPx(item.y),
    width: mmToPx(item.width),
    height: mmToPx(item.height),
    fontSize: item.fontSize ? `${item.fontSize}px` : undefined,
    fontFamily: item.fontFamily,
    color: item.fontColor,
    fontWeight: item.bold ? 'bold' : 'normal',
    fontStyle: item.italic ? 'italic' : 'normal',
    textDecoration: item.underline ? 'underline' : 'none',
    textAlign: item.horizontalAlignment,
    lineHeight: '1.2', // default
    cursor: 'move',
  }

  const showHandles = (isHovered || isSelected) && onResizeStart

  return (
    <div
      style={style}
      onMouseDown={onMouseDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`border border-blue-200 hover:border-blue-400 border-dashed box-border flex items-center ${
        item.horizontalAlignment === 'center'
          ? 'justify-center'
          : item.horizontalAlignment === 'right'
            ? 'justify-end'
            : 'justify-start'
      }`}
      title={item.name || item.field}
    >
      {item.field && data[item.field]
        ? `${item.alias || item.name}: ${data[item.field]}`
        : item.alias || item.value || item.name}
      {showHandles && <ResizeHandles onResizeStart={onResizeStart} />}
    </div>
  )
}
