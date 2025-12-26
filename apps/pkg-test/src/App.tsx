import React, { useState } from 'react'
import { TemplateEditor, getMockEditorState, Paper } from 'print-dnd'
// Directly import source code for testing
import { generatePdf } from '../../print-client/src/index'
import 'print-dnd/style.css'

const generateList = (count: number) => {
  return Array.from({ length: count }).map((_, i) => ({
    serialNumber: i + 1,
    spuName: `测试商品长长长长长长长长名称 ${i + 1}`,
    skuName: `测试规格 ${i + 1}`,
    unitName: '个',
    qty: 10 + i,
    price: (100 + i * 10).toFixed(2),
    amount: ((100 + i * 10) * (10 + i)).toFixed(2),
    remark: i % 5 === 0 ? '加急' : '',
  }))
}

const MOCK_DATA = {
  // Common Fields
  title: '销售单',
  // Header Fields
  billNo: 'SO-20241217-001',
  customerName: '深圳市华为技术有限公司',
  makeTimeDate: '2024-12-17 10:30:00',
  fullAddress: '广东省深圳市龙岗区坂田街道华为基地',
  contactName: '张三',
  contactPhone: '13800138000',
  remark: '请发顺丰特快，谢谢合作。',
  // Footer Fields
  handlerName: '李四',
  examineUserName: '王五',
  currentDue: '¥999,996.00',
  // Table Data List - Generated 50 rows (enough for 2-3 pages)
  list: generateList(50),
}

function App() {
  const [state, setState] = useState(getMockEditorState())

  const handleSave = (newState: unknown) => {
    console.log('Saved state:', newState)
    setState(newState as any)
  }

  const handleGeneratePdf = async () => {
    console.log('Generating PDF...')
    try {
      // Pass MOCK_DATA
      const blob = await generatePdf(state, [MOCK_DATA])
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'test.pdf'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      console.log('PDF generated and downloaded')
    } catch (e) {
      console.error('Failed to generate PDF', e)
    }
  }

  return (
    <div
      style={{ border: '1px solid #ccc', margin: '20px 0', height: '600px' }}
    >
      <TemplateEditor
        initialState={state}
        onSave={handleSave}
        onPrintPreview={handleGeneratePdf}
      />
    </div>
  )
}

export default App
