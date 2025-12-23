import React from 'react'
import { TableData } from '../types/editor'
import { pxToMm } from '../constants/units'

interface RegionTableProps {
  data: TableData
  onColumnResizeStart?: (
    index: number,
    e: React.MouseEvent,
    minWidthLeft: number,
    minWidthRight: number
  ) => void
  isSelected?: boolean
  onClick?: () => void
}

export const RegionTable: React.FC<RegionTableProps> = ({
  data,
  onColumnResizeStart,
  isSelected,
  onClick,
}) => {
  const visibleCols = data.cols.filter((col) => col.visible !== false)
  const totalWidth = visibleCols.reduce((sum, col) => sum + col.width, 0)

  const handleResizeStart = (index: number, e: React.MouseEvent) => {
    if (!onColumnResizeStart) return

    // Measure content width using Canvas API to get "max-content" (no wrap) width
    // This is cleaner than DOM cloning/layout thrashing
    const measureTextWidth = (text: string, font: string) => {
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')
      if (!context) return 0
      context.font = font
      return context.measureText(text).width
    }

    const getComputedFont = (el: HTMLElement) => {
      const style = window.getComputedStyle(el)
      return `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`
    }

    // We need to get the actual DOM elements to read their content and computed styles
    // For this, we'll temporarily create a dummy element to get the computed style
    // or, more directly, use the ref if it's still needed for other purposes.
    // Since the original code used contentRefs, we'll assume it's still available
    // and populated for the elements we need to measure.
    const leftEl = document.getElementById(`header-col-${index}`)
    const rightEl = document.getElementById(`header-col-${index + 1}`)

    // Default safe min width (approx 8 units / 30px)
    const DEFAULT_MIN = 8

    let minLeft = DEFAULT_MIN
    let minRight = DEFAULT_MIN

    if (leftEl && leftEl.textContent) {
      const font = getComputedFont(leftEl)
      const textWidth = measureTextWidth(leftEl.textContent, font)
      // Add padding (approx 12px)
      minLeft = Math.max(DEFAULT_MIN, pxToMm(textWidth + 12))
    }

    if (rightEl && rightEl.textContent) {
      const font = getComputedFont(rightEl)
      const textWidth = measureTextWidth(rightEl.textContent, font)
      minRight = Math.max(DEFAULT_MIN, pxToMm(textWidth + 12))
    }

    onColumnResizeStart(index, e, minLeft, minRight)
  }

  return (
    <div
      className={`w-full h-full border box-border bg-white overflow-hidden flex flex-col ${
        isSelected ? 'border-blue-500 border-2' : 'border-gray-400'
      }`}
      style={{
        // Use generic table styling
        fontSize: '12px',
      }}
      onClick={(e) => {
        e.stopPropagation()
        onClick?.()
      }}
    >
      {/* Table Header */}
      <div className="flex border-b border-gray-400 bg-gray-50 relative">
        {visibleCols.map((col, index) => {
          const widthPercent = (col.width / totalWidth) * 100
          const isLast = index === visibleCols.length - 1

          return (
            <div
              key={col.colname}
              className={`p-1 border-r border-gray-300 text-center font-bold relative flex items-center justify-center ${isLast ? 'border-r-0' : ''}`}
              style={{ width: `${widthPercent}%` }}
            >
              <span
                id={`header-col-${index}`}
                className="w-full break-all whitespace-normal leading-tight"
              >
                {col.title || col.alias}
              </span>

              {/* Resize Handle */}
              {!isLast && onColumnResizeStart && (
                <div
                  className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize z-10 hover:bg-blue-400 opacity-0 hover:opacity-50 transition-opacity translate-x-1/2"
                  onMouseDown={(e) => handleResizeStart(index, e)}
                  title="Drag to resize"
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Table Body (Placeholder rows) */}
      <div className="flex-1 overflow-auto">
        {[1, 2, 3].map((row) => (
          <div
            key={row}
            className="flex border-b border-gray-200 last:border-0 min-h-[24px]"
          >
            {visibleCols.map((col, index) => {
              const widthPercent = (col.width / totalWidth) * 100
              const isLast = index === visibleCols.length - 1
              return (
                <div
                  key={`${row}-${col.colname}`}
                  className={`p-1 border-r border-gray-200 text-center flex items-center justify-center ${isLast ? 'border-r-0' : ''}`}
                  style={{ width: `${widthPercent}%` }}
                >
                  {/* Empty cell content */}
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {/* Footer Rows (Subtotal & Total) */}
      <div className="border-t border-gray-400">
        {data.showSubtotal && (
          <div className="flex border-b border-gray-200 min-h-[24px] bg-gray-50">
            <div className="p-1 px-2 font-bold w-full text-right">
              本页小计: ¥0.00
            </div>
          </div>
        )}
        {data.showTotal && (
          <div className="flex min-h-[24px] bg-gray-100">
            <div className="p-1 px-2 font-bold w-full text-right">
              合计: ¥0.00
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
