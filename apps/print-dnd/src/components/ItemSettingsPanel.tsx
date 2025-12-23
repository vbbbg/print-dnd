import React from 'react'
import { EditorItem } from '../types/editor'

interface ItemSettingsPanelProps {
  item: EditorItem
  onChange: (updates: Partial<EditorItem>) => void
}

export const ItemSettingsPanel: React.FC<ItemSettingsPanelProps> = ({
  item,
  onChange,
}) => {
  const handleChange = (key: keyof EditorItem, value: any) => {
    onChange({ [key]: value })
  }

  const handleNumberChange = (key: keyof EditorItem, value: string) => {
    const num = parseFloat(value)
    if (!isNaN(num)) {
      handleChange(key, num)
    }
  }

  return (
    <div className="flex flex-col gap-4 p-4 h-full overflow-y-auto">
      <h3 className="font-bold text-lg border-b pb-2">组件属性</h3>

      {/* Content */}
      <div className="flex flex-col gap-2">
        <label className="text-sm text-gray-600 font-bold">字段名称</label>
        <input
          type="text"
          value={item.name || ''}
          readOnly
          className="border rounded px-2 py-1 text-sm w-full bg-gray-100 text-gray-500"
        />
        <div className="flex flex-col">
          <label className="text-xs text-gray-500">别名 (Alias)</label>
          <input
            type="text"
            value={item.alias || ''}
            onChange={(e) => handleChange('alias', e.target.value)}
            className="border rounded px-2 py-1 text-sm w-full"
            placeholder="Alias name"
          />
        </div>
      </div>

      {/* Position & Size */}
      <div className="flex flex-col gap-2">
        <label className="text-sm text-gray-600 font-bold">
          位置与尺寸 (mm)
        </label>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col">
            <label className="text-xs text-gray-500">X</label>
            <input
              type="number"
              value={Math.round(item.x * 10) / 10}
              onChange={(e) => handleNumberChange('x', e.target.value)}
              className="border rounded px-2 py-1 text-sm"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-500">Y</label>
            <input
              type="number"
              value={Math.round(item.y * 10) / 10}
              onChange={(e) => handleNumberChange('y', e.target.value)}
              className="border rounded px-2 py-1 text-sm"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-500">宽 (W)</label>
            <input
              type="number"
              value={Math.round(item.width * 10) / 10}
              onChange={(e) => handleNumberChange('width', e.target.value)}
              className="border rounded px-2 py-1 text-sm"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-500">高 (H)</label>
            <input
              type="number"
              value={Math.round(item.height * 10) / 10}
              onChange={(e) => handleNumberChange('height', e.target.value)}
              className="border rounded px-2 py-1 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Typography */}
      <div className="flex flex-col gap-2">
        <label className="text-sm text-gray-600 font-bold">字体样式</label>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col">
            <label className="text-xs text-gray-500">大小 (px)</label>
            <input
              type="number"
              value={item.fontSize || 9}
              onChange={(e) => handleNumberChange('fontSize', e.target.value)}
              className="border rounded px-2 py-1 text-sm"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-500">字体</label>
            <select
              value={item.fontFamily || 'SimHei'}
              onChange={(e) => handleChange('fontFamily', e.target.value)}
              className="border rounded px-2 py-1 text-sm"
            >
              <option value="SimHei">黑体</option>
              <option value="SimSun">宋体</option>
              <option value="Arial">Arial</option>
              <option value="Times New Roman">Times New Roman</option>
            </select>
          </div>
        </div>

        {/* Alignment & Style Toggles */}
        <div className="flex gap-2 mt-1">
          <button
            onClick={() => handleChange('bold', !item.bold)}
            className={`p-1 border rounded w-8 h-8 flex items-center justify-center ${item.bold ? 'bg-blue-100 border-blue-300 text-blue-600' : 'bg-white hover:bg-gray-50'}`}
            title="Bold"
          >
            B
          </button>
          <button
            onClick={() => handleChange('italic', !item.italic)}
            className={`p-1 border rounded w-8 h-8 flex items-center justify-center italic ${item.italic ? 'bg-blue-100 border-blue-300 text-blue-600' : 'bg-white hover:bg-gray-50'}`}
            title="Italic"
          >
            I
          </button>
          <button
            onClick={() => handleChange('underline', !item.underline)}
            className={`p-1 border rounded w-8 h-8 flex items-center justify-center underline ${item.underline ? 'bg-blue-100 border-blue-300 text-blue-600' : 'bg-white hover:bg-gray-50'}`}
            title="Underline"
          >
            U
          </button>
        </div>
        <div className="flex gap-2 mt-1">
          {/* Horizontal Align */}
          <button
            onClick={() => handleChange('horizontalAlignment', 'left')}
            className={`p-1 border rounded w-8 h-8 flex items-center justify-center ${item.horizontalAlignment === 'left' ? 'bg-blue-100 border-blue-300 text-blue-600' : 'bg-white hover:bg-gray-50'}`}
            title="Align Left"
          >
            L
          </button>
          <button
            onClick={() => handleChange('horizontalAlignment', 'center')}
            className={`p-1 border rounded w-8 h-8 flex items-center justify-center ${item.horizontalAlignment === 'center' ? 'bg-blue-100 border-blue-300 text-blue-600' : 'bg-white hover:bg-gray-50'}`}
            title="Align Center"
          >
            C
          </button>
          <button
            onClick={() => handleChange('horizontalAlignment', 'right')}
            className={`p-1 border rounded w-8 h-8 flex items-center justify-center ${item.horizontalAlignment === 'right' ? 'bg-blue-100 border-blue-300 text-blue-600' : 'bg-white hover:bg-gray-50'}`}
            title="Align Right"
          >
            R
          </button>
        </div>
      </div>
    </div>
  )
}
