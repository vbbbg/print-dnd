import { useMemo } from 'react'
import { EditorState, EditorItem, TableColumn } from '../types/editor'
import { JsonField, ItemsJson } from '../types/fields'

import itemsData from '@/assets/items.json'

const items = itemsData as ItemsJson

interface UseFieldSettingsProps {
  state: EditorState
  onChange: (updates: Partial<EditorState>) => void
}

export const useFieldSettings = ({
  state,
  onChange,
}: UseFieldSettingsProps) => {
  // --- Common Logic for Free Layout Regions (Header/Footer) ---
  const isFreeLayoutFieldActive = (items: EditorItem[], fieldValue: string) => {
    return items.some((item) => item.field === fieldValue)
  }

  const toggleFreeLayoutItem = (
    currentItems: EditorItem[],
    regionTop: number,
    field: JsonField,
    updateState: (newItems: EditorItem[]) => void
  ) => {
    const isActive = isFreeLayoutFieldActive(currentItems, field.value)
    let newItems = [...currentItems]

    if (isActive) {
      // Remove
      newItems = newItems.filter((item) => item.field !== field.value)
    } else {
      // Add
      const marginLeft = state.margins?.left || 0
      const defaultX = marginLeft
      // Default to top-left of region (no staggering)
      const defaultY = regionTop

      const newItem: EditorItem = {
        type: 'text',
        x: defaultX,
        y: defaultY,
        width: 40,
        height: 8,
        value: field.key + ':',
        name: field.key,
        field: field.value,
        fontSize: 11,
        fontFamily: 'SimHei',
        fontColor: '#000000',
      }
      newItems.push(newItem)
    }
    updateState(newItems)
  }

  // --- Header Fields Logic ---
  const headerFields = useMemo(() => items.header, [])

  const isHeaderFieldActive = (fieldValue: string) => {
    return isFreeLayoutFieldActive(state.headerItems, fieldValue)
  }

  const toggleHeaderField = (field: JsonField) => {
    toggleFreeLayoutItem(
      state.headerItems,
      state.headerTop,
      field,
      (newItems) => onChange({ headerItems: newItems })
    )
  }

  // --- Body Fields Logic ---
  const bodyFields = useMemo(() => items.body, [])

  const isBodyFieldActive = (fieldValue: string) => {
    return state.bodyItems.cols.some(
      (col) => col.colname === fieldValue && col.visible !== false
    )
  }

  const toggleBodyField = (field: JsonField) => {
    const active = isBodyFieldActive(field.value)
    let newCols = [...state.bodyItems.cols]
    const existingColIndex = newCols.findIndex(
      (col) => col.colname === field.value
    )

    if (active) {
      // Hide if exists
      if (existingColIndex !== -1) {
        newCols[existingColIndex] = {
          ...newCols[existingColIndex],
          visible: false,
        }
      }
    } else {
      // Show or Add
      if (existingColIndex !== -1) {
        newCols[existingColIndex] = {
          ...newCols[existingColIndex],
          visible: true,
        }
      } else {
        const newCol: TableColumn = {
          title: field.key,
          colname: field.value,
          width: Math.max(field.width || 20, 20),
          visible: true,
        }
        newCols.push(newCol)
      }
    }

    onChange({
      bodyItems: {
        ...state.bodyItems,
        cols: newCols,
      },
    })
  }

  // --- Footer Fields Logic ---
  const footerFields = useMemo(() => items.footer, [])

  const isFooterFieldActive = (fieldValue: string) => {
    return isFreeLayoutFieldActive(state.footerItems, fieldValue)
  }

  const toggleFooterField = (field: JsonField) => {
    toggleFreeLayoutItem(
      state.footerItems,
      state.footerTop,
      field,
      (newItems) => onChange({ footerItems: newItems })
    )
  }

  return {
    headerFields,
    isHeaderFieldActive,
    toggleHeaderField,
    bodyFields,
    isBodyFieldActive,
    toggleBodyField,
    footerFields,
    isFooterFieldActive,
    toggleFooterField,
  }
}
