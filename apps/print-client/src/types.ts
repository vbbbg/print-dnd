export interface PaperDefinition {
  type: string
  name: string
  width?: number
  height?: number
}

export interface EditorItem {
  type: 'text' | 'image'
  x: number
  y: number
  width: number
  height: number
  value?: string
  name?: string
  field?: string
  alias?: string
  visible?: boolean
  fontSize?: number
  fontFamily?: string
  fontColor?: string
  bold?: boolean
  italic?: boolean
  underline?: boolean
  verticalAlignment?: 'top' | 'center' | 'bottom'
  horizontalAlignment?: 'left' | 'center' | 'right'
}

export interface TableColumn {
  title: string
  colname: string
  width: number
  visible?: boolean
  alias?: string
}

export interface TableData {
  cols: TableColumn[]
  showSubtotal?: boolean
  showTotal?: boolean
}

export interface EditorState {
  headerTop: number
  bodyTop: number
  footerTop: number
  paperHeight: number
  paperWidth: number
  paperType: 'A4' | 'A4_2' | 'A4_3' | 'custom'
  paperDefinitions: PaperDefinition[]
  name: string
  margins: {
    top: number
    bottom: number
    left: number
    right: number
  }
  titleItems: EditorItem[]
  headerItems: EditorItem[]
  bodyItems: TableData
  footerItems: EditorItem[]
}
