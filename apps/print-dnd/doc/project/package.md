# print-dnd 1.0

`print-dnd` is a React library for designing and editing print templates with drag-and-drop capabilities.

## Installation

```bash
pnpm install print-dnd
```

## Usage

### TemplateEditor

The main component for editing templates.

```tsx
import { TemplateEditor, EditorState } from 'print-dnd'
import 'print-dnd/style.css' // Import styles

function App() {
  const handleSave = (state: EditorState) => {
    console.log('Saved state:', state)
    // Save to backend...
  }

  return (
    <div style={{ height: '100vh' }}>
      <TemplateEditor
        onSave={handleSave}
        // initialState={...} // Optional: Load existing state
      />
    </div>
  )
}
```

#### Props

| Prop | Type | Description |
|Str |Str |Str |
| `initialState` | `EditorState` | Optional. Initial state of the editor. Defaults to a mock state if not provided. |
| `onSave` | `(state: EditorState) => void` | Optional. Callback triggered when the "Save as Template" button is clicked. |

### Paper

A component to render the print template (useful for preview or readonly mode).

```tsx
import { Paper } from 'print-dnd'

// ...
;<Paper
  state={editorState}
  data={realData}
  // ... other props
/>
```

## Exports

### Components

- `TemplateEditor`: The full editor interface.
- `Paper`: The rendering component for the paper/template.

### Utils

- `getMockEditorState`: Returns a mock initial state.

### Types

- `EditorState`
- `EditorItem`
- `TableData`
- `TableColumn`
- `PaperDefinition`
- `Guide`
- `JsonField`
- `ItemsJson`
