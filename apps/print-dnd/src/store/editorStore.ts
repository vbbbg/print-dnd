import { create } from 'zustand'
import { temporal } from 'zundo'
import { EditorState, EditorItem } from '../types/editor'
import { getMockEditorState } from '../utils/mockData'

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

interface EditorStore extends EditorState, EditorActions {
  selectedItemIdx: {
    region: string // regionId
    index: number
  } | null
}

const initialState: EditorState = getMockEditorState()

export const useEditorStore = create<EditorStore>()(
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
