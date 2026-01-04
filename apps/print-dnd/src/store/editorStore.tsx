import { createStore, useStore as useZustandStore, StoreApi } from 'zustand'
import { temporal } from 'zundo'
import { EditorState, EditorItem } from '../types/editor'
import { getMockEditorState } from '../utils/mockData'
import { createContext, useContext, useState } from 'react'
import React from 'react'

interface EditorActions {
  // Initialization
  setEditorState: (state: EditorState) => void
  reset: () => void

  // Item Management
  addItem: (regionId: string, item: EditorItem) => void
  updateItem: (
    regionId: string,
    index: number,
    updates: Partial<EditorItem>
  ) => void
  removeItem: (regionId: string, index: number) => void

  // Selection
  setSelection: (
    selection: {
      region: string // changed to regionId
      index: number
    } | null
  ) => void
}

export interface EditorStore extends EditorState, EditorActions {
  selectedItemIdx: {
    region: string // regionId
    index: number
  } | null
}

const defaultState: EditorState = getMockEditorState()

export const createEditorStore = (initProps?: Partial<EditorState>) => {
  const initialState = { ...defaultState, ...initProps }

  return createStore<EditorStore>()(
    temporal(
      (set) => ({
        ...initialState,
        selectedItemIdx: { region: 'title', index: 0 },

        setEditorState: (newState) => set({ ...newState }),

        reset: () => set({ ...initialState }),

        addItem: (regionId, item) =>
          set((state) => {
            const newRegions = state.regions.map((region) => {
              if (region.id === regionId && Array.isArray(region.data)) {
                return {
                  ...region,
                  data: [...region.data, item],
                }
              }
              return region
            })
            return { regions: newRegions }
          }),

        updateItem: (regionId, index, updates) =>
          set((state) => {
            const newRegions = state.regions.map((region) => {
              if (region.id === regionId && Array.isArray(region.data)) {
                const newItems = [...region.data]
                if (newItems[index]) {
                  newItems[index] = { ...newItems[index], ...updates }
                }
                return {
                  ...region,
                  data: newItems,
                }
              }
              return region
            })
            return { regions: newRegions }
          }),

        removeItem: (regionId, index) =>
          set((state) => {
            const newRegions = state.regions.map((region) => {
              if (region.id === regionId && Array.isArray(region.data)) {
                const newItems = [...region.data]
                newItems.splice(index, 1)
                return {
                  ...region,
                  data: newItems,
                }
              }
              return region
            })
            return { regions: newRegions }
          }),

        setSelection: (selection) => set({ selectedItemIdx: selection }),
      }),
      {
        limit: 100, // History limit
        // Exclude selection from history
        partialize: (state) => {
          const { selectedItemIdx, ...rest } = state
          return rest
        },
      }
    )
  )
}

const EditorStoreContext = createContext<StoreApi<EditorStore> | null>(null)

export const EditorStoreProvider = ({
  children,
  initialState,
}: {
  children: React.ReactNode
  initialState?: EditorState
}) => {
  const [store] = useState(() => createEditorStore(initialState))

  return (
    <EditorStoreContext.Provider value={store}>
      {children}
    </EditorStoreContext.Provider>
  )
}

export function useEditorStore<T>(selector: (state: EditorStore) => T): T {
  const store = useContext(EditorStoreContext)
  if (!store) {
    throw new Error('useEditorStore must be used within EditorStoreProvider')
  }
  return useZustandStore(store, selector)
}

export const useEditorStoreApi = () => {
  const store = useContext(EditorStoreContext)
  if (!store) {
    throw new Error('useEditorStoreApi must be used within EditorStoreProvider')
  }
  return store
}
