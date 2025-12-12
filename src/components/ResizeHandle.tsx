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
      className={`${className} absolute right-0 w-8 h-6 -mr-8 -mt-3 cursor-ns-resize z-50 flex items-center justify-center`}
      style={{ top: top }}
    >
      <div className="w-6 h-6 bg-orange-100 rounded shadow-sm border border-orange-200 flex items-center justify-center text-orange-500 hover:bg-orange-200 transition-colors">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 5L12 19M12 5L18 11M12 5L6 11M12 19L6 13M12 19L18 13"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      {/* Visual Line Guide (dashed orange line extension?) - User image has dashed line. We rely on region border mostly, but can add a guide line if needed. 
          The user image shows the handle ON the dashed line. 
          Our regions have border-bottom.
      */}
    </div>
  )
}
