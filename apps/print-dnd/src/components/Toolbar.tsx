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
  LucideIcon,
} from 'lucide-react'

export interface ToolbarItem {
  id: string
  type?: 'button' | 'custom'
  label?: React.ReactNode
  icon?: LucideIcon
  action?: string
  onClick?: () => void
  disabled?: boolean
  title?: string
  variant?:
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
  content?: React.ReactNode
  render?: (item: ToolbarItem) => React.ReactNode
}

export interface ToolbarGroup {
  id: string
  items: ToolbarItem[]
}

export interface ToolbarProps {
  groups: ToolbarGroup[]
  className?: string
  style?: React.CSSProperties
}

export const Toolbar: React.FC<ToolbarProps> = ({
  groups,
  className,
  style,
}) => {
  return (
    <div
      className={`h-full flex items-center gap-2 px-2 ${className || ''}`}
      style={style}
    >
      {groups.map((group, groupIndex) => (
        <React.Fragment key={group.id}>
          <div className="flex items-center gap-1">
            {group.items.map((item) => {
              if (item.type === 'custom') {
                return (
                  <React.Fragment key={item.id}>{item.content}</React.Fragment>
                )
              }

              if (item.render) {
                return (
                  <React.Fragment key={item.id}>
                    {item.render(item)}
                  </React.Fragment>
                )
              }

              const Icon = item.icon
              return (
                <Button
                  key={item.id}
                  variant={item.variant || 'ghost'}
                  size={item.size || 'icon'}
                  onClick={item.onClick}
                  disabled={item.disabled}
                  title={item.title}
                  className={item.className}
                >
                  {Icon && <Icon className="h-4 w-4 mr-1" />}
                  {item.label}
                </Button>
              )
            })}
          </div>
          {/* Add separator if not the last group */}
          {groupIndex < groups.length - 1 && (
            <div className="w-[1px] h-6 bg-gray-200 mx-1" />
          )}
        </React.Fragment>
      ))}
    </div>
  )
}

export interface ToolbarState {
  zoom: number
  canUndo: boolean
  canRedo: boolean
}

export const createDefaultToolbarGroups = ({
  zoom,
  canUndo,
  canRedo,
}: ToolbarState): ToolbarGroup[] => {
  return [
    // History
    {
      id: 'history',
      items: [
        {
          id: 'undo',
          action: 'undo',
          icon: Undo,
          disabled: !canUndo,
          title: '撤回',
        },
        {
          id: 'redo',
          action: 'redo',
          icon: Redo,
          disabled: !canRedo,
          title: '重做',
        },
      ],
    },
    // Insert
    {
      id: 'insert',
      items: [
        {
          id: 'add-text',
          action: 'add-text',
          label: '文本',
          title: '添加文本',
          size: 'sm',
          className: 'gap-1',
        },
        {
          id: 'add-image',
          action: 'add-image',
          label: '图片',
          title: '添加图片',
          size: 'sm',
          className: 'gap-1',
        },
        {
          id: 'add-qrcode',
          action: 'add-qrcode',
          label: 'QR',
          title: '添加二维码',
          size: 'sm',
          className: 'gap-1',
        },
        {
          id: 'add-line',
          action: 'add-line',
          label: '—',
          title: '添加直线',
          size: 'sm',
          className: 'gap-1',
        },
      ],
    },
    // Zoom
    {
      id: 'zoom',
      items: [
        {
          id: 'zoom-text',
          type: 'custom',
          content: (
            <span className="text-sm text-gray-500 font-medium px-2">
              {zoom}%
            </span>
          ),
        },
        {
          id: 'zoom-out',
          action: 'zoom-out',
          icon: ZoomOut,
          title: '缩小',
        },
        {
          id: 'zoom-in',
          action: 'zoom-in',
          icon: ZoomIn,
          title: '放大',
        },
      ],
    },
    // Tools
    {
      id: 'tools',
      items: [
        {
          id: 'reset',
          action: 'reset',
          icon: RotateCcw,
          title: '恢复默认布局',
        },
      ],
    },
    // Actions
    {
      id: 'actions',
      items: [
        {
          id: 'print',
          action: 'print',
          label: '打印预览',
          icon: Printer,
          variant: 'outline',
          className: 'gap-2',
          size: 'sm',
        },
        {
          id: 'save',
          action: 'save',
          label: '另存为模板',
          icon: Save,
          variant: 'default',
          className: 'gap-2',
          size: 'sm',
        },
        {
          id: 'export',
          action: 'export',
          label: '导出JSON',
          icon: FileJson,
          variant: 'outline',
          className: 'gap-2',
          size: 'sm',
        },
      ],
    },
  ]
}
