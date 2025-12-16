import React, { useRef, useCallback } from 'react'
import { EditorState } from '../types/editor'
import { getMockEditorState } from '../utils/mockData.ts'
import useSyncState from '../hooks/useSyncState'
import { Paper } from './Paper'
import { Toolbar } from './Toolbar'
import { useGlobalDrag } from '../hooks/useGlobalDrag'
import { useItemDrag } from '../hooks/useItemDrag'
import { useItemResize } from '../hooks/useItemResize'
import { useToolbar } from '../hooks/useToolbar'
import { BasicSettingsCard } from './BasicSettingsCard'
import { constrainItemsToMargins } from '../utils/itemUtils'

export const TemplateEditor: React.FC = () => {
  const [editorState, setEditorState] =
    useSyncState<EditorState>(getMockEditorState)

  const editorRef = useRef<HTMLDivElement>(null)

  // Use toolbar hook for all toolbar-related logic
  const {
    canUndo,
    canRedo,
    undo,
    redo,
    saveSnapshot,
    handleResetLayout,
    zoom,
    handleZoomIn,
    handleZoomOut,
    handlePrintPreview,
    handleSaveAsTemplate,
  } = useToolbar({ editorState, setEditorState })

  // Use the custom hook for global drag handling (Regions)
  const { dragging, setDragging } = useGlobalDrag(editorRef, setEditorState)

  // Use custom hook for item drag handling
  const {
    handleItemDragStart: originalHandleItemDragStart,
    dragItem,
    guides,
  } = useItemDrag(editorRef, setEditorState)

  // Use custom hook for item resize handling
  const { handleResizeStart: originalHandleItemResizeStart, resizing } =
    useItemResize(editorRef, setEditorState)

  // Wrap item drag start to save snapshot first
  const handleItemDragStart = useCallback(
    (
      index: number,
      region: 'title' | 'header' | 'footer',
      e: React.MouseEvent,
      itemX: number,
      itemY: number
    ) => {
      saveSnapshot() // Save state before drag starts
      originalHandleItemDragStart(index, region, e, itemX, itemY)
    },
    [saveSnapshot, originalHandleItemDragStart]
  )

  // Wrap item resize start to save snapshot first
  const handleItemResizeStart = useCallback(
    (
      index: number,
      region: 'title' | 'header' | 'footer',
      direction: any,
      e: React.MouseEvent,
      itemX: number,
      itemY: number,
      itemWidth: number,
      itemHeight: number
    ) => {
      saveSnapshot() // Save state before resize starts
      originalHandleItemResizeStart(
        index,
        region,
        direction,
        e,
        itemX,
        itemY,
        itemWidth,
        itemHeight
      )
    },
    [saveSnapshot, originalHandleItemResizeStart]
  )

  // Wrap region resize start to save snapshot first
  const handleRegionResizeStart = useCallback(
    (region: 'header' | 'body' | 'footer', e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      saveSnapshot() // Save state before region resize starts
      setDragging(region)
    },
    [saveSnapshot, setDragging]
  )

  const isDraggingAny = dragging || dragItem || resizing

  const handleSettingsChange = useCallback(
    (updates: Partial<EditorState>) => {
      saveSnapshot()
      setEditorState((prev) => {
        // Create initial new state
        let newState = { ...prev, ...updates }

        // If margins or paper size changed, we need to re-validate all items
        const hasMarginUpdates =
          updates.margins !== undefined ||
          updates.paperWidth !== undefined ||
          updates.paperHeight !== undefined ||
          updates.paperType !== undefined

        if (hasMarginUpdates) {
          const currentMargins = newState.margins || {
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
          }
          const w = newState.paperWidth
          const h = newState.paperHeight

          newState.titleItems = constrainItemsToMargins(
            newState.titleItems,
            currentMargins,
            w,
            h
          )
          newState.headerItems = constrainItemsToMargins(
            newState.headerItems,
            currentMargins,
            w,
            h
          )
          newState.footerItems = constrainItemsToMargins(
            newState.footerItems,
            currentMargins,
            w,
            h
          )
        }

        return newState
      })
    },
    [saveSnapshot, setEditorState]
  )

  return (
    <>
      <Toolbar
        zoom={zoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
        onResetLayout={handleResetLayout}
        onPrintPreview={handlePrintPreview}
        onSaveAsTemplate={handleSaveAsTemplate}
      />
      <div
        ref={editorRef}
        className={`min-h-screen bg-gray-100 flex justify-center items-start p-5 pt-24 ${isDraggingAny ? 'select-none' : ''} ${dragging ? 'cursor-ns-resize' : ''}`}
      >
        <div
          style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'top center',
          }}
        >
          <Paper
            state={editorState}
            guides={guides}
            onResizeStart={handleRegionResizeStart}
            onItemDragStart={handleItemDragStart}
            onItemResizeStart={handleItemResizeStart}
          />
        </div>
      </div>
      <div className="fixed top-24 right-5 z-40 max-h-[calc(100vh-120px)] overflow-y-auto">
        <BasicSettingsCard
          state={editorState}
          onChange={handleSettingsChange}
        />
      </div>
    </>
  )
}
