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
  FileJson,
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
  onExportJson: () => void
  onAddItem: (type: 'text' | 'image' | 'qrcode' | 'line') => void
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
  onExportJson,
  onAddItem,
}) => {
  return (
    <div className="h-full flex items-center gap-2 px-2">
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

      {/* Insert Items */}
      <div className="flex items-center gap-1 border-r border-gray-200 pr-2 mr-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAddItem('text')}
          title="添加文本"
        >
          T 文本
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAddItem('image')}
          title="添加图片"
        >
          🖼️ 图片
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAddItem('qrcode')}
          title="添加二维码"
        >
          QR
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAddItem('line')}
          title="添加直线"
        >
          —
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
        <Button onClick={onExportJson} className="gap-2" variant="outline">
          <FileJson className="h-4 w-4" />
          导出JSON
        </Button>
      </div>
    </div>
  )
}
