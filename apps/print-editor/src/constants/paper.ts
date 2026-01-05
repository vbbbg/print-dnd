import { PaperDefinition } from '../types/editor'

export const PAPER_DEFINITIONS: PaperDefinition[] = [
  {
    type: 'A4',
    name: 'A4 (210mm x 297mm)',
    width: 210,
    height: 297,
  },
  {
    type: 'A4_2',
    name: '二等分 (210mm x 148.5mm)',
    width: 210,
    height: 148.5,
  },
  {
    type: 'A4_3',
    name: '三等分 (210mm x 99mm)',
    width: 210,
    height: 99,
  },
  {
    type: 'custom',
    name: '自定义',
  },
]
