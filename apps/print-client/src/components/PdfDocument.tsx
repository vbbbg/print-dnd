import React, { useMemo } from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import type {
  EditorState,
  EditorItem,
  FreeLayoutRegion,
  TableRegion,
} from '../types'
import { resolveItemText } from '../utils/itemUtils'
import { PdfTable } from './PdfTable'

// Helper: Convert mm to pt (1mm = 2.83465pt)
const mm2pt = (mm: number) => mm * 2.83465

// Register common styles
const styles = StyleSheet.create({
  page: {
    fontFamily: 'Noto Sans SC',
  },
})

interface PdfDocumentProps {
  template: EditorState
  data: any[]
}

export const PdfDocument: React.FC<PdfDocumentProps> = ({ template, data }) => {
  // Page Dimensions
  const safeWidthMm = Number(template.paperWidth) || 210
  const safeHeightMm = Number(template.paperHeight) || 297
  const widthPt = mm2pt(safeWidthMm)
  const heightPt = mm2pt(safeHeightMm)
  const isValidSize =
    Number.isFinite(widthPt) &&
    Number.isFinite(heightPt) &&
    widthPt > 0 &&
    heightPt > 0

  // Debug
  console.log(`[PdfDocument] Size: ${safeWidthMm}mm x ${safeHeightMm}mm`)

  // Ensure we have at least one document object to render (even if empty) to ensure at least one page
  const documentsToRender = data && data.length > 0 ? data : [{}]

  return (
    <Document>
      {documentsToRender.map((docData, docIdx) => (
        <PaginatedDocument
          key={docIdx}
          template={template}
          docData={docData}
          widthPt={isValidSize ? widthPt : 595.28}
          heightPt={isValidSize ? heightPt : 841.89}
        />
      ))}
    </Document>
  )
}

interface PaginatedDocumentProps {
  template: EditorState
  docData: any
  widthPt: number
  heightPt: number
}

