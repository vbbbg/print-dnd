import React from 'react'
import { EditorState } from '../types/editor'

interface BasicSettingsCardProps {
  state: EditorState
  onChange: (updates: Partial<EditorState>) => void
}

export const BasicSettingsCard: React.FC<BasicSettingsCardProps> = ({
  state,
  onChange,
}) => {
  const handleSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const type = e.target.value
    const definition = state.paperDefinitions.find((d) => d.type === type)

    if (definition && type !== 'custom') {
      onChange({
        paperType: type as any,
        paperWidth: definition.width,
        paperHeight: definition.height,
      })
    } else {
      onChange({
        paperType: 'custom',
      })
    }
  }

  const handleCustomSizeChange = (
    key: 'paperWidth' | 'paperHeight',
    value: number
  ) => {
    onChange({
      [key]: value,
      paperType: 'custom',
    })
  }

  const margins = state.margins || { top: 0, bottom: 0, left: 0, right: 0 }

  const handleMarginChange = (
    key: keyof EditorState['margins'],
    value: number
  ) => {
    onChange({
      margins: {
        ...margins,
        [key]: value,
      },
    })
  }

  return (
    <div className="flex flex-col gap-4 p-4 h-full overflow-y-auto">
      <h3 className="font-bold text-lg border-b pb-2">基础设置</h3>

      {/* Template Name */}
      <div className="flex flex-col gap-1">
        <label className="text-sm text-gray-600 font-bold">模板名称</label>
        <input
          type="text"
          value={state.name || ''}
          onChange={(e) => onChange({ name: e.target.value })}
          className="border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="请输入模板名称"
        />
      </div>

      {/* Paper Size */}
      <div className="flex flex-col gap-2">
        <label className="text-sm text-gray-600 font-bold">纸张规格</label>
        <div className="flex flex-col gap-2">
          <select
            value={state.paperType || 'custom'}
            onChange={handleSizeChange}
            className="border rounded px-2 py-1 text-sm w-full"
          >
            {state.paperDefinitions.map((def) => (
              <option key={def.type} value={def.type}>
                {def.name}
              </option>
            ))}
          </select>

          {state.paperType === 'custom' && (
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col">
                <label className="text-xs text-gray-500">纸张宽度 (mm)</label>
                <input
                  type="number"
                  value={state.paperWidth}
                  onChange={(e) =>
                    handleCustomSizeChange('paperWidth', Number(e.target.value))
                  }
                  className="border rounded px-2 py-1 text-sm"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-xs text-gray-500">纸张高度 (mm)</label>
                <input
                  type="number"
                  value={state.paperHeight}
                  onChange={(e) =>
                    handleCustomSizeChange(
                      'paperHeight',
                      Number(e.target.value)
                    )
                  }
                  className="border rounded px-2 py-1 text-sm"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Margins */}
      <div className="flex flex-col gap-2">
        <label className="text-sm text-gray-600 font-bold">边距 (mm)</label>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col">
            <label className="text-xs text-gray-500">上</label>
            <input
              type="number"
              value={margins.top}
              onChange={(e) =>
                handleMarginChange('top', Number(e.target.value))
              }
              className="border rounded px-2 py-1 text-sm"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-500">下</label>
            <input
              type="number"
              value={margins.bottom}
              onChange={(e) =>
                handleMarginChange('bottom', Number(e.target.value))
              }
              className="border rounded px-2 py-1 text-sm"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-500">左</label>
            <input
              type="number"
              value={margins.left}
              onChange={(e) =>
                handleMarginChange('left', Number(e.target.value))
              }
              className="border rounded px-2 py-1 text-sm"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-500">右</label>
            <input
              type="number"
              value={margins.right}
              onChange={(e) =>
                handleMarginChange('right', Number(e.target.value))
              }
              className="border rounded px-2 py-1 text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
