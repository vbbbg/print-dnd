import React, { useCallback } from 'react'
import { EditorState, EditorItem } from '../types/editor'
import { EditorToolbarConfig } from './EditorToolbar'
import { useRegionResize } from '../hooks/useRegionResize'
import { useItemDrag } from '../hooks/useItemDrag'
import { useItemResize } from '../hooks/useItemResize'
import { useColumnResize } from '../hooks/useColumnResize'
import { useToolbar } from '../hooks/useToolbar'
import { constrainItemsToMargins } from '../utils/itemUtils'
import { useEditorStore, EditorStoreProvider } from '../store/editorStore'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { EditorLayout } from './EditorLayout'

export interface TemplateEditorProps {
  initialState?: EditorState
  toolbar?: EditorToolbarConfig
  className?: string
  style?: React.CSSProperties
  previewData?: Record<string, any>
  renderLeftPanel?: (props: {
    state: EditorState
    onChange: (updates: Partial<EditorState>) => void
  }) => React.ReactNode
  renderRightPanel?: (props: {
    selectedItemIdx: { region: string; index: number } | null
    editorState: EditorState
    onItemUpdate: (updates: Partial<EditorItem>) => void
  }) => React.ReactNode
}

const TemplateEditorContent: React.FC<TemplateEditorProps> = ({
  toolbar,
  className,
  style,
  previewData,
  renderLeftPanel,
  renderRightPanel,
}) => {
  // Use store
  const editorState = useEditorStore((state) => state)
  const setEditorState = useEditorStore((state) => state.setEditorState)
  const selectedItemIdx = useEditorStore((state) => state.selectedItemIdx)
  const setSelection = useEditorStore((state) => state.setSelection)
  const updateItem = useEditorStore((state) => state.updateItem)

  // Use toolbar hook for all toolbar-related logic
  const {
    canUndo,
    canRedo,
    undo,
    redo,
    handleResetLayout,
    zoom,
    handleZoomIn,
    handleZoomOut,
    handlePrintPreview,
    handleSaveAsTemplate,
    handleExportJson,
    onAddItem,
  } = useToolbar({})

  // Use the custom hook for global drag handling (Regions)
  const { handleRegionResizeMove } = useRegionResize()

  // Use custom hook for item drag handling
  const {
    handleDragStart: originalHandleItemDragStart,
    handleDragMove,
    handleDragEnd,
    dragItem,
    guides,
  } = useItemDrag()

  // Use custom hook for item resize handling
  const { handleItemResizeMove } = useItemResize()

  // Use custom hook for column resize handling
  const { handleColumnResizeMove } = useColumnResize()

  // Wrap item drag start
  const handleItemDragStart = useCallback(
    (index: number, regionId: string, itemX: number, itemY: number) => {
      // Only update selection if changed to avoid unnecessary re-renders that might interrupt drag
      if (
        selectedItemIdx?.region !== regionId ||
        selectedItemIdx?.index !== index
      ) {
        setSelection({ region: regionId, index })
      }
      originalHandleItemDragStart(index, regionId as any, itemX, itemY)
    },
    [originalHandleItemDragStart, setSelection, selectedItemIdx]
  )

  const isDraggingAny = dragItem !== null

  const handleSettingsChange = useCallback(
    (updates: Partial<EditorState>) => {
      const prev = editorState
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

        // Update regions items
        newState.regions = newState.regions.map((region) => {
          if (Array.isArray(region.data)) {
            return {
              ...region,
              data: constrainItemsToMargins(
                region.data,
                currentMargins,
                w,
                h
              ) as any,
            }
          }
          return region
        })
      }

      setEditorState(newState)
    },
    [setEditorState, editorState]
  )

  const handleItemUpdate = (updates: any) => {
    if (!selectedItemIdx) return
    const { region, index } = selectedItemIdx

    updateItem(region as any, index, updates)
  }

  // Combine handlers
  const handlers = React.useMemo(
    () => ({
      onItemDragStart: handleItemDragStart,
      onItemDragMove: handleDragMove,
      onItemDragEnd: handleDragEnd,
      onItemResizeMove: handleItemResizeMove,
      onColumnResizeMove: handleColumnResizeMove,
      onRegionResizeMove: handleRegionResizeMove,
    }),
    [
      handleItemDragStart,
      handleDragMove,
      handleDragEnd,
      handleItemResizeMove,
      handleColumnResizeMove,
      handleRegionResizeMove,
    ]
  )

  // Combine toolbar actions
  const toolbarActions = React.useMemo(
    () => ({
      canUndo,
      canRedo,
      undo,
      redo,
      onAddItem,
      handleZoomOut,
      handleZoomIn,
      handleResetLayout,
      handlePrintPreview,
      handleSaveAsTemplate,
      handleExportJson,
    }),
    [
      canUndo,
      canRedo,
      undo,
      redo,
      onAddItem,
      handleZoomOut,
      handleZoomIn,
      handleResetLayout,
      handlePrintPreview,
      handleSaveAsTemplate,
      handleExportJson,
    ]
  )

  return (
    <DndProvider backend={HTML5Backend}>
      <EditorLayout
        className={className}
        style={style}
        toolbar={toolbar}
        editorState={editorState}
        zoom={zoom}
        isDraggingAny={isDraggingAny}
        previewData={previewData}
        guides={guides}
        handlers={handlers}
        toolbarActions={toolbarActions}
        renderLeftPanel={renderLeftPanel}
        renderRightPanel={renderRightPanel}
        handleSettingsChange={handleSettingsChange}
        selectedItemIdx={selectedItemIdx}
        handleItemUpdate={handleItemUpdate}
      />
    </DndProvider>
  )
}

export const TemplateEditor: React.FC<TemplateEditorProps> = (props) => {
  return (
    <EditorStoreProvider initialState={props.initialState}>
      <TemplateEditorContent {...props} />
    </EditorStoreProvider>
  )
}
