import { useState, useRef, useCallback } from 'react'
import { EditorState } from '../types/editor'
import { getMockEditorState } from '../utils/mockData'
import { MOCK_REAL_DATA } from '../utils/mockRealData'

interface HistoryState {
  past: EditorState[]
  future: EditorState[]
}

interface UseToolbarOptions {
  editorState: EditorState
  setEditorState: (state: EditorState) => void
  onSave?: (state: EditorState) => void
}

interface UseToolbarReturn {
  // History
  canUndo: boolean
  canRedo: boolean
  undo: () => void
  redo: () => void
  saveSnapshot: () => void
  handleResetLayout: () => void

  // Zoom
  zoom: number
  handleZoomIn: () => void
  handleZoomOut: () => void

  // Other actions
  handlePrintPreview: () => void
  handleSaveAsTemplate: () => void
  handleExportJson: () => void
}

/**
 * Custom hook to manage all toolbar-related logic including:
 * - History management (undo/redo with snapshot-based recording)
 * - Zoom controls
 * - Layout reset
 * - Print preview
 * - Save template
 */
export function useToolbar({
  editorState,
  setEditorState,
  onSave,
}: UseToolbarOptions): UseToolbarReturn {
  // Manual history management using ref
  const historyRef = useRef<HistoryState>({
    past: [],
    future: [],
  })

  // Track if we can undo/redo
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)

  // Update can undo/redo flags
  const updateHistoryFlags = useCallback(() => {
    setCanUndo(historyRef.current.past.length > 0)
    setCanRedo(historyRef.current.future.length > 0)
  }, [])

  // Save snapshot to history (called before drag/resize starts)
  const saveSnapshot = useCallback(() => {
    historyRef.current.past.push(editorState)
    historyRef.current.future = [] // Clear redo stack
    // Limit history size to 50
    if (historyRef.current.past.length > 50) {
      historyRef.current.past.shift()
    }
    updateHistoryFlags()
  }, [editorState, updateHistoryFlags])

  // Undo function
  const undo = useCallback(() => {
    if (historyRef.current.past.length === 0) return
    const previous = historyRef.current.past.pop()!
    historyRef.current.future.unshift(editorState)
    setEditorState(previous)
    updateHistoryFlags()
  }, [editorState, setEditorState, updateHistoryFlags])

  // Redo function
  const redo = useCallback(() => {
    if (historyRef.current.future.length === 0) return
    const next = historyRef.current.future.shift()!
    historyRef.current.past.push(editorState)
    setEditorState(next)
    updateHistoryFlags()
  }, [editorState, setEditorState, updateHistoryFlags])

  // Reset to default layout
  const handleResetLayout = useCallback(() => {
    saveSnapshot() // Save current state before reset
    setEditorState(getMockEditorState())
  }, [saveSnapshot, setEditorState])

  // Zoom state management
  const [zoom, setZoom] = useState(100)

  // Zoom handlers
  const handleZoomIn = useCallback(() => {
    setZoom((prev) => prev + 10)
  }, [])

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => Math.max(10, prev - 10))
  }, [])

  // Print preview handler -> Call PDF Service
  // Print preview handler -> Open Client App
  const handlePrintPreview = useCallback(() => {
    console.log('Opening print client...')

    // URL of the print-client app
    // In production this should be env var, for now hardcoded to dev port
    const clientUrl = 'http://localhost:3002'

    // Open new window
    const printWindow = window.open(clientUrl, '_blank')

    if (!printWindow) {
      alert('Please allow popups to open the print preview.')
      return
    }

    // Data to send
    const printData = {
      template: editorState,
      data: MOCK_REAL_DATA, // Or actual data
    }

    // Fallback: Write to localStorage (domain must successfully share if on same domain,
    // but here we are on localhost:3000 vs localhost:3002, so localStorage is NOT shared across port by default in some browsers,
    // actually, localStorage IS isolated by origin (protocol + domain + port).
    // So localStorage won't work cross-port.
    //
    // CORRECT STRATEGY for localhost debugging:
    // If ports differ, we MUST use postMessage.
    //
    // START DEBUGGING:
    // User says "Redirected but no reaction" -> likely Client App opened but didn't receive message.
    //
    // Possible reasons:
    // 1. Client App loaded slower than 1000ms.
    // 2. Client App loaded faster than event listener added (unlikely due to timeout).
    // 3. Handshake 'PRINT_CLIENT_READY' never received.

    // I will add a periodic sender retry interval instead of a single timeout.

    // Interval to send data repeatedly until we get an acknowledgement or time out
    let attempts = 0
    const maxAttempts = 50 // 5 seconds
    const interval = setInterval(() => {
      if (printWindow.closed) {
        clearInterval(interval)
        return
      }

      attempts++
      // Just blind send every 100ms
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

    // Listener to stop if we hear back (optional, but good practice)
    const messageHandler = (event: MessageEvent) => {
      if (event.data?.type === 'PRINT_CLIENT_RECEIVED') {
        clearInterval(interval)
        window.removeEventListener('message', messageHandler)
      }
    }
    window.addEventListener('message', messageHandler)

    // Also keep the handshake logic if client supports it
    // ...
  }, [editorState])

  // Save template handler
  const handleSaveAsTemplate = useCallback(() => {
    console.log('Save as template clicked')
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

  return {
    // History
    canUndo,
    canRedo,
    undo,
    redo,
    saveSnapshot,
    handleResetLayout,

    // Zoom
    zoom,
    handleZoomIn,
    handleZoomOut,

    // Other actions
    handlePrintPreview,
    handleSaveAsTemplate,
    handleExportJson,
  }
}
