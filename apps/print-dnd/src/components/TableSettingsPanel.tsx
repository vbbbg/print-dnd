import React from 'react'
import { TableData } from '../types/editor'

interface TableSettingsPanelProps {
  data: TableData
  onChange: (updates: Partial<TableData>) => void
}

export const TableSettingsPanel: React.FC<TableSettingsPanelProps> = ({
  data,
  onChange,
}) => {
  return (
    <div className="flex flex-col gap-4 p-4 h-full overflow-y-auto">
      <h3 className="font-bold text-lg border-b pb-2">表格设置</h3>

      {/* Row Toggles */}
      <div className="flex flex-col gap-3">
        <label className="text-sm text-gray-600 font-bold">汇总行</label>

        <div className="flex items-center justify-between">
          <span className="text-sm">显示页小计</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={data.showSubtotal || false}
              onChange={(e) => onChange({ showSubtotal: e.target.checked })}
            />
            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm">显示合计</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={data.showTotal || false}
              onChange={(e) => onChange({ showTotal: e.target.checked })}
            />
            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>
    </div>
  )
}
