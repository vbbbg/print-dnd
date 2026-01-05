import React from 'react'
import {
  ComponentPlugin,
  ComponentRenderProps,
  SettingsPanelProps,
} from '../core/ComponentRegistry'
import { ItemSettingsPanel } from '../components/ItemSettingsPanel'

const ImageRender: React.FC<ComponentRenderProps> = ({ item }) => {
  // If value is a URL, render img. If empty, render placeholder
  if (!item.value) {
    return (
      <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 text-xs">
        Image
      </div>
    )
  }
  return (
    <img
      src={item.value}
      alt={item.name}
      className="w-full h-full object-contain pointer-events-none"
    />
  )
}

const ImageSettingsPanel: React.FC<SettingsPanelProps> = ({
  item,
  onChange,
}) => {
  // We compose the basic settings panel but should add Image URL input locally or extend ItemSettingsPanel
  // For now we assume ItemSettingsPanel handles basic layout properties
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <label className="text-sm text-gray-600 font-bold block mb-1">
          图片地址
        </label>
        <input
          type="text"
          value={item.value || ''}
          onChange={(e) => onChange({ value: e.target.value })}
          className="border rounded px-2 py-1 text-sm w-full"
          placeholder="https://..."
        />
      </div>
      <div className="flex-1 overflow-y-auto">
        <ItemSettingsPanel item={item} onChange={onChange} />
      </div>
    </div>
  )
}

export const ImagePlugin: ComponentPlugin = {
  type: 'image',
  name: '图片',
  defaultWidth: 50,
  defaultHeight: 50,
  render: ImageRender,
  settingsPanel: ImageSettingsPanel,
  defaultData: {
    type: 'image',
    value: '',
  },
}
