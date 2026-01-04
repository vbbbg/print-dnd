import React from 'react'
import { TableItem, TableColumn } from '../types/editor'
import { ColumnResizeHandle } from './ColumnResizeHandle'

interface RegionTableProps {
  data: TableItem
  rows?: any[]
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
  rows = [],
  onColumnResizeStart,
  isSelected,
  onClick,
}) => {
  const visibleCols = data.cols.filter((col) => col.visible !== false)
  const totalWidth = visibleCols.reduce((sum, col) => sum + col.width, 0)

  const displayRows = rows && rows.length > 0 ? rows.slice(0, 2) : []

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
        {visibleCols.map((col: TableColumn, index: number) => {
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
                <ColumnResizeHandle
                  colIndex={index}
                  initialWidths={{
                    left: visibleCols[index].width,
                    right: visibleCols[index + 1].width,
                  }}
                  minWidths={{ left: 8, right: 8 }} // Default min width
                  className="absolute right-0 top-0 bottom-0 w-2 z-10 hover:bg-blue-400 opacity-0 hover:opacity-50 transition-opacity translate-x-1/2"
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Table Body */}
      <div className="flex-1 overflow-auto">
        {displayRows.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className="flex border-b border-gray-200 last:border-0 min-h-[24px]"
          >
            {visibleCols.map((col: TableColumn, index: number) => {
              const widthPercent = (col.width / totalWidth) * 100
              const isLast = index === visibleCols.length - 1
              return (
                <div
                  key={`${rowIndex}-${col.colname}`}
                  className={`p-1 border-r border-gray-200 text-center flex items-center justify-center ${isLast ? 'border-r-0' : ''}`}
                  style={{ width: `${widthPercent}%` }}
                >
                  {row[col.colname]}
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
