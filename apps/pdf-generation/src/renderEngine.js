/**
 * Renders the HTML content for Puppeteer based on the JSON template and data.
 * @param {Object} template - The EditorState JSON.
 * @param {Object} data - The dynamic data (e.g., { customerName: 'John', list: [...] }).
 * @returns {string} - The complete HTML string.
 */
function buildHtmlFromTemplate(template, data) {
  const {
    paperWidth,
    paperHeight,
    headerItems,
    bodyItems,
    footerItems,
    bodyTop,
    titleItems,
  } = template

  // --- PAGINATION LOGIC ---
  // 1. Calculate the available maximum height for the table on a single page.
  //    Condition: "Table area insufficient" -> Split to next page.
  //    We need to find the Y-start of the footer to know where the table must stop.
  //    If no footer items, assume a margin-bottom (e.g., 20mm).
  let footerMergeY = paperHeight - 20 // Default safe bottom limit
  if (footerItems && footerItems.length > 0) {
    // Find the topmost item in the footer
    const topFooterItemY = Math.min(...footerItems.map((item) => item.y))
    footerMergeY = topFooterItemY
  }

  const availableHeightMm = footerMergeY - bodyTop
  const ESTIMATED_ROW_HEIGHT_MM = 10 // Approximation: 10mm per row ~ 38px
  // Safety margin to prevent overflow
  const maxRowsPerPage = Math.floor(availableHeightMm / ESTIMATED_ROW_HEIGHT_MM)

  // 2. Split the list data into chunks
  const fullList = data.list || []
  let rowChunks = []

  if (fullList.length === 0) {
    // Even if no data, we want at least one page
    rowChunks = [[]]
  } else {
    for (let i = 0; i < fullList.length; i += maxRowsPerPage) {
      rowChunks.push(fullList.slice(i, i + maxRowsPerPage))
    }
  }

  // CSS for A4/Custom page size
  // We use "mm" units directly as they are valid in CSS
  const style = `
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');
      
      @page {
        margin: 0;
        size: ${paperWidth}mm ${paperHeight}mm;
      }
      
      body {
        margin: 0;
        padding: 0;
        font-family: 'Inter', sans-serif;
        background: #ccc; /* Visual separation for debug, usually not seen in print if margin 0 */
      }

      /* Container for each physical page */
      .page {
        width: ${paperWidth}mm;
        height: ${paperHeight}mm;
        position: relative;
        overflow: hidden; 
        background: white;
        page-break-after: always; /* Force new page after each .page div */
      }

      .page:last-child {
        page-break-after: auto;
      }

      * {
        box-sizing: border-box;
      }

      /* Absolute positioning wrapper for Header/Footer items */
      .item {
        position: absolute;
        overflow: hidden;
        white-space: pre-wrap;
        word-break: break-all;
        line-height: 1.2;
      }

      /* Table Styles */
      .print-table {
        position: absolute;
        width: 100%;
        /* We place the table at the bodyTop position */
        top: ${bodyTop}mm; 
        left: 0;
        padding: 0 ${template.margins?.left || 0}mm 0 ${template.margins?.right || 0}mm;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        font-size: 12px;
      }

      th, td {
        border: 1px solid #000;
        padding: 4px;
        text-align: center;
      }
      
      th {
        background-color: #f3f4f6;
        font-weight: bold;
      }

      /* Utility classes for alignment */
      .text-left { text-align: left; }
      .text-center { text-align: center; }
      .text-right { text-align: right; }
      .align-top { align-items: flex-start; }
      .align-middle { align-items: center; }
      .align-bottom { align-items: flex-end; }
      
      .flex { display: flex; }
    </style>
  `

  // Generate HTML for each page
  const pagesHtml = rowChunks
    .map((rows, pageIndex) => {
      // Header, Title, Footer are repeated on each page
      return `
      <div class="page">
        <!-- Header Items -->
        ${renderItems(headerItems, data, 'header')}
        
        <!-- Document Title Items -->
        ${renderItems(titleItems, data, 'title')}

        <!-- Body (Table) Segment -->
        <div class="print-table">
          ${renderTable(
            bodyItems,
            rows,
            pageIndex === rowChunks.length - 1 // showTotal only on last page
          )}
        </div>

        <!-- Footer Items -->
        ${renderItems(footerItems, data, 'footer')}
        
        <!-- Optional Page Number Debug -->
        <!-- <div style="position:absolute; bottom:5mm; right:5mm; font-size:10px;">Page ${pageIndex + 1}/${rowChunks.length}</div> -->
      </div>
    `
    })
    .join('\n')

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        ${style}
      </head>
      <body>
        ${pagesHtml}
      </body>
    </html>
  `
}

/**
 * Renders a list of absolute positioned items.
 */
function renderItems(items, data, region) {
  if (!items || !items.length) return ''

  return items
    .map((item) => {
      if (item.visible === false) return ''

      // Values: prioritize mapped field data, fallback to static value
      // Match logic from DraggableItem.tsx to preserve labels
      let text = item.alias || item.value || item.name || ''

      if (item.field && data[item.field] !== undefined) {
        // If we have field data, we should format it as "Label: Value"
        // assuming there is a label (alias or name)
        const label = item.alias || item.name
        // Do NOT prefix label for 'title' region items or if label is missing
        if (label && region !== 'title') {
          text = `${label}: ${data[item.field]}`
        } else {
          text = data[item.field]
        }
      }

      // Styles
      const styles = [
        `left: ${item.x}mm`,
        `top: ${item.y}mm`,
        `width: ${item.width}mm`,
        `height: ${item.height}mm`,
        `font-size: ${item.fontSize || 12}pt`,
        `font-family: ${item.fontFamily || 'sans-serif'}`,
        `color: ${item.fontColor || '#000'}`,
        item.bold ? 'font-weight: bold' : '',
        item.italic ? 'font-style: italic' : '',
        item.underline ? 'text-decoration: underline' : '',
        // Flex alignment
        `display: flex`,
        item.horizontalAlignment
          ? `justify-content: ${mapAlign(item.horizontalAlignment)}`
          : '',
        item.verticalAlignment
          ? `align-items: ${mapVAlign(item.verticalAlignment)}`
          : '',
      ]
        .filter(Boolean)
        .join(';')

      return `<div class="item" style="${styles}">${text}</div>`
    })
    .join('\n')
}

/**
 * Renders the data table.
 */
function renderTable(tableData, rows, isLastPage) {
  if (!tableData || !tableData.cols) return ''

  const visibleCols = tableData.cols.filter((c) => c.visible !== false)

  // Calculate total width of defined columns to assign percentages
  const totalWidth = visibleCols.reduce((sum, col) => sum + col.width, 0)

  const headerHtml = visibleCols
    .map((col) => {
      const widthPercent = (col.width / totalWidth) * 100
      return `<th style="width: ${widthPercent}%">${col.title || col.alias || ''}</th>`
    })
    .join('')

  const bodyHtml = rows
    .map((row, rowIndex) => {
      const cells = visibleCols
        .map((col) => {
          // Assuming row data keys match column 'colname'
          const cellValue =
            row[col.colname] !== undefined ? row[col.colname] : ''
          return `<td>${cellValue}</td>`
        })
        .join('')
      return `<tr>${cells}</tr>`
    })
    .join('')

  // Subtotal / Total rows
  // Only show Total on the last page if enabled
  let footerHtml = ''
  if (tableData.showTotal && isLastPage) {
    // Simple total row spanning all columns
    footerHtml += `
        <tr>
            <td colspan="${visibleCols.length}" style="text-align: right; font-weight: bold;">
                合计: (Calculated in Backend or passed in data)
            </td>
        </tr>
      `
  }

  return `
    <table>
      <thead>
        <tr>${headerHtml}</tr>
      </thead>
      <tbody>
        ${bodyHtml}
        ${footerHtml}
      </tbody>
    </table>
  `
}

function mapAlign(align) {
  if (align === 'center') return 'center'
  if (align === 'right') return 'flex-end'
  return 'flex-start'
}

function mapVAlign(align) {
  if (align === 'center') return 'center'
  if (align === 'bottom') return 'flex-end'
  return 'flex-start'
}

module.exports = { buildHtmlFromTemplate }
