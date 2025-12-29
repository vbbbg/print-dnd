# Plugin Development Guide (RFC)

> **Status**: Proposal / RFC
> **Target Architecture**: Component Registry System (See Architecture Analysis Report)

## 1. Introduction

This guide outlines the proposed architecture for extending the `print-dnd` editor with new component types (e.g., Barcode, QRCode, Shapes) without modifying the core codebase.

The system relies on a **Component Registry** pattern where plugins are registered at application startup.

## 2. Component Plugin Interface

To create a new component, you will implement the `ComponentPlugin` interface:

```typescript
import React from 'react'
import { EditorItem } from '../types/editor'

export interface ComponentPlugin<Data = any> {
  // Unique identifier for the component type (e.g., 'text', 'barcode')
  type: string

  // Display name in the Toolbar/UI
  name: string

  // Icon to display in the Toolbar
  icon?: React.ReactNode

  // Default dimensions when dropped onto the canvas
  defaultWidth: number
  defaultHeight: number

  // Initial data structure
  defaultData: Data

  // The component that renders the item on the canvas
  render: React.FC<{
    item: EditorItem
    data: Data
    isSelected: boolean
    isDragging: boolean
  }>

  // The component that renders the settings panel when selected
  settingsPanel?: React.FC<{
    item: EditorItem
    onChange: (updates: Partial<EditorItem>) => void
  }>
}
```

## 3. Creating a Plugin (Example: Barcode)

```typescript
// src/plugins/BarcodePlugin.tsx
import { ComponentPlugin } from '../core/ComponentRegistry'

export const BarcodePlugin: ComponentPlugin = {
  type: 'barcode',
  name: 'Barcode',
  defaultWidth: 100,
  defaultHeight: 50,
  defaultData: { value: '123456789', format: 'CODE128' },

  render: ({ item, data }) => (
    <div style={{ width: '100%', height: '100%', background: '#eee' }}>
       {/* Mock Barcode Rendering */}
       BARCODE: {data.value}
    </div>
  ),

  settingsPanel: ({ item, onChange }) => (
    <div>
      <label>Value</label>
      <input
        value={item.data.value}
        onChange={e => onChange({ data: { ...item.data, value: e.target.value } })}
      />
    </div>
  )
}
```

## 4. Registration

In your application entry point (e.g., `App.tsx` or `index.ts`), register the plugins:

```typescript
import { componentRegistry } from '../core/ComponentRegistry'
import { BarcodePlugin } from './plugins/BarcodePlugin'

// Register plugins
componentRegistry.register(BarcodePlugin)
```

## 5. Core Integration (Planned)

The `Paper.tsx` component will be refactored to look up renderers dynamically:

```typescript
// Inside Paper.tsx
const plugin = componentRegistry.get(item.type)

if (plugin) {
  return <plugin.render item={item} ... />
}
```
