import { useState, useEffect, RefObject } from 'react'
import { EditorState, EditorItem } from '../types/editor'
import { SCALE } from '../constants/units'

// Helper to get max bottom Y of a list of items
const getMaxBottom = (items: EditorItem[]) => {
  if (!items || items.length === 0) return 0
  return Math.max(...items.map((i) => i.y + i.height))
}

export const useGlobalDrag = (
  editorRef: RefObject<HTMLDivElement>,
  onUpdateState: (updater: (prev: EditorState) => EditorState) => void
) => {
  const [dragging, setDragging] = useState<'header' | 'body' | 'footer' | null>(
    null
  )

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault()
      if (!dragging || !editorRef.current) return

      const paperElement = editorRef.current.querySelector(
        '[data-paper-root="true"]'
      )
      if (!paperElement) return

      const rect = paperElement.getBoundingClientRect()
      const relativeY = (e.clientY - rect.top) / SCALE

      onUpdateState((prev) => {
        const newState = { ...prev }
        const minHeight = 5

        if (dragging === 'header') {
          // Resizing Title (0~headerTop) / Header (headerTop~bodyTop)
          // 1. Min Y: Must enclose Title Items
          const titleBottom = getMaxBottom(prev.titleItems)
          const minTop = Math.max(minHeight, titleBottom + minHeight)

          // 2. Max Y: Must allow space for shifted Header Items
          // If we move headerTop down, headerItems move down.
          // We need to ensure they don't cross bodyTop.
          // Space Available = (bodyTop - minHeight) - newHeaderTop
          // Space Needed = HeaderContentHeight (approx)
          // Actually simpler: The lowest item will move by Delta. NewLowest <= bodyTop.
          // LowestY + Delta <= bodyTop.
          // Delta = newTop - oldTop.
          // LowestY + newTop - oldTop <= bodyTop.
          // newTop <= bodyTop - LowestY + oldTop.

          const headerContentBottom = getMaxBottom(prev.headerItems)
          const maxShift = prev.bodyTop - minHeight - headerContentBottom
          const maxTop = prev.headerTop + maxShift

          // Clamp
          let newTop = Math.max(minTop, Math.min(relativeY, maxTop))

          // Shift Delta
          const delta = newTop - prev.headerTop
          if (delta !== 0) {
            newState.headerTop = newTop
            newState.headerItems = prev.headerItems.map((item) => ({
              ...item,
              y: item.y + delta,
            }))
          }
        } else if (dragging === 'body') {
          // Resizing Header (headerTop~bodyTop) / Body Table (bodyTop~footerTop)
          // 1. Min Y: Must enclose Header Items
          const headerBottom = getMaxBottom(prev.headerItems)
          const minTop = Math.max(
            prev.headerTop + minHeight,
            headerBottom + minHeight
          )

          // 2. Max Y: footerTop - minHeight
          const maxTop = prev.footerTop - minHeight

          const newTop = Math.max(minTop, Math.min(relativeY, maxTop))
          newState.bodyTop = newTop
        } else if (dragging === 'footer') {
          // Resizing Body (bodyTop~footerTop) / Footer (footerTop~paperHeight)
          // 1. Min Y: bodyTop + minHeight
          const minTop = prev.bodyTop + minHeight

          // 2. Max Y: Must allow space for shifted Footer Items
          // MaxBottom <= paperHeight
          // LowestY + Delta <= paperHeight
          // delta = newTop - oldTop
          // LowestY + newTop - oldTop <= paperHeight
          // newTop <= paperHeight - LowestY + oldTop

          const footerContentBottom = getMaxBottom(prev.footerItems)
          const maxShift = prev.paperHeight - minHeight - footerContentBottom
          const maxTop = prev.footerTop + maxShift

          const newTop = Math.max(minTop, Math.min(relativeY, maxTop))

          const delta = newTop - prev.footerTop
          if (delta !== 0) {
            newState.footerTop = newTop
            newState.footerItems = prev.footerItems.map((item) => ({
              ...item,
              y: item.y + delta,
            }))
          }
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
