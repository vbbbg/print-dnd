import React, { useState, useRef, useEffect } from 'react'
import { EditorState } from '../types/editor'
import { Paper } from './Paper'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
// @ts-ignore
import templateData from '../assets/template.json'

// Use the data from json, fallback if missing
const INITIAL_STATE: EditorState = {
  headerTop: templateData.headerTop || 100,
  bodyTop: templateData.bodyTop || 200,
  footerTop: templateData.footerTop || 700,
  paperHeight: templateData.paperHeight || 800,
  paperWidth: templateData.paperWidth || 600,
}

// Visual scaling to make A4 (210mm) looks decent on screen
// 210mm is roughly 800px width on typical screens?
// let's apply a CSS scale or just simple zoom.
// For now, we will render it "as is" with pixels = mm units (very small) unless we scale it.
// The user has not asked for scaling logic yet, but 210px is too small.
// Let's assume the values in template.json are "units" and we multiply by a scale factor for display.
const SCALE = 3.78 // 1mm ~= 3.78px at 96 DPI

export const TemplateEditor: React.FC = () => {
  const [editorState, setEditorState] = useState<EditorState>(INITIAL_STATE)
  const [dragging, setDragging] = useState<'header' | 'body' | 'footer' | null>(
    null
  )

  const editorRef = useRef<HTMLDivElement>(null)

  // Helper to handle resize start
  const handleResizeStart = (
    region: 'header' | 'body' | 'footer',
    e: React.MouseEvent
  ) => {
    e.preventDefault()
    e.stopPropagation()
    setDragging(region)
  }

  // Helper to handle mouse move (global)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault() // Prevent text selection/scrolling
      if (!dragging || !editorRef.current) return

      const paperElement = editorRef.current?.querySelector(
        '[data-paper-root="true"]'
      )
      if (!paperElement) return

      const rect = paperElement.getBoundingClientRect()
      const relativeY = (e.clientY - rect.top) / SCALE

      setEditorState((prev) => {
        const newState = { ...prev }
        const minHeight = 5

        if (dragging === 'header') {
          // ...
          // Explicitly ensure bodyTop matches prev.bodyTop (it does by default, but essentially we are sure)
          const newTop = Math.max(
            minHeight,
            Math.min(relativeY, prev.bodyTop - minHeight)
          )
          newState.headerTop = newTop
        } else if (dragging === 'body') {
          const newTop = Math.max(
            prev.headerTop + minHeight,
            Math.min(relativeY, prev.footerTop - minHeight)
          )
          newState.bodyTop = newTop
        } else if (dragging === 'footer') {
          const newTop = Math.max(
            prev.bodyTop + minHeight,
            Math.min(relativeY, prev.paperHeight - minHeight)
          )
          newState.footerTop = newTop
        }

        return newState
      })
    }

    const handleMouseUp = () => {
      setDragging(null)
    }

    if (dragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [dragging])

  return (
    <DndProvider backend={HTML5Backend}>
      <div
        ref={editorRef}
        className={`min-h-screen bg-gray-100 flex justify-center items-start p-5 ${dragging ? 'select-none cursor-ns-resize' : ''}`}
      >
        <div
          style={{
            transform: `scale(${SCALE})`,
            transformOrigin: 'top center',
          }}
        >
          <Paper state={editorState} onResizeStart={handleResizeStart} />
        </div>
      </div>
    </DndProvider>
  )
}
