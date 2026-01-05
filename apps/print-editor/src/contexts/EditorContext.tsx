import React, { createContext, useContext } from 'react'
import { ResizeDirection } from '../components/ResizeHandles'
import { Guide } from '../types/editor'

export interface InteractionHandler {
  onItemDragStart: (
    index: number,
    regionId: string,
    itemX: number,
    itemY: number
  ) => void
  onItemDragMove?: (deltaX: number, deltaY: number) => void
  onItemDragEnd?: () => void
  onItemResizeMove?: (
    index: number,
    regionId: string,
    direction: ResizeDirection,
    deltaX: number,
    deltaY: number,
    initialItem: any // Pass full initial state/item to calculate
  ) => void
  onColumnResizeMove?: (
    colIndex: number,
    deltaX: number,
    initialWidths: { left: number; right: number },
    minWidths: { left: number; right: number }
  ) => void
  onRegionResizeMove?: (
    regionId: string,
    deltaY: number,
    initialNextRegionTop: number // MM
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
