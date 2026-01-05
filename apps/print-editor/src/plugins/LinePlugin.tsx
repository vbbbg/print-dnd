import React from 'react'
import {
  ComponentPlugin,
  ComponentRenderProps,
  SettingsPanelProps,
} from '../core/ComponentRegistry'
import { ItemSettingsPanel } from '../components/ItemSettingsPanel'

const LineRender: React.FC<ComponentRenderProps> = ({ item }) => {
  // Determine if horizontal or vertical based on aspect ratio?
  // Or just fill the box. Since it's a "box" based item, user drags the box.
  // We can render a line in the center.

  const isHorizontal = item.width >= item.height

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div
        style={{
          width: isHorizontal ? '100%' : '1px',
          height: isHorizontal ? '1px' : '100%',
          backgroundColor: item.fontColor || '#000',
        }}
      />
    </div>
  )
}

const LineSettingsPanel: React.FC<SettingsPanelProps> = ({
  item,
  onChange,
}) => {
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <label className="text-sm text-gray-600 font-bold block mb-1">
          线条设置
        </label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <span className="text-xs">颜色</span>
            <input
              type="color"
              value={item.fontColor || '#000000'}
              onChange={(e) => onChange({ fontColor: e.target.value })}
              className="h-6 w-8 border p-0"
            />
          </label>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <ItemSettingsPanel item={item} onChange={onChange} />
      </div>
    </div>
  )
}

export const LinePlugin: ComponentPlugin = {
  type: 'line',
  name: '直线',
  defaultWidth: 50,
  defaultHeight: 5,
  render: LineRender,
  settingsPanel: LineSettingsPanel,
  defaultData: {
    type: 'line',
    fontColor: '#000000',
  } as any,
}
