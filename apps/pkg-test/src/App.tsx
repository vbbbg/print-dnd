import React, { useState } from 'react'
import { TemplateEditor, getMockEditorState, Paper } from 'print-dnd'
import { generatePdf } from 'print-client'
import 'print-dnd/style.css'

function App() {
  const [state, setState] = useState(getMockEditorState())

  const handleSave = (newState: unknown) => {
    console.log('Saved state:', newState)
    setState(newState as any)
  }

  const handleGeneratePdf = async () => {
    console.log('Generating PDF...')
    try {
      const blob = await generatePdf(state, [{}]) // Pass empty data row
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
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h1>Print DND Package Test</h1>
        <button
          onClick={handleGeneratePdf}
          style={{
            padding: '8px 16px',
            backgroundColor: '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Generate PDF
        </button>
      </div>
      <div
        style={{ border: '1px solid #ccc', margin: '20px 0', height: '600px' }}
      >
        <TemplateEditor initialState={state} onSave={handleSave} />
      </div>
    </div>
  )
}

export default App
