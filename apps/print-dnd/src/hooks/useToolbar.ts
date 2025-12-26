import { useState, useCallback } from 'react'
import { EditorState, EditorItem } from '../types/editor'
import { MOCK_REAL_DATA } from '../utils/mockRealData'
import { useEditorStore } from '../store/editorStore'

interface UseToolbarOptions {
  editorState: EditorState // Still used for export/print reading
  setEditorState: (state: EditorState) => void // Kept for interface compatibility but might be unused if we fully switch to store actions
  onSave?: (state: EditorState) => void
  onPrintPreview?: () => void
}

interface UseToolbarReturn {
  // History
  canUndo: boolean
  canRedo: boolean
  undo: () => void
  redo: () => void
  handleResetLayout: () => void

  // Zoom
  zoom: number
  handleZoomIn: () => void
  handleZoomOut: () => void

  // Other actions
  handlePrintPreview: () => void
  handleSaveAsTemplate: () => void
  handleExportJson: () => void
  onAddItem: (type: 'text' | 'image' | 'qrcode' | 'line') => void
}

/**
 * Custom hook to manage all toolbar-related logic including:
 * - History management (undo/redo via zundo)
 * - Zoom controls
 * - Layout reset
 * - Print preview
 * - Save template
 */
export function useToolbar({
  editorState,
  onSave,
  onPrintPreview,
}: UseToolbarOptions): UseToolbarReturn {
  // Store actions
  const resetStore = useEditorStore((state) => state.reset)
  const addItem = useEditorStore((state) => state.addItem)

  // Temporal (History) access
  // Cast to any to avoid "Not callable" TS error if zundo type augmentation isn't working perfectly
  const temporal = useEditorStore.temporal as any
  const { undo, redo } = temporal.getState()

  // We use selectors to subscribe to history length changes to update UI
  const pastLength = temporal((state: any) => state.pastStates.length)
  const futureLength = temporal((state: any) => state.futureStates.length)

  const canUndo = pastLength > 0
  const canRedo = futureLength > 0

  // Wrappers to match interface
  const handleUndo = useCallback(() => undo(), [undo])
  const handleRedo = useCallback(() => redo(), [redo])

  // Reset to default layout
  const handleResetLayout = useCallback(() => {
    resetStore()
  }, [resetStore])

  // Zoom state management (Local UI state)
  const [zoom, setZoom] = useState(100)

  const handleZoomIn = useCallback(() => {
    setZoom((prev) => prev + 10)
  }, [])

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => Math.max(10, prev - 10))
  }, [])

  // Print preview handler
  const handlePrintPreview = useCallback(() => {
    if (onPrintPreview) {
      onPrintPreview()
      return
    }

    // Default implementation
    // ... (Keep existing print logic)
    console.log('Opening print client...')
    const clientUrl = 'http://localhost:5174/'
    const printWindow = window.open(clientUrl, '_blank')

    if (!printWindow) {
      alert('Please allow popups to open the print preview.')
      return
    }

    const printData = {
      template: editorState,
      data: [MOCK_REAL_DATA],
    }

    let attempts = 0
    const maxAttempts = 50
    const interval = setInterval(() => {
      if (printWindow.closed) {
        clearInterval(interval)
        return
      }

      attempts++
      printWindow.postMessage(
        {
          type: 'PRINT_DATA',
          template: printData.template,
          data: printData.data,
        },
        '*'
      )

      if (attempts >= maxAttempts) {
        clearInterval(interval)
        console.warn('Stopped sending print data after timeout')
      }
    }, 100)

    const messageHandler = (event: MessageEvent) => {
      if (event.data?.type === 'PRINT_CLIENT_RECEIVED') {
        clearInterval(interval)
        window.removeEventListener('message', messageHandler)
      }
    }
    window.addEventListener('message', messageHandler)
  }, [editorState, onPrintPreview])

  // Save template handler
  const handleSaveAsTemplate = useCallback(() => {
    if (onSave) {
      onSave(editorState)
    } else {
      console.warn('No onSave handler provided')
    }
  }, [editorState, onSave])

  // Export JSON handler
  const handleExportJson = useCallback(() => {
    const dataStr = JSON.stringify(editorState, null, 2)
    const dataUri =
      'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)
    const exportFileDefaultName = `${new Date().getTime()}_template.json`

    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }, [editorState])

  // Add Item Handler using Store
  const onAddItem = useCallback(
    (type: 'text' | 'image' | 'qrcode' | 'line') => {
      const newItem: EditorItem = {
        type,
        x: 10,
        y: 10,
        width: 50,
        height: 20,
        value: type === 'text' ? 'New Text' : type === 'qrcode' ? '123456' : '',
      }

      // Default to adding to header for now
      addItem('header', newItem)
    },
    [addItem]
  )

  return {
    canUndo,
    canRedo,
    undo: handleUndo,
    redo: handleRedo,
    handleResetLayout,
    zoom,
    handleZoomIn,
    handleZoomOut,
    handlePrintPreview,
    handleSaveAsTemplate,
    handleExportJson,
    onAddItem,
  }
}
