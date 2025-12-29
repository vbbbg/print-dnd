export interface PaperDefinition {
  type: string
  name: string
  width?: number
  height?: number
}

export interface EditorItem {
  type: 'text' | 'image' | 'table' | 'qrcode' | 'line' // simplified for now
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

export type RegionType = 'free-layout' | 'table' | 'custom'

export interface Region {
  id: string
  type: RegionType
  top: number
  items?: EditorItem[] // For free-layout
  data?: TableData // For table (renamed from bodyItems type)
  isActive?: boolean // For selection/interactions but typically derived
}

export interface EditorState {
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
  regions: Region[]
}

export interface Guide {
  type: 'horizontal' | 'vertical'
  pos: number // mm
}
