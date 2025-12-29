import { create } from 'zustand'
import { temporal } from 'zundo'
import { EditorState, EditorItem, TableData } from '../types/editor'
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

  // Table Management
  updateTable: (updates: Partial<TableData>) => void

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
            if (region.id === regionId && region.items) {
              return {
                ...region,
                items: [...region.items, item],
              }
            }
            return region
          })
          return { regions: newRegions }
        }),

      updateItem: (regionId, index, updates) =>
        set((state) => {
          const newRegions = state.regions.map((region) => {
            if (region.id === regionId && region.items) {
              const newItems = [...region.items]
              newItems[index] = { ...newItems[index], ...updates }
              return {
                ...region,
                items: newItems,
              }
            }
            return region
          })
          return { regions: newRegions }
        }),

      removeItem: (regionId, index) =>
        set((state) => {
          const newRegions = state.regions.map((region) => {
            if (region.id === regionId && region.items) {
              const newItems = [...region.items]
              newItems.splice(index, 1)
              return {
                ...region,
                items: newItems,
              }
            }
            return region
          })
          return { regions: newRegions }
        }),

      updateTable: (updates) =>
        set((state) => {
          const newRegions = state.regions.map((region) => {
            if (region.type === 'table' && region.data) {
              return {
                ...region,
                data: { ...region.data, ...updates },
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
