import React, { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EditorState } from '../types/editor'
import { BasicSettingsCard } from './BasicSettingsCard'
import { FieldSettingsPanel } from './FieldSettingsPanel'

export interface EditorLeftSidebarProps {
  state: EditorState
  onChange: (updates: Partial<EditorState>) => void
  width?: string
  className?: string
  style?: React.CSSProperties
}

export const EditorLeftSidebar: React.FC<EditorLeftSidebarProps> = ({
  state,
  onChange,
  width = 'w-72',
  className,
  style,
}) => {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <div
      className={`${isOpen ? width : 'w-0'} bg-white border-r transition-all duration-300 relative flex flex-col ${className || ''}`}
      style={style}
    >
      <div
        className={`flex-1 overflow-hidden ${isOpen ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200 flex flex-col`}
      >
        <Tabs
          defaultValue="settings"
          className="flex-1 flex flex-col overflow-hidden"
        >
          <div className="px-4 pt-2 border-b">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="settings">基础设置</TabsTrigger>
              <TabsTrigger value="fields">字段设置</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent
            value="settings"
            className="flex-1 overflow-hidden p-0 m-0 data-[state=inactive]:hidden"
          >
            <BasicSettingsCard state={state} onChange={onChange} />
          </TabsContent>

          <TabsContent
            value="fields"
            className="flex-1 overflow-hidden p-0 m-0 data-[state=inactive]:hidden"
          >
            <FieldSettingsPanel state={state} onChange={onChange} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Toggle Button Left */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-12 bg-white border border-gray-200 rounded-r-lg shadow-sm flex items-center justify-center cursor-pointer hover:bg-gray-50 z-50 text-gray-500 hover:text-gray-700"
        style={{
          right: '-24px',
        }}
        title={isOpen ? 'Close Sidebar' : 'Open Sidebar'}
      >
        {isOpen ? (
          <ChevronLeft className="w-4 h-4" />
        ) : (
          <ChevronRight className="w-4 h-4" />
        )}
      </button>
    </div>
  )
}
