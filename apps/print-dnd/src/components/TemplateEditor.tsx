import React, { useRef, useCallback } from 'react'
import { EditorState, EditorItem } from '../types/editor'
import { Paper } from './Paper'
// Toolbar imports removed as they are encapsulated in EditorToolbar
import { EditorToolbar, EditorToolbarConfig } from './EditorToolbar'
import { EditorProvider } from '../contexts/EditorContext'
import { useGlobalDrag } from '../hooks/useGlobalDrag'
import { useItemDrag } from '../hooks/useItemDrag'
import { useItemResize } from '../hooks/useItemResize'
import { useColumnResize } from '../hooks/useColumnResize'
import { useToolbar } from '../hooks/useToolbar'

import { constrainItemsToMargins } from '../utils/itemUtils'
import { useEditorStore } from '../store/editorStore'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

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

export const TemplateEditor: React.FC<TemplateEditorProps> = ({
  initialState,
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

  // Initialize store with props if needed (useEffect)
  React.useEffect(() => {
    if (initialState) {
      setEditorState(initialState)
    }
  }, [initialState, setEditorState])

  const editorRef = useRef<HTMLDivElement>(null)

  // Adapter: The existing hooks (useItemDrag, etc.) expect a state setter that accepts a functional updater OR a value.
  // We bridge this to the Zustand store.
  const handleStateUpdate = useCallback(
    (updaterOrValue: EditorState | ((prev: EditorState) => EditorState)) => {
      if (typeof updaterOrValue === 'function') {
        const newState = (updaterOrValue as (prev: EditorState) => EditorState)(
          editorState
        )
        setEditorState(newState)
      } else {
        setEditorState(updaterOrValue)
      }
    },
    [editorState, setEditorState]
  )

  // Adapter for old setSelectedItemIdx
  const setSelectedItemIdx = setSelection

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
  } = useToolbar()

  // Use the custom hook for global drag handling (Regions)
  const { dragging, setDragging } = useGlobalDrag(editorRef, handleStateUpdate)

  // Use custom hook for item drag handling
  const {
    handleDragStart: originalHandleItemDragStart,
    handleDragMove,
    handleDragEnd,
    dragItem,
    guides,
  } = useItemDrag(handleStateUpdate)

  // Use custom hook for item resize handling
  const { handleResizeStart: originalHandleItemResizeStart, resizing } =
    useItemResize(editorRef, handleStateUpdate)

  // Use custom hook for column resize handling
  const {
    handleColumnResizeStart,
    handleColumnResizeMove,
    handleColumnResizeEnd,
    resizingColIndex,
  } = useColumnResize(handleStateUpdate)

  // Wrap item drag start
  const handleItemDragStart = useCallback(
    (index: number, regionId: string, itemX: number, itemY: number) => {
      setSelectedItemIdx({ region: regionId, index }) // Select item on drag/click
      originalHandleItemDragStart(index, regionId as any, itemX, itemY)
    },
    [originalHandleItemDragStart, setSelectedItemIdx]
  )

  // Wrap item resize start
  const handleItemResizeStart = useCallback(
    (
      index: number,
      regionId: string,
      direction: any,
      e: React.MouseEvent,
      itemX: number,
      itemY: number,
      itemWidth: number,
      itemHeight: number
    ) => {
      originalHandleItemResizeStart(
        index,
        regionId as any,
        direction,
        e,
        itemX,
        itemY,
        itemWidth,
        itemHeight
      )
    },
    [originalHandleItemResizeStart]
  )

  // Wrap region resize start
  const handleRegionResizeStart = useCallback(
    (regionId: string, e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragging(regionId as any)
    },
    [setDragging]
  )

  const isDraggingAny =
    dragging || dragItem || resizing || resizingColIndex !== null

  // Global Mouse Move and Up handlers
  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (resizingColIndex !== null) {
        handleColumnResizeMove(e, editorState)
      }
    }

    const handleMouseUp = () => {
      if (resizingColIndex !== null) {
        handleColumnResizeEnd()
      }
    }

    if (resizingColIndex !== null) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [
    resizingColIndex,
    handleColumnResizeStart,
    handleColumnResizeMove,
    handleColumnResizeEnd,
    editorState,
  ])

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

  return (
    <DndProvider backend={HTML5Backend}>
      <div
        className={`h-screen flex flex-col overflow-hidden bg-gray-100 ${className || ''}`}
        style={style}
      >
        {/* 1. Header/Toolbar Area */}
        <EditorToolbar
          config={toolbar}
          state={{ zoom, canUndo, canRedo, editorState }}
          handlers={{
            undo: undo,
            redo: redo,
            'add-text': () => onAddItem('text'),
            'add-image': () => onAddItem('image'),
            'add-qrcode': () => onAddItem('qrcode'),
            'add-line': () => onAddItem('line'),
            'zoom-out': handleZoomOut,
            'zoom-in': handleZoomIn,
            reset: handleResetLayout,
            print: handlePrintPreview,
            save: handleSaveAsTemplate,
            export: handleExportJson,
          }}
        />

        {/* 2. Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar */}
          {renderLeftPanel?.({
            state: editorState,
            onChange: handleSettingsChange,
          })}

          {/* Center Canvas */}
          <div
            className="flex-1 overflow-auto p-10 relative flex bg-gray-100/50"
            ref={editorRef}
          >
            <div
              className={`m-auto ${isDraggingAny ? 'select-none' : ''} ${dragging ? 'cursor-ns-resize' : ''}`}
              style={{
                transform: `scale(${zoom / 100})`,
                transformOrigin: 'top center',
                transition: 'transform 0.1s ease-out',
              }}
            >
              <EditorProvider
                value={{
                  handlers: {
                    onResizeStart: handleRegionResizeStart,
                    onItemDragStart: handleItemDragStart,
                    onItemDragMove: handleDragMove,
                    onItemDragEnd: handleDragEnd,
                    onItemResizeStart: handleItemResizeStart,
                    onColumnResizeStart: handleColumnResizeStart,
                  },
                  data: previewData || {},
                  guides: guides,
                }}
              >
                <Paper />
              </EditorProvider>
            </div>
          </div>

          {/* Right Sidebar */}
          {renderRightPanel?.({
            selectedItemIdx,
            editorState,
            onItemUpdate: handleItemUpdate,
          })}
        </div>
      </div>
    </DndProvider>
  )
}
