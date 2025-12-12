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
  onClick,
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
    border: isSelected ? '1px solid blue' : '1px solid transparent',
    // Debug visual
    // backgroundColor: 'rgba(0, 0, 255, 0.1)',
  }

  return (
    <div
      style={style}
      onMouseDown={onMouseDown}
      onClick={onClick}
      className={`hover:border-blue-300 hover:border-dashed box-border flex items-center ${
        item.horizontalAlignment === 'center'
          ? 'justify-center'
          : item.horizontalAlignment === 'right'
            ? 'justify-end'
            : 'justify-start'
      }`}
      title={item.name || item.field}
    >
      {item.value || item.alias || item.name}
    </div>
  )
}
