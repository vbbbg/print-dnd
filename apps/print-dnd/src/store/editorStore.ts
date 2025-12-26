import { create } from 'zustand'
import { temporal } from 'zundo'
import { EditorState, EditorItem, TableData } from '../types/editor'
import { getMockEditorState } from '../utils/mockData'

interface EditorActions {
  // Initialization
  setEditorState: (state: EditorState) => void
  reset: () => void

  // Item Management
  addItem: (region: 'header' | 'footer' | 'title', item: EditorItem) => void
  updateItem: (
    region: 'header' | 'footer' | 'title',
    index: number,
    updates: Partial<EditorItem>
  ) => void
  removeItem: (region: 'header' | 'footer' | 'title', index: number) => void

  // Table Management
  updateTable: (updates: Partial<TableData>) => void

  // Selection
  setSelection: (
    selection: {
      region: 'title' | 'header' | 'footer' | 'body'
      index: number
    } | null
  ) => void
}

interface EditorStore extends EditorState, EditorActions {
  selectedItemIdx: {
    region: 'title' | 'header' | 'footer' | 'body'
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

      addItem: (region, item) =>
        set((state) => ({
          ...state,
          [region + 'Items']: [
            ...(state[(region + 'Items') as keyof EditorState] as EditorItem[]),
            item,
          ],
        })),

      updateItem: (region, index, updates) =>
        set((state) => {
          const items = state[
            (region + 'Items') as keyof EditorState
          ] as EditorItem[]
          const newItems = [...items]
          newItems[index] = { ...newItems[index], ...updates }
          return { [region + 'Items']: newItems }
        }),

      removeItem: (region, index) =>
        set((state) => {
          const items = state[
            (region + 'Items') as keyof EditorState
          ] as EditorItem[]
          const newItems = [...items]
          newItems.splice(index, 1)
          return { [region + 'Items']: newItems }
        }),

      updateTable: (updates) =>
        set((state) => ({
          bodyItems: { ...state.bodyItems, ...updates },
        })),

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
