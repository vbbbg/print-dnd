import React, { useEffect } from 'react'
import { useDrag } from 'react-dnd'
import { getEmptyImage } from 'react-dnd-html5-backend'

interface ResizeHandleProps {
  top: number
  regionId: string
  initialNextRegionTop: number // This handle controls the next region's top basically?
  // Wait, current logic: handle at bottom of region X.
  // Dragging it changes region X+1 top.
  // So we pass initialNextRegionTop?
  // Actually, 'top' passed to this component IS (region.top + region.height) of current region.
  // Which IS nextRegion.top (if contiguous).
  // Let's pass 'nextRegion.top' as 'initialNextRegionTop'.
  // But wait, Paper passes 'top' calculated from current region.
  // We need to pass the ID of the region boundaries we are manipulating?
  // Current logic: `onResizeStart(region.id)`
  // `useGlobalDrag` finds region by ID, then modifies region[index+1].
  // So we just need regionId of the CURRENT region (the one ABOVE the handle).
  // And we capture 'nextRegion.top' at drag start.
  // But we can't capture state inside this component easily unless passed.
  // We can pass `initialTop` (handle's current top) as the baseline.

  // Let's pass `regionId` and standard `top` (visual).
  // And `initialNextRegionTop` if available, or just use `top`.

  className?: string
}

export const ResizeHandle: React.FC<ResizeHandleProps> = ({
  top,
  regionId,
  initialNextRegionTop,
  className,
}) => {
  const [_, dragRef, preview] = useDrag({
    type: 'RESIZE_REGION_HANDLE',
    item: () => {
      // We capture the initial 'top' (which corresponds to next region top)
      return {
        type: 'RESIZE_REGION_HANDLE',
        regionId, // This is the ID of the region ABOVE the handle
        initialNextRegionTop, // Visual top IS the boundary line
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
      className={`${className} absolute right-0 w-8 h-6 -mr-8 -mt-3 cursor-ns-resize z-50 flex items-center justify-center`}
      style={{ top: top }}
      onClick={(e) => e.stopPropagation()}
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
    </div>
  )
}
