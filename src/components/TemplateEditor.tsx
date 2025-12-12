import React, { useState, useRef } from 'react'
import { EditorState } from '../types/editor'
import { getMockEditorState } from '../utils/mockData.ts'
import { Paper } from './Paper'
import { useGlobalDrag } from '../hooks/useGlobalDrag'
import { useItemDrag } from '../hooks/useItemDrag'

export const TemplateEditor: React.FC = () => {
  const [editorState, setEditorState] =
    useState<EditorState>(getMockEditorState())

  const editorRef = useRef<HTMLDivElement>(null)

  // Use the custom hook for global drag handling (Regions)
  const { dragging, setDragging } = useGlobalDrag(editorRef, setEditorState)

  // Use custom hook for item drag handling
  const { handleItemDragStart, dragItem } = useItemDrag(
    editorRef,
    setEditorState
  )

  // Helper to handle resize start
  const handleResizeStart = (
    region: 'header' | 'body' | 'footer',
    e: React.MouseEvent
  ) => {
    e.preventDefault()
    e.stopPropagation()
    setDragging(region)
  }

  const isDraggingAny = dragging || dragItem

  return (
    <div
      ref={editorRef}
      className={`min-h-screen bg-gray-100 flex justify-center items-start p-5 ${isDraggingAny ? 'select-none' : ''} ${dragging ? 'cursor-ns-resize' : ''}`}
    >
      <div
        style={{
          transformOrigin: 'top center',
        }}
      >
        <Paper
          state={editorState}
          onResizeStart={handleResizeStart}
          onItemDragStart={handleItemDragStart}
        />
      </div>
    </div>
  )
}
