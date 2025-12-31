import React from 'react'

export interface RegionRenderProps {
  region: any
  data: any // Global data
  margins: any
  isSelected: boolean
  onItemDragStart: any
  onItemDragEnd: any
  onItemResizeStart: any
  onColumnResizeStart?: any
  selectedItemIdx: any
}

export interface RegionPlugin {
  type: string
  render: React.FC<RegionRenderProps>
}

class Registry {
  private plugins = new Map<string, RegionPlugin>()

  register(plugin: RegionPlugin) {
    this.plugins.set(plugin.type, plugin)
  }

  get(type: string): RegionPlugin | undefined {
    return this.plugins.get(type)
  }

  getAll() {
    return Array.from(this.plugins.values())
  }
}

export const regionRegistry = new Registry()
