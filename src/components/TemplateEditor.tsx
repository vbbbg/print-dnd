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
      if (!dragging || !editorRef.current) return

      // Calculate new Y relative to the paper
      // We assume paper is centered or we need to find its rect.
      // For simplicity, let's look at the delta or get the exact offset.
      // Since Paper renders relative to its container, finding the exact "top" relative to Paper
      // is easiest if we know where Paper is.
      // However, we can also just use movementY if we are careful, but absolute position is more robust.

      // Better approach: Get the paper element's bounding rect
      // We can pass a ref to Paper or wrap it.
      // For now, let's assume the mouse event clientY mapped to the paper coordinate space.

      // Let's find the paper element from our ref or just assume the editorRef contains the paper.
      // Actually, let's just use the relative movement for simplicity if we don't have a direct ref to the paper DOM.
      // OR, we can just grab the paper DOM element via a selector or ref passed down.
      // Let's look for the paper element in the event target's hierarchy or just add a Ref to Paper.
      // To keep it simple without changing Paper props too much, let's look at the offset logic.

      // Refined Logic:
      // We need to calculate the new 'top' value for the line being dragged.
      // `e.clientY` is the global mouse Y.
      // We need to convert `e.clientY` to "pixels from top of paper".

      // Let's try to find the paper Rect.
      // We can use a ref on the wrapper div in TemplateEditor, find the Paper child?
      // Or just compute deltas. Deltas are easiest but can drift.
      // Let's try absolute mapping.

      const paperElement = editorRef.current?.querySelector(
        '[data-paper-root="true"]'
      ) // Robust selector using data attribute
      if (!paperElement) return

      const rect = paperElement.getBoundingClientRect()
      // Adjust relativeY by scale factor because the paper is scaled
      const relativeY = (e.clientY - rect.top) / SCALE

      setEditorState((prev) => {
        const newState = { ...prev }
        const minHeight = 5 // Minimum height in mm

        if (dragging === 'header') {
          // Adjusting the line between Title and Header (headerTop)
          // Constraints: > 0, < bodyTop - minHeight
          const newTop = Math.max(
            minHeight,
            Math.min(relativeY, prev.bodyTop - minHeight)
          )
          newState.headerTop = newTop
        } else if (dragging === 'body') {
          // Adjusting the line between Header and Body (bodyTop)
          // Constraints: > headerTop + minHeight, < footerTop - minHeight
          const newTop = Math.max(
            prev.headerTop + minHeight,
            Math.min(relativeY, prev.footerTop - minHeight)
          )
          newState.bodyTop = newTop
        } else if (dragging === 'footer') {
          // Adjusting the line between Body and Footer (footerTop)
          // Constraints: > bodyTop + minHeight, < paperHeight - minHeight
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
        className="min-h-screen bg-gray-100 flex justify-center items-start p-5"
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
