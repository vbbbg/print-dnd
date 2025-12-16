import React from 'react'

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
    <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-white shadow-lg rounded-lg px-6 py-3 flex items-center gap-4 z-50 border border-gray-200">
      {/* Undo/Redo */}
      <div className="flex items-center gap-2 border-r border-gray-300 pr-4">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="px-3 py-1.5 rounded bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          title="撤回"
        >
          ↶ 撤回
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className="px-3 py-1.5 rounded bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          title="重做"
        >
          ↷ 重做
        </button>
      </div>

      {/* Zoom Controls */}
      <div className="flex items-center gap-2 border-r border-gray-300 pr-4">
        <span className="text-sm text-gray-600 font-medium">视图比例:</span>
        <button
          onClick={onZoomOut}
          className="w-8 h-8 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold transition-colors"
          title="缩小"
        >
          -
        </button>
        <input
          type="text"
          value={`${zoom}%`}
          readOnly
          className="w-16 text-center border border-gray-300 rounded px-2 py-1 text-sm bg-gray-50 cursor-default"
        />
        <button
          onClick={onZoomIn}
          className="w-8 h-8 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold transition-colors"
          title="放大"
        >
          +
        </button>
      </div>

      {/* Reset Layout */}
      <div className="border-r border-gray-300 pr-4">
        <button
          onClick={onResetLayout}
          className="px-3 py-1.5 rounded bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 transition-colors"
          title="恢复默认布局"
        >
          恢复默认
        </button>
      </div>

      {/* Print Preview */}
      <div className="border-r border-gray-300 pr-4">
        <button
          onClick={onPrintPreview}
          className="px-3 py-1.5 rounded bg-green-500 text-white text-sm font-medium hover:bg-green-600 transition-colors"
          title="打印预览"
        >
          打印预览
        </button>
      </div>

      {/* Save as Template */}
      <div>
        <button
          onClick={onSaveAsTemplate}
          className="px-3 py-1.5 rounded bg-purple-500 text-white text-sm font-medium hover:bg-purple-600 transition-colors"
          title="另存为新模板"
        >
          另存为新模板
        </button>
      </div>
    </div>
  )
}
