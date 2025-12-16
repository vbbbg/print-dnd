import { useRef, useCallback, useState } from 'react'

interface HistoryState<T> {
  past: T[]
  present: T
  future: T[]
}

interface UseHistoryReturn<T> {
  state: T
  setState: (newState: T | ((prev: T) => T)) => void
  canUndo: boolean
  canRedo: boolean
  undo: () => void
  redo: () => void
  reset: (newState: T) => void
}

/**
 * Hook for managing state with undo/redo history
 * @param initialState - Initial state value
 * @param maxHistorySize - Maximum number of states to keep in history (default: 50)
 */
export function useHistory<T>(
  initialState: T,
  maxHistorySize = 50
): UseHistoryReturn<T> {
  const historyRef = useRef<HistoryState<T>>({
    past: [],
    present: initialState,
    future: [],
  })

  const [, setUpdateCount] = useState(0)
  const forceRender = useCallback(() => {
    setUpdateCount((prev) => prev + 1)
  }, [])

  const setState = useCallback(
    (newState: T | ((prev: T) => T)) => {
      const history = historyRef.current
      const nextState =
        typeof newState === 'function'
          ? (newState as (prev: T) => T)(history.present)
          : newState

      // Only add to history if state actually changed
      if (nextState === history.present) return

      const newPast = [...history.past, history.present]
      // Limit history size
      if (newPast.length > maxHistorySize) {
        newPast.shift()
      }

      historyRef.current = {
        past: newPast,
        present: nextState,
        future: [],
      }

      forceRender()
    },
    [forceRender, maxHistorySize]
  )

  const undo = useCallback(() => {
    const history = historyRef.current
    if (history.past.length === 0) return

    const previous = history.past[history.past.length - 1]
    const newPast = history.past.slice(0, history.past.length - 1)

    historyRef.current = {
      past: newPast,
      present: previous,
      future: [history.present, ...history.future],
    }

    forceRender()
  }, [forceRender])

  const redo = useCallback(() => {
    const history = historyRef.current
    if (history.future.length === 0) return

    const next = history.future[0]
    const newFuture = history.future.slice(1)

    historyRef.current = {
      past: [...history.past, history.present],
      present: next,
      future: newFuture,
    }

    forceRender()
  }, [forceRender])

  const reset = useCallback(
    (newState: T) => {
      historyRef.current = {
        past: [],
        present: newState,
        future: [],
      }
      forceRender()
    },
    [forceRender]
  )

  return {
    state: historyRef.current.present,
    setState,
    canUndo: historyRef.current.past.length > 0,
    canRedo: historyRef.current.future.length > 0,
    undo,
    redo,
    reset,
  }
}
