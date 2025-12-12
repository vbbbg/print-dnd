import React from 'react'

interface ResizeHandleProps {
  top: number
  onMouseDown: (e: React.MouseEvent) => void
  className?: string
}

export const ResizeHandle: React.FC<ResizeHandleProps> = ({
  top,
  onMouseDown,
  className,
}) => {
  return (
    <div
      onMouseDown={onMouseDown}
      className={`${className} absolute left-0 right-0 h-4 cursor-ns-resize z-10 bg-transparent flex items-center justify-center -mt-2`}
      style={{ top: top }}
    >
      {/* Visual indicator (optional, makes it easier to see) */}
      {/*<div className="w-full h-px bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />*/}
    </div>
  )
}
