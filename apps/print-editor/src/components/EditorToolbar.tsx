import React from 'react'
import { Toolbar, ToolbarProps, ToolbarGroup, ToolbarState } from './Toolbar'

export interface EditorToolbarConfig {
  render?: (props: ToolbarProps) => React.ReactNode
  groups?: ToolbarGroup[] | ((state: ToolbarState) => ToolbarGroup[])
  className?: string
  style?: React.CSSProperties
  wrapperClassName?: string
  wrapperStyle?: React.CSSProperties
}

interface EditorToolbarProps {
  config?: EditorToolbarConfig
  state: ToolbarState
  handlers: Record<string, () => void>
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  config,
  state,
  handlers,
}) => {
  // Group Construction
  let baseGroups: ToolbarGroup[] = []

  if (config?.groups) {
    if (typeof config.groups === 'function') {
      baseGroups = config.groups(state)
    } else {
      baseGroups = config.groups
    }
  }

  // Bind actions to handlers
  const groups = baseGroups.map((group) => ({
    ...group,
    items: group.items.map((item) => {
      const newItem = { ...item }
      const internalHandler = item.action ? handlers[item.action] : undefined
      const userHandler = item.onClick

      if (internalHandler || userHandler) {
        newItem.onClick = () => {
          if (internalHandler) internalHandler()
          if (userHandler) userHandler(state.editorState)
        }
      }
      return newItem
    }),
  }))

  if (groups.length === 0 && !config?.render) {
    return null
  }

  const toolbarProps: ToolbarProps = {
    groups,
    className: config?.className,
    style: config?.style,
  }

  return (
    <div
      className={`h-14 border-b bg-white flex items-center justify-center relative z-50 shadow-sm ${config?.wrapperClassName || ''}`}
      style={config?.wrapperStyle}
    >
      {config?.render ? (
        config.render(toolbarProps)
      ) : (
        <Toolbar {...toolbarProps} />
      )}
    </div>
  )
}
