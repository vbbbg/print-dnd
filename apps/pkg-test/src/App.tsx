import React, { useState } from 'react'
import { TemplateEditor, getMockEditorState, Paper } from 'print-dnd'
import 'print-dnd/style.css'

function App() {
  const [state, setState] = useState(getMockEditorState())

  const handleSave = (newState: unknown) => {
    console.log('Saved state:', newState)
    setState(newState as any)
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Print DND Package Test</h1>
      <div
        style={{ border: '1px solid #ccc', margin: '20px 0', height: '600px' }}
      >
        <TemplateEditor initialState={state} onSave={handleSave} />
      </div>
    </div>
  )
}

export default App
