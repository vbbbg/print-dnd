import React from 'react'
import { EditorItem } from '../types/editor'
import { mmToPx } from '../constants/units'

interface DraggableItemProps {
  item: EditorItem
  isSelected?: boolean
  onMouseDown?: (e: React.MouseEvent) => void
  onClick?: () => void
}

export const DraggableItem: React.FC<DraggableItemProps> = ({
  item,
  isSelected,
  onMouseDown,
}) => {
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

  return (
    <div
      style={style}
      onMouseDown={onMouseDown}
      className={`border border-blue-200 hover:border-blue-400 border-dashed box-border flex items-center ${
        item.horizontalAlignment === 'center'
          ? 'justify-center'
          : item.horizontalAlignment === 'right'
            ? 'justify-end'
            : 'justify-start'
      } ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
      title={item.name || item.field}
    >
      {item.value || item.alias || item.name}
    </div>
  )
}
