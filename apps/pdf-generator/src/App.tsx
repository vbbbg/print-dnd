import { useEffect, useState } from 'react'
import { PDFViewer } from '@react-pdf/renderer'
import { PdfDocument } from './components/PdfDocument'
import { registerFonts } from './utils/font'
import type { EditorState } from './types'

// Register fonts on app load
registerFonts()

function App() {
  const [template, setTemplate] = useState<EditorState | null>(null)
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 1. Try to get data from opener
    const receiveMessage = (event: MessageEvent) => {
      // Validate origin if needed
      if (event.data?.type === 'PRINT_DATA') {
        const { template: msgTemplate, data: msgData } = event.data
        setTemplate(msgTemplate)
        setData(msgData)
        setLoading(false)
        // Ack
        if (event.source && 'postMessage' in event.source) {
          ;(event.source as Window).postMessage(
            { type: 'PRINT_CLIENT_RECEIVED' },
            '*'
          )
        }
      }
    }

    window.addEventListener('message', receiveMessage)

    // Notify opener we are ready
    if (window.opener) {
      window.opener.postMessage({ type: 'PRINT_CLIENT_READY' }, '*')
    } else {
      // Fallback for dev/testing: Look in localStorage or URL
      const localData = localStorage.getItem('PRINT_DATA_DEBUG')
      if (localData) {
        try {
          const parsed = JSON.parse(localData)
          setTemplate(parsed.template)
          setData(parsed.data)
          setLoading(false)
        } catch (e) {
          console.error('Failed to parse local debug data')
        }
      }
    }

    // Simulate loading finish if no opener (e.g. standalone access)
    // In real app, might want to show "No Data" state
    const timer = setTimeout(() => {
      if (!window.opener && !localStorage.getItem('PRINT_DATA_DEBUG')) {
        setLoading(false)
      }
    }, 1000)

    return () => {
      window.removeEventListener('message', receiveMessage)
      clearTimeout(timer)
    }
  }, [])

  if (loading) {
    return <div style={{ padding: 20 }}>Loading print data...</div>
  }

  if (!template) {
    return (
      <div style={{ padding: 20 }}>
        <h1>No Data Received</h1>
        <p>Please open this window via the Print Editor.</p>
      </div>
    )
  }

  return (
    <PDFViewer style={{ width: '100vw', height: '100vh' }}>
      <PdfDocument template={template} data={data} />
    </PDFViewer>
  )
}

export default App
