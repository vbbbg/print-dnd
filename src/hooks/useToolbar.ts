import { useState, useRef, useCallback } from 'react'
import { EditorState } from '../types/editor'
import { getMockEditorState } from '../utils/mockData'

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

  // Print preview handler
  const handlePrintPreview = useCallback(() => {
    console.log('Print preview clicked')
    // TODO: Implement print preview functionality
  }, [])

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
