import './index.css'
export {
  TemplateEditor,
  type TemplateEditorProps,
} from './components/TemplateEditor'
export { Paper } from './components/Paper'
export { EditorLeftSidebar } from './components/EditorLeftSidebar'
export { EditorRightSidebar } from './components/EditorRightSidebar'
export { getMockEditorState } from './utils/mockData'

export type {
  EditorState,
  EditorItem,
  TableColumn,
  PaperDefinition,
  Guide,
} from './types/editor'

export type { JsonField, ItemsJson } from './types/fields'

export { componentRegistry } from './core/ComponentRegistry'
export { TextPlugin } from './plugins/TextPlugin'
export { ImagePlugin } from './plugins/ImagePlugin'
export { TablePlugin } from './plugins/TablePlugin'
export { QRCodePlugin } from './plugins/QRCodePlugin'
export { LinePlugin } from './plugins/LinePlugin'

// Hooks
export { useToolbar } from './hooks/useToolbar'
export { useItemDrag } from './hooks/useItemDrag'
export { useItemResize } from './hooks/useItemResize'
export { useColumnResize } from './hooks/useColumnResize'
export { useFieldSettings } from './hooks/useFieldSettings'
export { useHistory } from './hooks/useHistory'
