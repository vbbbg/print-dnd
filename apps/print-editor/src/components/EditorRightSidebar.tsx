import React, { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { EditorState } from '../types/editor'
import { componentRegistry } from '../core/ComponentRegistry'
import { ItemSettingsPanel } from './ItemSettingsPanel'
import { TableSettingsPanel } from './TableSettingsPanel'

export interface EditorRightSidebarProps {
  selectedItemIdx: { region: string; index: number } | null
  editorState: EditorState
  // We can pass the derived object or the raw state. Passing raw state is more flexible.
  // But wait, TemplateEditor has logic to derive selectedItem and handleTableUpdate/handleItemUpdate.
  // We should pass the update handlers.
  onItemUpdate: (updates: any) => void
  width?: string
  className?: string
  style?: React.CSSProperties
}

export const EditorRightSidebar: React.FC<EditorRightSidebarProps> = ({
  selectedItemIdx,
  editorState,
  onItemUpdate,
  width = 'w-72',
  className,
  style,
}) => {
  const [isOpen, setIsOpen] = useState(true)

  // Derive selected item from state
  const selectedItem = React.useMemo(() => {
    if (!selectedItemIdx) return null
    const { region: regionId, index } = selectedItemIdx

    // Find region
    const targetRegion = editorState.regions.find((r) => r.id === regionId)
    // index is number, data[index]
    if (
      targetRegion &&
      Array.isArray(targetRegion.data) &&
      targetRegion.data[index]
    ) {
      return targetRegion.data[index]
    }

    return null
  }, [selectedItemIdx, editorState])

  return (
    <div
      className={`${isOpen ? width : 'w-0'} bg-white transition-all duration-300 relative flex flex-col ${className || ''}`}
      style={style}
    >
      <div
        className={`flex-1 overflow-hidden ${isOpen ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200 h-full`}
      >
        {(() => {
          if (!selectedItemIdx) {
            return (
              <div className="flex flex-col h-full">
                <h3 className="font-bold text-lg border-b p-4 mb-4">
                  组件属性
                </h3>
                <div className="text-sm text-gray-500 text-center py-10">
                  请选择一个组件以编辑属性
                </div>
              </div>
            )
          }

          const { region: regionId } = selectedItemIdx
          const region = editorState.regions.find((r) => r.id === regionId)

          if (region?.type === 'table') {
            // Temporary adapter: treat bodyItems (TableData) as an EditorItem of type 'table'
            const tableItemAdapter = {
              ...(region.data && region.data[0] ? region.data[0] : {}),
              type: 'table',
            } as any
            const plugin = componentRegistry.get('table')
            const SettingsPanel = plugin?.settingsPanel

            if (SettingsPanel) {
              return (
                <SettingsPanel
                  item={tableItemAdapter}
                  onChange={onItemUpdate}
                />
              )
            }
            return (
              <TableSettingsPanel
                data={tableItemAdapter}
                onChange={onItemUpdate}
              />
            )
          }

          if (selectedItem) {
            const plugin = componentRegistry.get(selectedItem.type)
            const SettingsPanel = plugin?.settingsPanel || ItemSettingsPanel
            return <SettingsPanel item={selectedItem} onChange={onItemUpdate} />
          }

          return null
        })()}
      </div>

      {/* Toggle Button Right */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-12 bg-white border border-gray-200 rounded-l-lg shadow-sm flex items-center justify-center cursor-pointer hover:bg-gray-50 z-50 text-gray-500 hover:text-gray-700"
        style={{
          left: '-24px',
        }}
        title={isOpen ? 'Close Sidebar' : 'Open Sidebar'}
      >
        {isOpen ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>
    </div>
  )
}
