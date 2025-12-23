export interface JsonField {
  width: number
  key: string
  value: string
  customColFlg: boolean
  index: number
  child: any[]
}

export interface ItemsJson {
  header: JsonField[]
  body: JsonField[]
  footer: JsonField[]
}
