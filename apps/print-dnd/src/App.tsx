import { TemplateEditor } from './components/TemplateEditor'
import { ToolbarState, ToolbarGroup } from './components/Toolbar'
import { Undo, Redo, ZoomIn, ZoomOut, RotateCcw, Printer } from 'lucide-react'

function App() {
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
          onClick: () => console.log('preview'),
        },
      ],
    },
  ]

  return <TemplateEditor toolbar={{ groups: customToolbar }} />
}

export default App
