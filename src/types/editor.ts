export type RegionType = 'title' | 'header' | 'body' | 'footer'

export interface EditorItem {
  type: 'text' | 'image' // simplified for now
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
}

export interface EditorState {
  headerTop: number
  bodyTop: number
  footerTop: number
  paperHeight: number
  paperWidth: number
  titleItems: EditorItem[]
  headerItems: EditorItem[]
  bodyItems: TableData
  footerItems: EditorItem[]
}

export interface Guide {
  type: 'horizontal' | 'vertical'
  pos: number // mm
}
