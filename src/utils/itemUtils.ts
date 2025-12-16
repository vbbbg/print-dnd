import { EditorItem } from '../types/editor'

interface Margins {
  top: number
  bottom: number
  left: number
  right: number
}

export const constrainItemsToMargins = (
  items: EditorItem[],
  margins: Margins,
  paperWidth: number,
  paperHeight: number
): EditorItem[] => {
  if (!items) return []

  const minX = margins.left
  const maxXBound = paperWidth - margins.right
  const minY = margins.top
  const maxYBound = paperHeight - margins.bottom

  return items.map((item) => {
    let newItem = { ...item }

    // 1. Constrain Width/Height if they exceed printable area
    // Max allowable width/height based on current position (initially)
    // But better to just blindly clamp first?
    // Let's first ensure dimensions fit within the TOTAL printable area
    const maxPossibleWidth = maxXBound - minX
    const maxPossibleHeight = maxYBound - minY

    if (newItem.width > maxPossibleWidth) newItem.width = maxPossibleWidth
    if (newItem.height > maxPossibleHeight) newItem.height = maxPossibleHeight

    // 2. Shift Position if outside bounds
    // Left
    if (newItem.x < minX) newItem.x = minX
    // Top
    if (newItem.y < minY) newItem.y = minY
    // Right (Shift back left if pushing out right)
    if (newItem.x + newItem.width > maxXBound) {
      newItem.x = maxXBound - newItem.width
    }
    // Bottom (Shift back up if pushing out bottom)
    if (newItem.y + newItem.height > maxYBound) {
      newItem.y = maxYBound - newItem.height
    }

    // Final safety check (if shift failed due to size, though step 1 handles typical cases)
    // If somehow x < minX after right-shift (because width was massive), clamp x again
    if (newItem.x < minX) newItem.x = minX
    if (newItem.y < minY) newItem.y = minY

    return newItem
  })
}
