import { useState, useEffect, RefObject } from 'react'
import { EditorState } from '../types/editor'
import { SCALE } from '../constants/units'

export const useGlobalDrag = (
  editorRef: RefObject<HTMLDivElement>,
  onUpdateState: (updater: (prev: EditorState) => EditorState) => void
) => {
  const [dragging, setDragging] = useState<'header' | 'body' | 'footer' | null>(
    null
  )

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault() // Prevent text selection/scrolling
      if (!dragging || !editorRef.current) return

      const paperElement = editorRef.current.querySelector(
        '[data-paper-root="true"]'
      )
      if (!paperElement) return

      const rect = paperElement.getBoundingClientRect()
      // Use the constant SCALE
      const relativeY = (e.clientY - rect.top) / SCALE

      onUpdateState((prev) => {
        const newState = { ...prev }
        const minHeight = 5

        if (dragging === 'header') {
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
  }, [dragging, editorRef, onUpdateState])

  return {
    dragging,
    setDragging,
  }
}
