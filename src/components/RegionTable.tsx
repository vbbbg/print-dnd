import React from 'react'
import { TableData } from '../types/editor'

interface RegionTableProps {
  data: TableData
}

export const RegionTable: React.FC<RegionTableProps> = ({ data }) => {
  // Calculate total width units from columns to calculate percentage widths
  const totalWidth = data.cols.reduce(
    (sum, col) => sum + (col.visible ? col.width : 0),
    0
  )

  return (
    <div
      className="w-full h-full border border-gray-400 box-border bg-white overflow-hidden flex flex-col"
      style={{
        // Use generic table styling
        fontSize: '12px',
      }}
    >
      {/* Table Header */}
      <div className="flex border-b border-gray-400 bg-gray-50">
        {data.cols.map((col, index) => {
          if (!col.visible) return null
          const widthPercent = (col.width / totalWidth) * 100
          return (
            <div
              key={col.colname}
              className={`p-1 border-r border-gray-300 text-center font-bold ${index === data.cols.length - 1 ? 'border-r-0' : ''}`}
              style={{ width: `${widthPercent}%` }}
            >
              {col.title || col.alias}
            </div>
          )
        })}
      </div>

      {/* Table Body (Placeholder rows) */}
      <div className="flex-1 overflow-auto">
        {[1, 2, 3].map((row) => (
          <div
            key={row}
            className="flex border-b border-gray-200 last:border-0"
          >
            {data.cols.map((col, index) => {
              if (!col.visible) return null
              const widthPercent = (col.width / totalWidth) * 100
              return (
                <div
                  key={`${row}-${col.colname}`}
                  className={`p-1 border-r border-gray-200 text-center ${index === data.cols.length - 1 ? 'border-r-0' : ''}`}
                  style={{ width: `${widthPercent}%`, height: '24px' }}
                >
                  {/* Empty cell content */}
                </div>
              )
            })}
          </div>
        ))}
        {/* Fill remaining space visual if needed */}
      </div>
    </div>
  )
}
