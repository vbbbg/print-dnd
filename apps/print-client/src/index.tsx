import { pdf } from '@react-pdf/renderer'

import { PdfDocument } from './components/PdfDocument'
import type { EditorState } from './types'

export { PdfDocument }

export const generatePdf = async (
  template: EditorState,
  data: any[]
): Promise<Blob> => {
  return await pdf(<PdfDocument template={template} data={data} />).toBlob()
}