const PaginatedDocument: React.FC<PaginatedDocumentProps> = ({
  template,
  docData,
  widthPt,
  heightPt,
}) => {
  // 1. Extract Regions
  const tableRegion = template.regions.find((r) => r.type === 'table') as
    | TableRegion
    | undefined

  // All other regions are considered "static" layers (free-layout)
  // We sort them by Z-index or just render them.
  // For now, we assume they are distinct vertical sections or overlays.
  const freeRegions = template.regions.filter(
    (r) => r.type === 'free-layout'
  ) as FreeLayoutRegion[]

  // 2. Calculate Available Table Space
  // We determine the table boundaries based on its position and the next region below it.
  const bodyTopMm = tableRegion?.top || 50

  // Find the nearest region *below* the table to act as the bottom boundary
  // If no region is below, use paper height - margin
  const nextRegionTop = template.regions
    .filter((r) => r.top > bodyTopMm && r !== tableRegion)
    .sort((a, b) => a.top - b.top)[0]?.top

  const bottomBoundaryMm =
    nextRegionTop || template.paperHeight - template.margins.bottom
  const tableRegionHeightMm = bottomBoundaryMm - bodyTopMm

  // Safety check
  const safeTableHeightMm = Math.max(tableRegionHeightMm, 20) // at least 20mm

  // 3. Estimate Row Height & Header/Footer Height
  // These are approximations in mm.
  const ROW_HEIGHT_MM = 8
  const HEADER_HEIGHT_MM = 8
  const SUBTOTAL_HEIGHT_MM = 8 // For "本页小计"
  const TOTAL_HEIGHT_MM = 8 // For "合计"

  // 4. Prepare Data
  const tableItem = tableRegion?.data?.[0]
  const tableCols = tableItem?.cols || []
  const showSubtotal = tableItem?.showSubtotal
  const showTotal = tableItem?.showTotal

  const tableDataList = Array.isArray(docData.list) ? docData.list : []

  // 5. Pagination Logic
  const pages = useMemo(() => {
    const chunks: any[][] = []

    // Available height for DATA ROWS on a NORMAL page (not last)
    // = RegionHeight - Header - Subtotal
    const normalPageAvailableHeight =
      safeTableHeightMm - HEADER_HEIGHT_MM - SUBTOTAL_HEIGHT_MM
    const normalPageRows = Math.floor(normalPageAvailableHeight / ROW_HEIGHT_MM)
    const safeNormalPageRows = Math.max(1, normalPageRows)

    let currentRow = 0
    const totalRowsItems = tableDataList.length

    while (currentRow < totalRowsItems) {
      let limit = safeNormalPageRows
      const remaining = totalRowsItems - currentRow

      // Check if we can fit all remaining + TOTAL on the current page
      if (remaining <= limit) {
        // Content height if we put everything here + Total row
        const contentHeight =
          HEADER_HEIGHT_MM +
          remaining * ROW_HEIGHT_MM +
          SUBTOTAL_HEIGHT_MM +
          (showTotal ? TOTAL_HEIGHT_MM : 0)

        if (contentHeight > safeTableHeightMm) {
          // Cannot fit logic: we need to split.
          // Logic: Can we fit (Region - Header - Subtotal - Total) rows?
          const lastPageMaxRowsWithTotal = Math.floor(
            (safeTableHeightMm -
              HEADER_HEIGHT_MM -
              SUBTOTAL_HEIGHT_MM -
              (showTotal ? TOTAL_HEIGHT_MM : 0)) /
              ROW_HEIGHT_MM
          )

          if (lastPageMaxRowsWithTotal >= 1) {
            // We can fit some rows with the total.
            limit = lastPageMaxRowsWithTotal
          } else {
            // If we can't fit ANY rows with the total, we just fill this page with 'limit' (normal rows)
          }
        } else {
          // Fits!
          limit = remaining
        }
      }

      const chunk = tableDataList.slice(currentRow, currentRow + limit)
      chunks.push(chunk)
      currentRow += limit
    }

    // If no data, ensure at least one page
    if (chunks.length === 0) chunks.push([])

    return chunks
  }, [tableDataList, safeTableHeightMm, showTotal])

  const renderItem = (item: EditorItem, keyPrefix: string) => {
    const text = resolveItemText(item, docData)
    return (
      <Text
        key={keyPrefix}
        style={{
          position: 'absolute',
          left: `${item.x}mm`,
          top: `${item.y}mm`,
          width: `${item.width}mm`,
          height: `${item.height}mm`,
          fontSize: item.fontSize || 10,
          fontFamily: item.fontFamily || 'Noto Sans SC',
          color: item.fontColor || '#000000',
          textAlign: item.horizontalAlignment || 'left',
          fontWeight: item.bold ? 'bold' : 'normal',
          fontStyle: item.italic ? 'italic' : 'normal',
          textDecoration: item.underline ? 'underline' : 'none',
        }}
      >
        {text}
      </Text>
    )
  }

  const formatMoney = (n: number) => `¥${n.toFixed(2)}`

  return (
    <>
      {pages.map((pageRows, pageIdx) => {
        const isLastPage = pageIdx === pages.length - 1

        // Calculate Subtotal for this page
        const pageSubTotalVal = pageRows.reduce((sum, row) => {
          let val = 0
          if (typeof row.amount === 'number') val = row.amount
          else if (typeof row.amount === 'string')
            val = parseFloat(row.amount.replace(/[^0-9.-]+/g, '')) || 0
          return sum + val
        }, 0)

        // Calculate Grand Total
        let grandTotalStr = '¥0.00'
        if (docData.currentDue) {
          grandTotalStr = docData.currentDue
        } else {
          const allTotal = tableDataList.reduce((sum: number, row: any) => {
            let val = 0
            if (typeof row.amount === 'number') val = row.amount
            else if (typeof row.amount === 'string')
              val = parseFloat(row.amount.replace(/[^0-9.-]+/g, '')) || 0
            return sum + val
          }, 0)
          grandTotalStr = formatMoney(allTotal)
        }

        const subTotalStr = formatMoney(pageSubTotalVal)

        return (
          <Page
            key={pageIdx}
            size={widthPt > 0 ? [widthPt, heightPt] : 'A4'}
            style={styles.page}
          >
            {/* Static Layers */}
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
              }}
            >
              {/* Render All Free Layout Regions */}
              {freeRegions.map((region, rIdx) =>
                region.data?.map((item, iIdx) =>
                  renderItem(item, `r-${rIdx}-i-${iIdx}`)
                )
              )}
            </View>

            {/* Table Region */}
            {tableRegion && (
              <View
                style={{
                  position: 'absolute',
                  left: `${template.margins.left}mm`,
                  top: `${bodyTopMm}mm`,
                  width: `${template.paperWidth - template.margins.left - template.margins.right}mm`,
                  height: `${tableRegionHeightMm}mm`,
                }}
              >
                <PdfTable
                  cols={tableCols}
                  data={pageRows}
                  showSubtotal={showSubtotal}
                  showTotal={isLastPage && showTotal}
                  subTotal={subTotalStr}
                  grandTotal={grandTotalStr}
                />
              </View>
            )}
          </Page>
        )
      })}
    </>
  )
}
