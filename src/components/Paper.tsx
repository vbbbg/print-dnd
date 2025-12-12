import React from 'react'
import { EditorState } from '../types/editor'
import { ResizeHandle } from './ResizeHandle'

interface PaperProps {
  state: EditorState
  onResizeStart: (
    region: 'header' | 'body' | 'footer',
    e: React.MouseEvent
  ) => void
}

export const Paper: React.FC<PaperProps> = ({ state, onResizeStart }) => {
  const { headerTop, bodyTop, footerTop, paperHeight, paperWidth } = state

  return (
    <div
      data-paper-root="true"
      className="relative bg-white shadow-xl mx-auto overflow-hidden"
      style={{
        width: paperWidth,
        height: paperHeight,
      }}
    >
      {/* Title Region */}
      <div
        className="absolute w-full border-b border-dashed border-gray-300 p-1 box-border"
        style={{
          top: 0,
          height: headerTop,
        }}
      >
        <div className="text-gray-400 text-xs text-center uppercase tracking-wider">
          Title Region
        </div>
      </div>

      {/* Header Region */}
      <div
        className="absolute w-full border-b border-dashed border-gray-300 p-1 box-border"
        style={{
          top: headerTop,
          height: bodyTop - headerTop,
        }}
      >
        <div className="text-gray-400 text-xs text-center uppercase tracking-wider">
          Header Region
        </div>
      </div>

      {/* Body Region */}
      <div
        className="absolute w-full border-b border-dashed border-gray-300 p-1 box-border"
        style={{
          top: bodyTop,
          height: footerTop - bodyTop,
        }}
      >
        <div className="text-gray-400 text-xs text-center uppercase tracking-wider">
          Body Region
        </div>
      </div>

      {/* Footer Region */}
      <div
        className="absolute w-full p-1 box-border"
        style={{
          top: footerTop,
          height: paperHeight - footerTop,
        }}
      >
        <div className="text-gray-400 text-xs text-center uppercase tracking-wider">
          Footer Region
        </div>
      </div>

      {/* Resize Handles */}
      <ResizeHandle
        top={headerTop}
        onMouseDown={(e) => onResizeStart('header', e)}
        className="resize-handle-header group"
      />
      <ResizeHandle
        top={bodyTop}
        onMouseDown={(e) => onResizeStart('body', e)}
        className="resize-handle-body group"
      />
      <ResizeHandle
        top={footerTop}
        onMouseDown={(e) => onResizeStart('footer', e)}
        className="resize-handle-footer group"
      />
    </div>
  )
}
