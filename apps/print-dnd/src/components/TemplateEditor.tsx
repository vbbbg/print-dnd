import React, { useRef, useCallback } from 'react'
import { EditorState } from '../types/editor'
import { MOCK_REAL_DATA } from '../utils/mockRealData'
import { Paper } from './Paper'
// Toolbar imports removed as they are encapsulated in EditorToolbar
import { EditorToolbar, EditorToolbarConfig } from './EditorToolbar'
import { useGlobalDrag } from '../hooks/useGlobalDrag'
import { useItemDrag } from '../hooks/useItemDrag'
import { useItemResize } from '../hooks/useItemResize'
import { useColumnResize } from '../hooks/useColumnResize'
import { useToolbar } from '../hooks/useToolbar'
import { BasicSettingsCard } from './BasicSettingsCard'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { FieldSettingsPanel } from './FieldSettingsPanel'
import { ItemSettingsPanel } from './ItemSettingsPanel'
import { TableSettingsPanel } from './TableSettingsPanel'
import { constrainItemsToMargins } from '../utils/itemUtils'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { componentRegistry } from '../core/ComponentRegistry'
import { useEditorStore } from '../store/editorStore'
import { TextPlugin } from '../plugins/TextPlugin'
import { ImagePlugin } from '../plugins/ImagePlugin'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { TablePlugin } from '../plugins/TablePlugin'

// Register default plugins
componentRegistry.register(TextPlugin)
componentRegistry.register(ImagePlugin)
componentRegistry.register(TablePlugin)

export interface TemplateEditorProps {
  initialState?: EditorState
  onSave?: (state: EditorState) => void
  onPrintPreview?: () => void
  toolbar?: EditorToolbarConfig
  className?: string
  style?: React.CSSProperties
}

