import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import type { EditorState, EditorItem } from '../types'
import { resolveItemText } from '../utils/itemUtils'

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

  const renderItem = (item: EditorItem, keyPrefix: string) => {
    // For single page static generation, we use the first data row or empty?
    // User said "ignore table", but didn't say "don't bind data".
    // But usually Header info (Order ID etc) is in data[0] or passed separately.
    // We'll try to pick from data[0] if available for now.
    const rowData = data && data.length > 0 ? data[0] : {}
    const text = resolveItemText(item, rowData)

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
          // Vertical alignment is tricky in react-pdf Text.
          // Usually needs a View wrapper or padding calculation if strictly needed.
          // But Text handles basic lineHeight.
        }}
      >
        {text}
      </Text>
    )
  }

  return (
    <Document>
      {/* Single Page Generation as requested */}
      <Page size={isValidSize ? [widthPt, heightPt] : 'A4'} style={styles.page}>
        {/* Static Layout Layers */}
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
          }}
        >
          {/* Header Items */}
          {template.headerItems?.map((item, idx) =>
            renderItem(item, `h-${idx}`)
          )}

          {/* Title Items */}
          {template.titleItems?.map((item, idx) =>
            renderItem(item, `t-${idx}`)
          )}

          {/* Footer Items */}
          {template.footerItems?.map((item, idx) =>
            renderItem(item, `f-${idx}`)
          )}
        </View>

        {/* Table/Body is IGNORED as requested */}
      </Page>
    </Document>
  )
}
