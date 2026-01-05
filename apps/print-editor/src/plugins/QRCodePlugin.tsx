import React from 'react'
import {
  ComponentPlugin,
  ComponentRenderProps,
  SettingsPanelProps,
} from '../core/ComponentRegistry'
import { ItemSettingsPanel } from '../components/ItemSettingsPanel'

// In a real implementation, we'd use a library like 'qrcode.react'.
// For this refactor demo, we'll render a placeholder that looks like a QR code.
const QRCodeRender: React.FC<ComponentRenderProps> = ({ item }) => {
  return (
    <div className="w-full h-full border-2 border-black flex items-center justify-center bg-white relative overflow-hidden">
      {/* Mock QR Pattern */}
      <div className="absolute inset-2 border-4 border-black">
        <div className="absolute top-1 left-1 w-2 h-2 bg-black"></div>
        <div className="absolute top-1 right-1 w-2 h-2 bg-black"></div>
        <div className="absolute bottom-1 left-1 w-2 h-2 bg-black"></div>
      </div>
      <span className="text-[8px] font-mono z-10 bg-white px-1">QR CODE</span>
    </div>
  )
}

const QRCodeSettingsPanel: React.FC<SettingsPanelProps> = ({
  item,
  onChange,
}) => {
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <label className="text-sm text-gray-600 font-bold block mb-1">
          二维码内容
        </label>
        <input
          type="text"
          value={item.value || ''}
          onChange={(e) => onChange({ value: e.target.value })}
          className="border rounded px-2 py-1 text-sm w-full"
          placeholder="Content..."
        />
      </div>
      <div className="flex-1 overflow-y-auto">
        <ItemSettingsPanel item={item} onChange={onChange} />
      </div>
    </div>
  )
}

export const QRCodePlugin: ComponentPlugin = {
  type: 'qrcode',
  name: '二维码',
  defaultWidth: 30, // mm
  defaultHeight: 30, // mm
  render: QRCodeRender,
  settingsPanel: QRCodeSettingsPanel,
  defaultData: {
    type: 'qrcode',
    // Note: we need to cast 'qrcode' to any if Typescript complains strictly about 'text'|'image'|'table'
    // Ideally we update EditorItem union type
    value: '123456789',
  } as any,
}
