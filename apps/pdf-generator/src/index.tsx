import { pdf } from '@react-pdf/renderer'

import { PdfDocument } from './components/PdfDocument'
import { registerFonts } from './utils/font'
import type { EditorState } from './types'

// Register fonts globally for the library
registerFonts()

export { PdfDocument }

export const generatePdf = async (
  template: EditorState,
  data: any[]
): Promise<Blob> => {
  return await pdf(<PdfDocument template={template} data={data} />).toBlob()
}
