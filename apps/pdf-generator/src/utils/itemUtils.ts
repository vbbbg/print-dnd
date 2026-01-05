import type { EditorItem } from '../types'

export const resolveTitleItemText = (
  item: EditorItem,
  data: Record<string, any> = {}
): string => {
  // Title Region: Prioritize Alias (Static) > Data Value
  if (item.field && data[item.field]) {
    return item.alias || data[item.field]
  }
  return item.alias || item.value || item.name || ''
}

export const resolveItemText = (
  item: EditorItem,
  data: Record<string, any> = {}
): string => {
  // Header Region: "Label: Value"
  if (item.field && data[item.field] !== undefined) {
    const label = item.alias || item.name
    return label ? `${label}: ${data[item.field]}` : `${data[item.field]}`
  }
  return item.alias || item.value || item.name || ''
}
