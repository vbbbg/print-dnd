import React, { createContext, useContext } from 'react'
import { ResizeDirection } from '../components/ResizeHandles'
import { Guide } from '../types/editor'

export interface InteractionHandler {
  onResizeStart: (regionId: string, e: React.MouseEvent) => void
  onItemDragStart: (
    index: number,
    regionId: string,
    itemX: number,
    itemY: number
  ) => void
  onItemDragMove?: (deltaX: number, deltaY: number) => void
  onItemDragEnd?: () => void
  onItemResizeStart?: (
    index: number,
    regionId: string,
    direction: ResizeDirection,
    e: React.MouseEvent,
    itemX: number,
    itemY: number,
    itemWidth: number,
    itemHeight: number
  ) => void
  onColumnResizeStart?: any
}

export interface EditorContextType {
  handlers: InteractionHandler
  data: Record<string, any>
  guides?: Guide[]
}

const EditorContext = createContext<EditorContextType | null>(null)

export const EditorProvider: React.FC<{
  value: EditorContextType
  children: React.ReactNode
}> = ({ value, children }) => {
  return (
    <EditorContext.Provider value={value}>{children}</EditorContext.Provider>
  )
}

export const useEditorContext = () => {
  const context = useContext(EditorContext)
  if (!context) {
    throw new Error('useEditorContext must be used within an EditorProvider')
  }
  return context
}
