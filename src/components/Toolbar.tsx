import React from 'react'
import { Button } from '@/components/ui/button'
import {
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Printer,
  Save,
} from 'lucide-react'

interface ToolbarProps {
  zoom: number
  onZoomIn: () => void
  onZoomOut: () => void
  canUndo: boolean
  canRedo: boolean
  onUndo: () => void
  onRedo: () => void
  onResetLayout: () => void
  onPrintPreview: () => void
  onSaveAsTemplate: () => void
}

export const Toolbar: React.FC<ToolbarProps> = ({
  zoom,
  onZoomIn,
  onZoomOut,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onResetLayout,
  onPrintPreview,
  onSaveAsTemplate,
}) => {
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-white shadow-lg rounded-lg px-2 py-2 flex items-center gap-2 z-50 border border-gray-200">
      {/* Undo/Redo */}
      <div className="flex items-center gap-1 border-r border-gray-200 pr-2 mr-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onUndo}
          disabled={!canUndo}
          title="撤回"
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onRedo}
          disabled={!canRedo}
          title="重做"
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>

      {/* Zoom Controls */}
      <div className="flex items-center gap-1 border-r border-gray-200 pr-2 mr-2">
        <span className="text-sm text-gray-500 font-medium px-2">{zoom}%</span>
        <Button variant="ghost" size="icon" onClick={onZoomOut} title="缩小">
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onZoomIn} title="放大">
          <ZoomIn className="h-4 w-4" />
        </Button>
      </div>

      {/* Reset Layout */}
      <div className="flex items-center gap-1 border-r border-gray-200 pr-2 mr-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onResetLayout}
          title="恢复默认布局"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={onPrintPreview} className="gap-2">
          <Printer className="h-4 w-4" />
          打印预览
        </Button>
        <Button onClick={onSaveAsTemplate} className="gap-2">
          <Save className="h-4 w-4" />
          另存为模板
        </Button>
      </div>
    </div>
  )
}
