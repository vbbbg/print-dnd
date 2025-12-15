import { useState, useRef, useCallback } from 'react'

type Getter<T> = () => T
type Setter<T> = (prev: T) => T

/**
 * A hook that combines useState with synchronous access to the current value.
 * Useful when you need to update state inside callbacks (like setState updaters)
 * without causing React warnings about updating during render.
 *
 * @param defaultValue - Initial value or a function that returns the initial value
 * @returns [currentValue, setState, getState] tuple where:
 *   - currentValue: The current state value (like useState)
 *   - setState: Function to update state (like useState)
 *   - getState: Function to synchronously get the latest state value
 */
export default function useSyncState<T>(defaultValue: T | Getter<T>) {
  const [, forceUpdate] = useState(0)

  const stateRef = useRef<T>(
    typeof defaultValue === 'function'
      ? (defaultValue as Getter<T>)()
      : defaultValue
  )

  const setState = useCallback((action: React.SetStateAction<T>) => {
    stateRef.current =
      typeof action === 'function'
        ? (action as Setter<T>)(stateRef.current)
        : action

    forceUpdate((prev) => prev + 1)
  }, [])

  const getState: Getter<T> = useCallback(() => stateRef.current, [])

  return [stateRef.current, setState, getState] as const
}
