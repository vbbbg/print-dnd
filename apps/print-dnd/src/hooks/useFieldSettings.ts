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
  // --- Common Logic for Free Layout Regions ---
  const getRegionItems = (regionId: string): EditorItem[] => {
    const region = state.regions.find((r) => r.id === regionId)
    if (region && region.items) return region.items
    return []
  }

  const isFreeLayoutFieldActive = (items: EditorItem[], fieldValue: string) => {
    return items.some((item) => item.field === fieldValue)
  }

  const toggleFreeLayoutItem = (
    regionId: string,
    field: JsonField,
    updateState: (newItems: EditorItem[]) => void
  ) => {
    const currentItems = getRegionItems(regionId)
    const isActive = isFreeLayoutFieldActive(currentItems, field.value)
    let newItems = [...currentItems]

    if (isActive) {
      // Remove
      newItems = newItems.filter((item) => item.field !== field.value)
    } else {
      // Add
      const marginLeft = state.margins?.left || 0
      const defaultX = marginLeft
      // Default to top of region (relative y = 0)
      const defaultY = 0

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

  const updateRegionItems = (regionId: string, newItems: EditorItem[]) => {
    const idx = state.regions.findIndex((r) => r.id === regionId)
    if (idx === -1) return

    const newRegions = [...state.regions]
    newRegions[idx] = { ...newRegions[idx], items: newItems }
    onChange({ regions: newRegions })
  }

  // --- Header Fields Logic ---
  const headerFields = useMemo(() => items.header, [])

  const isHeaderFieldActive = (fieldValue: string) => {
    return isFreeLayoutFieldActive(getRegionItems('header'), fieldValue)
  }

  const toggleHeaderField = (field: JsonField) => {
    toggleFreeLayoutItem('header', field, (newItems) =>
      updateRegionItems('header', newItems)
    )
  }

  // --- Body Fields Logic ---
  const bodyFields = useMemo(() => items.body, [])

  const getBodyData = () => {
    const region = state.regions.find((r) => r.id === 'body')
    // Treat data as TableData if region type is table
    if (region && region.type === 'table' && region.data) return region.data
    return { cols: [] } // fallback
  }

  const isBodyFieldActive = (fieldValue: string) => {
    const data = getBodyData()
    if (!data.cols) return false
    return data.cols.some(
      (col) => col.colname === fieldValue && col.visible !== false
    )
  }

  const toggleBodyField = (field: JsonField) => {
    const active = isBodyFieldActive(field.value)
    const data = getBodyData()
    if (!data.cols) return

    let newCols = [...data.cols]
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

    // Update body region
    const idx = state.regions.findIndex((r) => r.id === 'body')
    if (idx !== -1) {
      const newRegions = [...state.regions]
      newRegions[idx] = {
        ...newRegions[idx],
        data: { ...newRegions[idx].data, cols: newCols },
      }
      onChange({ regions: newRegions })
    }
  }

  // --- Footer Fields Logic ---
  const footerFields = useMemo(() => items.footer, [])

  const isFooterFieldActive = (fieldValue: string) => {
    return isFreeLayoutFieldActive(getRegionItems('footer'), fieldValue)
  }

  const toggleFooterField = (field: JsonField) => {
    toggleFreeLayoutItem('footer', field, (newItems) =>
      updateRegionItems('footer', newItems)
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
