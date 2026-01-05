import { generatePdf } from 'pdf-generator'
import { TemplateEditor } from './components/TemplateEditor'
import { EditorLeftSidebar } from './components/EditorLeftSidebar'
import { EditorRightSidebar } from './components/EditorRightSidebar'
import { ToolbarState, ToolbarGroup } from './components/Toolbar'
import { Undo, Redo, ZoomIn, ZoomOut, RotateCcw, Printer } from 'lucide-react'
import { componentRegistry } from './core/ComponentRegistry'
import { TextPlugin } from './plugins/TextPlugin'
import { ImagePlugin } from './plugins/ImagePlugin'
import { TablePlugin } from './plugins/TablePlugin'

import { MOCK_REAL_DATA } from './utils/mockRealData'
import { EditorState } from '@/types/editor.ts'
import { getMockEditorState } from '@/utils/mockData.ts'

// Register default plugins
componentRegistry.register(TextPlugin)
componentRegistry.register(ImagePlugin)
componentRegistry.register(TablePlugin)

function App() {
  const handlePreview = async (editorState?: EditorState) => {
    if (!editorState) {
      console.error('Preview failed: No editor state provided')
      return
    }
    try {
      console.log('Generating PDF preview...', editorState)
      // Use current editor state and mock data
      const blob = await generatePdf(editorState, [MOCK_REAL_DATA])
      const url = URL.createObjectURL(blob)

      // Create hidden link to download
      const a = document.createElement('a')
      a.href = url
      a.download = `preview-${Date.now()}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      console.log('PDF generated successfully')
    } catch (error) {
      console.error('Failed to generate PDF:', error)
      alert('生成PDF失败，请查看控制台日志')
    }
  }

  const customToolbar = (state: ToolbarState): ToolbarGroup[] => [
    {
      id: 'history',
      items: [
        {
          id: 'undo',
          action: 'undo',
          icon: Undo,
          disabled: !state.canUndo,
          title: '撤回',
        },
        {
          id: 'redo',
          action: 'redo',
          icon: Redo,
          disabled: !state.canRedo,
          title: '重做',
        },
      ],
    },
    {
      id: 'zoom',
      items: [
        {
          id: 'zoom-out',
          action: 'zoom-out',
          icon: ZoomOut,
          title: '缩小',
        },
        {
          id: 'zoom-text',
          type: 'custom',
          content: (
            <span className="text-sm text-gray-500 font-medium px-2">
              {state.zoom}%
            </span>
          ),
        },
        {
          id: 'zoom-in',
          action: 'zoom-in',
          icon: ZoomIn,
          title: '放大',
        },
      ],
    },
    {
      id: 'tools',
      items: [
        {
          id: 'reset',
          action: 'reset',
          icon: RotateCcw,
          title: '恢复默认布局',
          onClick: () => console.log('reset log from toolbar config'),
        },
      ],
    },
    {
      id: 'preview',
      items: [
        {
          id: 'preview-btn',
          icon: Printer,
          title: '打印预览',
          onClick: handlePreview,
        },
      ],
    },
  ]

  return (
    <TemplateEditor
      initialState={getMockEditorState()}
      previewData={MOCK_REAL_DATA}
      toolbar={{ groups: customToolbar }}
      renderLeftPanel={(props) => <EditorLeftSidebar {...props} />}
      renderRightPanel={(props) => <EditorRightSidebar {...props} />}
    />
  )
}

export default App
