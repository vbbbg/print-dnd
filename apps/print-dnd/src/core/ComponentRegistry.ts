import React from 'react'
import { EditorItem } from '../types/editor'

export interface ComponentRenderProps {
  item: EditorItem
  data?: any
  isSelected?: boolean
}

export interface SettingsPanelProps {
  item: EditorItem
  onChange: (updates: Partial<EditorItem>) => void
}

export interface ComponentPlugin<T = any> {
  type: string
  name: string
  defaultWidth: number
  defaultHeight: number
  render: React.FC<ComponentRenderProps>
  settingsPanel?: React.FC<SettingsPanelProps>
  defaultData?: T
}

class Registry {
  private plugins = new Map<string, ComponentPlugin>()

  register(plugin: ComponentPlugin) {
    this.plugins.set(plugin.type, plugin)
  }

  get(type: string): ComponentPlugin | undefined {
    return this.plugins.get(type)
  }

  getAll() {
    return Array.from(this.plugins.values())
  }
}

export const componentRegistry = new Registry()