export const TemplateEditor: React.FC<TemplateEditorProps> = ({
  initialState,
  onSave,
  onPrintPreview,
  toolbar,
  className,
  style,
}) => {
  // Use store
  const editorState = useEditorStore((state) => state)
  const setEditorState = useEditorStore((state) => state.setEditorState)
  const selectedItemIdx = useEditorStore((state) => state.selectedItemIdx)
  const setSelection = useEditorStore((state) => state.setSelection)
  const updateItem = useEditorStore((state) => state.updateItem)
  const updateTable = useEditorStore((state) => state.updateTable)

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
  } = useToolbar({ onSave, onPrintPreview })

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
  const { handleColumnResizeMove, handleColumnResizeEnd, resizingColIndex } =
    useColumnResize(handleStateUpdate)

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
          if (region.items) {
            return {
              ...region,
              items: constrainItemsToMargins(
                region.items,
                currentMargins,
                w,
                h
              ),
            }
          }
          return region
        })
      }

      setEditorState(newState)
    },
    [setEditorState, editorState]
  )

  const [leftPanelOpen, setLeftPanelOpen] = React.useState(true)
  const [rightPanelOpen, setRightPanelOpen] = React.useState(true)

  // Derive selected item from state
  const selectedItem = React.useMemo(() => {
    if (!selectedItemIdx) return null
    const { region: regionId, index } = selectedItemIdx

    // Find region
    const targetRegion = editorState.regions.find((r) => r.id === regionId)
    if (targetRegion && targetRegion.items && targetRegion.items[index]) {
      return targetRegion.items[index]
    }

    return null
  }, [selectedItemIdx, editorState])

  const handleItemUpdate = (updates: any) => {
    if (!selectedItemIdx) return
    const { region, index } = selectedItemIdx

    if (region === 'body') return // Should be handled by handleTableUpdate if selected

    updateItem(region as any, index, updates)
  }

  const handleTableUpdate = (updates: any) => {
    updateTable(updates)
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
          state={{ zoom, canUndo, canRedo }}
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
          <div
            className={`${leftPanelOpen ? 'w-72' : 'w-0'} bg-white border-r transition-all duration-300 relative flex flex-col`}
          >
            <div
              className={`flex-1 overflow-hidden ${leftPanelOpen ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200 flex flex-col`}
            >
              <Tabs
                defaultValue="settings"
                className="flex-1 flex flex-col overflow-hidden"
              >
                <div className="px-4 pt-2 border-b">
                  <TabsList className="w-full grid grid-cols-2">
                    <TabsTrigger value="settings">基础设置</TabsTrigger>
                    <TabsTrigger value="fields">字段设置</TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent
                  value="settings"
                  className="flex-1 overflow-hidden p-0 m-0 data-[state=inactive]:hidden"
                >
                  <BasicSettingsCard
                    state={editorState}
                    onChange={handleSettingsChange}
                  />
                </TabsContent>

                <TabsContent
                  value="fields"
                  className="flex-1 overflow-hidden p-0 m-0 data-[state=inactive]:hidden"
                >
                  <FieldSettingsPanel
                    state={editorState}
                    onChange={handleSettingsChange}
                  />
                </TabsContent>
              </Tabs>
            </div>

            {/* Toggle Button Left */}
            <button
              onClick={() => setLeftPanelOpen(!leftPanelOpen)}
              className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-12 bg-white border border-gray-200 rounded-r-lg shadow-sm flex items-center justify-center cursor-pointer hover:bg-gray-50 z-50 text-gray-500 hover:text-gray-700"
              style={{
                right: '-24px',
              }}
              title={leftPanelOpen ? 'Close Sidebar' : 'Open Sidebar'}
            >
              {leftPanelOpen ? (
                <ChevronLeft className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          </div>

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
              <Paper
                state={editorState}
                guides={guides}
                onResizeStart={handleRegionResizeStart}
                onItemDragStart={handleItemDragStart}
                onItemDragMove={handleDragMove}
                onItemDragEnd={handleDragEnd}
                onItemResizeStart={handleItemResizeStart}
                selectedItemIdx={selectedItemIdx}
                data={MOCK_REAL_DATA}
              />
            </div>
          </div>

          {/* Right Sidebar */}
          <div
            className={`${rightPanelOpen ? 'w-72' : 'w-0'} bg-white transition-all duration-300 relative flex flex-col`}
          >
            <div
              className={`flex-1 overflow-hidden ${rightPanelOpen ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200 h-full`}
            >
              {(() => {
                if (!selectedItemIdx) {
                  return (
                    <div className="flex flex-col h-full">
                      <h3 className="font-bold text-lg border-b p-4 mb-4">
                        组件属性
                      </h3>
                      <div className="text-sm text-gray-500 text-center py-10">
                        请选择一个组件以编辑属性
                      </div>
                    </div>
                  )
                }

                const { region: regionId } = selectedItemIdx
                const region = editorState.regions.find(
                  (r) => r.id === regionId
                )

                if (region?.type === 'table') {
                  // Temporary adapter: treat bodyItems (TableData) as an EditorItem of type 'table'
                  const tableItemAdapter = {
                    ...region.data,
                    type: 'table',
                  } as any
                  const plugin = componentRegistry.get('table')
                  const SettingsPanel = plugin?.settingsPanel

                  if (SettingsPanel) {
                    return (
                      <SettingsPanel
                        item={tableItemAdapter}
                        onChange={handleTableUpdate}
                      />
                    )
                  }
                  return (
                    <TableSettingsPanel
                      data={tableItemAdapter}
                      onChange={handleTableUpdate}
                    />
                  )
                }

                if (selectedItem) {
                  const plugin = componentRegistry.get(selectedItem.type)
                  const SettingsPanel =
                    plugin?.settingsPanel || ItemSettingsPanel
                  return (
                    <SettingsPanel
                      item={selectedItem}
                      onChange={handleItemUpdate}
                    />
                  )
                }

                return null
              })()}
            </div>

            {/* Toggle Button Right */}
            <button
              onClick={() => setRightPanelOpen(!rightPanelOpen)}
              className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-12 bg-white border border-gray-200 rounded-l-lg shadow-sm flex items-center justify-center cursor-pointer hover:bg-gray-50 z-50 text-gray-500 hover:text-gray-700"
              style={{
                left: '-24px',
              }}
              title={rightPanelOpen ? 'Close Sidebar' : 'Open Sidebar'}
            >
              {rightPanelOpen ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </DndProvider>
  )
}
