import React from 'react'
import { View, Text, StyleSheet } from '@react-pdf/renderer'
import type { TableColumn } from '../types'

const styles = StyleSheet.create({
  table: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    borderBottomStyle: 'solid',
    alignItems: 'center',
    minHeight: 24,
  },
  headerRow: {
    backgroundColor: '#f9fafb', // gray-50
  },
  cell: {
    padding: 4,
    borderRightWidth: 1,
    borderRightColor: '#ccc',
    borderRightStyle: 'solid',
    textAlign: 'center',
    fontSize: 10,
  },
  footerRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    borderBottomStyle: 'solid',
    minHeight: 24,
    backgroundColor: '#f3f4f6', // gray-100 for total
  },
  subtotalRow: {
    backgroundColor: '#f9fafb', // gray-50
  },
  footerCell: {
    padding: 4,
    width: '100%',
    textAlign: 'right',
    fontSize: 10,
    fontWeight: 'bold',
  },
})

interface PdfTableProps {
  cols: TableColumn[]
  data: any[]
  showSubtotal?: boolean
  showTotal?: boolean
  grandTotal?: string // Formatted string for grand total
  subTotal?: string // Formatted string for page subtotal
}

export const PdfTable: React.FC<PdfTableProps> = ({
  cols,
  data,
  showSubtotal,
  showTotal,
  grandTotal,
  subTotal,
}) => {
  const visibleCols = cols.filter((col) => col.visible !== false)
  const totalWidth = visibleCols.reduce((sum, col) => sum + col.width, 0)

  // Prepare widths as percentages
  const colWidths = visibleCols.map((col) => ({
    ...col,
    widthPercent: (col.width / totalWidth) * 100,
  }))

  return (
    <View style={styles.table}>
      {/* Header */}
      <View style={[styles.row, styles.headerRow]}>
        {colWidths.map((col, idx) => (
          <Text
            key={col.colname}
            style={[
              styles.cell,
              { width: `${col.widthPercent}%`, fontWeight: 'bold' },
            ]}
          >
            {col.title || col.alias}
          </Text>
        ))}
      </View>

      {/* Body */}
      {data.map((row, rIdx) => (
        <View key={rIdx} style={styles.row}>
          {colWidths.map((col, cIdx) => (
            <Text
              key={`${rIdx}-${col.colname}`}
              style={[styles.cell, { width: `${col.widthPercent}%` }]}
            >
              {row[col.colname] !== undefined && row[col.colname] !== null
                ? String(row[col.colname])
                : ''}
            </Text>
          ))}
        </View>
      ))}

      {/* Footer (Subtotal) */}
      {showSubtotal && (
        <View style={[styles.row, styles.subtotalRow]}>
          {/* Can merge cells visually by just having one wide cell or matching structure.
               Usually subtotal is aligned to the right or spans all columns.
               Design mocks show "本页小计: ¥..." aligned right.
           */}
          <Text style={styles.footerCell}>本页小计: {subTotal || '¥0.00'}</Text>
        </View>
      )}

      {/* Footer (Total) */}
      {showTotal && (
        <View style={[styles.row, styles.footerRow]}>
          <Text style={styles.footerCell}>合计: {grandTotal || '¥0.00'}</Text>
        </View>
      )}
    </View>
  )
}
