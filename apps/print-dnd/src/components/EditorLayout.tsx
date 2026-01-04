import React, { useRef } from 'react'
import { useDrop } from 'react-dnd'
import { EditorState, EditorItem } from '../types/editor'
import { Paper } from './Paper'
import { EditorToolbar, EditorToolbarConfig } from './EditorToolbar'
import { EditorProvider } from '../contexts/EditorContext'

export interface EditorLayoutProps {
  className?: string
  style?: React.CSSProperties
  toolbar?: EditorToolbarConfig
  editorState: EditorState
  zoom: number
  isDraggingAny: boolean
  previewData?: Record<string, any>
  guides: any[]
  // Handlers/Actions
  handlers: {
    onItemDragStart: (
      index: number,
      regionId: string,
      itemX: number,
      itemY: number
    ) => void
    onItemDragMove: (x: number, y: number) => void
    onItemDragEnd: () => void
    onItemResizeMove: any
    onColumnResizeMove: any
    onRegionResizeMove: any
  }
  toolbarActions: {
    canUndo: boolean
    canRedo: boolean
    undo: () => void
    redo: () => void
    onAddItem: (type: 'text' | 'image' | 'qrcode' | 'line') => void
    handleZoomOut: () => void
    handleZoomIn: () => void
    handleResetLayout: () => void
    handlePrintPreview: () => void
    handleSaveAsTemplate: () => void
    handleExportJson: () => void
  }

  // Render Utils
  renderLeftPanel?: (props: {
    state: EditorState
    onChange: (updates: Partial<EditorState>) => void
  }) => React.ReactNode
  renderRightPanel?: (props: {
    selectedItemIdx: { region: string; index: number } | null
    editorState: EditorState
    onItemUpdate: (updates: Partial<EditorItem>) => void
  }) => React.ReactNode

  // Callbacks
  handleSettingsChange: (updates: Partial<EditorState>) => void
  selectedItemIdx: { region: string; index: number } | null
  handleItemUpdate: (updates: any) => void
}

export const EditorLayout: React.FC<EditorLayoutProps> = ({
  className,
  style,
  toolbar,
  editorState,
  zoom,
  isDraggingAny,
  previewData,
  guides,
  handlers,
  toolbarActions,
  renderLeftPanel,
  renderRightPanel,
  handleSettingsChange,
  selectedItemIdx,
  handleItemUpdate,
}) => {
  const editorRef = useRef<HTMLDivElement>(null)

  const {
    onItemDragMove,
    onItemDragEnd,
    onItemResizeMove,
    onColumnResizeMove,
    onRegionResizeMove,
  } = handlers

  // Global Drop Target logic
  // Lifted from Paper to explicit callbacks to ensure referential stability
  const handleDropHover = React.useCallback(
    (item: any, monitor: any) => {
      const delta = monitor.getDifferenceFromInitialOffset()
      const itemType = monitor.getItemType()

      if (!delta) return

      if (itemType === 'RESIZE_HANDLE' && onItemResizeMove) {
        onItemResizeMove(
          item.index,
          item.regionId,
          item.direction,
          delta.x,
          delta.y,
          {
            initialX: item.initialX,
            initialY: item.initialY,
            initialWidth: item.initialWidth,
            initialHeight: item.initialHeight,
          }
        )
      } else if (itemType === 'RESIZE_COLUMN_HANDLE' && onColumnResizeMove) {
        onColumnResizeMove(
          item.colIndex,
          delta.x,
          item.initialWidths,
          item.minWidths
        )
      } else if (itemType === 'RESIZE_REGION_HANDLE' && onRegionResizeMove) {
        onRegionResizeMove(item.regionId, delta.y, item.initialNextRegionTop)
      } else if (itemType === 'DRAGGABLE_ITEM' && onItemDragMove) {
        onItemDragMove(delta.x, delta.y)
      }
    },
    [onItemResizeMove, onColumnResizeMove, onRegionResizeMove, onItemDragMove]
  )

  const handleDropDrop = React.useCallback(() => {
    if (onItemDragEnd) {
      onItemDragEnd()
    }
  }, [onItemDragEnd])

  const [, dropRef] = useDrop({
    accept: [
      'DRAGGABLE_ITEM',
      'RESIZE_HANDLE',
      'RESIZE_COLUMN_HANDLE',
      'RESIZE_REGION_HANDLE',
    ],
    hover: handleDropHover,
    drop: handleDropDrop,
  })

  // Memoize the ref callback to prevent detaching/attaching on every render
  const setRefs = React.useCallback(
    (node: HTMLDivElement | null) => {
      // @ts-ignore
      editorRef.current = node
      dropRef(node)
    },
    [dropRef] // dropRef is stable from useDrop
  )

  return (
    <div
      className={`h-screen flex flex-col overflow-hidden bg-gray-100 ${className || ''}`}
      style={style}
    >
      {/* 1. Header/Toolbar Area */}
      <EditorToolbar
        config={toolbar}
        state={{
          zoom,
          canUndo: toolbarActions.canUndo,
          canRedo: toolbarActions.canRedo,
          editorState,
        }}
        handlers={{
          undo: toolbarActions.undo,
          redo: toolbarActions.redo,
          'add-text': () => toolbarActions.onAddItem('text'),
          'add-image': () => toolbarActions.onAddItem('image'),
          'add-qrcode': () => toolbarActions.onAddItem('qrcode'),
          'add-line': () => toolbarActions.onAddItem('line'),
          'zoom-out': toolbarActions.handleZoomOut,
          'zoom-in': toolbarActions.handleZoomIn,
          reset: toolbarActions.handleResetLayout,
          print: toolbarActions.handlePrintPreview,
          save: toolbarActions.handleSaveAsTemplate,
          export: toolbarActions.handleExportJson,
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
          ref={setRefs}
          className="flex-1 overflow-auto p-10 relative flex bg-gray-100/50"
        >
          <div
            className={`m-auto ${isDraggingAny ? 'select-none' : ''}`}
            style={{
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'top center',
              transition: 'transform 0.1s ease-out',
            }}
          >
            <EditorProvider
              value={{
                handlers,
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
  )
}
