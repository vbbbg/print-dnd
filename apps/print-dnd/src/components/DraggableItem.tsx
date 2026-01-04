import React, { useState, useEffect } from 'react'
import { useDrag } from 'react-dnd'
import { getEmptyImage } from 'react-dnd-html5-backend'
import { EditorItem } from '../types/editor'
import { mmToPx } from '../constants/units'
import { ResizeHandles } from './ResizeHandles'

interface DraggableItemProps {
  item: EditorItem
  index: number
  region: 'title' | 'header' | 'footer'
  isSelected?: boolean
  onClick?: () => void
  onDragStart?: (
    index: number,
    region: 'title' | 'header' | 'footer',
    x: number,
    y: number
  ) => void
  onDragEnd?: () => void
  children?: React.ReactNode
}

export const DraggableItem: React.FC<DraggableItemProps> = ({
  item,
  index,
  region,
  isSelected,
  onClick,
  onDragStart,
  onDragEnd,
  children,
}) => {
  const [isHovered, setIsHovered] = useState(false)

  const [{ isDragging }, dragRef, preview] = useDrag({
    type: 'DRAGGABLE_ITEM',
    item: () => {
      // Trigger the start handler to set initial state/guides
      onDragStart?.(index, region, item.x, item.y)
      return { type: 'DRAGGABLE_ITEM', index, region }
    },
    end: () => {
      onDragEnd?.()
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true })
  }, [preview])

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

  const showHandles = (isHovered || isSelected) && !isDragging

  return (
    <div
      ref={dragRef}
      style={style}
      // Remove onMouseDown as drag handles it.
      // Keep onClick for selection?
      // useDrag handles mouse down.
      // We can add onClick to handle selection if drag didn't occur.
      onClick={onClick}
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
      {children}
      {showHandles && (
        <ResizeHandles item={item} regionId={region} index={index} />
      )}
    </div>
  )
}
