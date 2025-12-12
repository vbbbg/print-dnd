export type RegionType = 'title' | 'header' | 'body' | 'footer'

export interface EditorState {
  headerTop: number
  bodyTop: number
  footerTop: number
  paperHeight: number
  paperWidth: number
}
