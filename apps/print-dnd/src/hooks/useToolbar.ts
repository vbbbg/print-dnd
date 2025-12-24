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
  const handlePrintPreview = useCallback(async () => {
    console.log('Sending print request...')
    try {
      const apiUrl =
        import.meta.env.VITE_PDF_SERVICE_URL || 'http://localhost:3001'
      const response = await fetch(`${apiUrl}/api/print`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          template: editorState,
          data: MOCK_REAL_DATA,
        }),
      })

      if (!response.ok) {
        throw new Error(
          `Print failed: ${response.status} ${response.statusText}`
        )
      }

      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        const json = await response.json()
        throw new Error(`Print failed: ${json.error || JSON.stringify(json)}`)
      }
      if (contentType && !contentType.includes('application/pdf')) {
        const text = await response.text()
        console.error('Received non-PDF response:', text)
        throw new Error('Received invalid PDF response from server')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = url
      link.download = `${new Date().getTime()}_print.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Print error:', error)
      alert(
        'Printing failed: ' +
          (error instanceof Error ? error.message : String(error))
      )
    }
  }, [editorState])

  // Save template handler
  const handleSaveAsTemplate = useCallback(() => {
    console.log('Save as template clicked')
    // TODO: Implement save template functionality
  }, [])

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
