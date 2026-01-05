import React from 'react'
import { EditorState } from '../types/editor'
import { JsonField } from '../types/fields'

import { ScrollArea } from '@/components/ui/scroll-area'
import { useFieldSettings } from '../hooks/useFieldSettings'

interface FieldSettingsPanelProps {
  state: EditorState
  onChange: (updates: Partial<EditorState>) => void
}

export const FieldSettingsPanel: React.FC<FieldSettingsPanelProps> = ({
  state,
  onChange,
}) => {
  const {
    headerFields,
    isHeaderFieldActive,
    toggleHeaderField,
    bodyFields,
    isBodyFieldActive,
    toggleBodyField,
    footerFields,
    isFooterFieldActive,
    toggleFooterField,
  } = useFieldSettings({ state, onChange })

  const renderFieldButton = (
    field: JsonField,
    isActive: boolean,
    onClick: () => void
  ) => {
    return (
      <button
        key={field.value}
        onClick={onClick}
        className={`
          flex items-center justify-center p-2 rounded border text-xs font-medium transition-all
          ${
            isActive
              ? 'bg-blue-50 border-blue-200 text-blue-600 shadow-sm'
              : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
          }
        `}
        title={field.key}
      >
        <span className="truncate">{field.key}</span>
        {isActive && (
          <div className="ml-1 w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
        )}
      </button>
    )
  }

  return (
    <div className="h-full flex flex-col bg-white">
      <ScrollArea className="flex-1">
        <div className="p-4 flex flex-col gap-6">
          {/* Header Fields Section */}
          <div>
            <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center">
              <span className="w-1 h-4 bg-blue-500 mr-2 rounded-full"></span>
              表头字段 (Header)
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {headerFields.map((field) =>
                renderFieldButton(field, isHeaderFieldActive(field.value), () =>
                  toggleHeaderField(field)
                )
              )}
            </div>
          </div>

          {/* Body Fields Section */}
          <div>
            <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center">
              <span className="w-1 h-4 bg-green-500 mr-2 rounded-full"></span>
              表体字段 (Body)
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {bodyFields.map((field) =>
                renderFieldButton(field, isBodyFieldActive(field.value), () =>
                  toggleBodyField(field)
                )
              )}
            </div>
          </div>

          {/* Footer Fields Section */}
          <div>
            <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center">
              <span className="w-1 h-4 bg-purple-500 mr-2 rounded-full"></span>
              表尾字段 (Footer)
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {footerFields.map((field) =>
                renderFieldButton(field, isFooterFieldActive(field.value), () =>
                  toggleFooterField(field)
                )
              )}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
