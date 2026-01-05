import { Font } from '@react-pdf/renderer'

export const registerFonts = () => {
  Font.register({
    family: 'Noto Sans SC',
    fonts: [
      {
        src: 'https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-sc@4.5.12/files/noto-sans-sc-chinese-simplified-400-normal.woff',
        fontWeight: 'normal',
      },
      {
        src: 'https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-sc@4.5.12/files/noto-sans-sc-chinese-simplified-700-normal.woff',
        fontWeight: 'bold',
      },
    ],
  })

  // Register SimHei as an alias to Noto Sans SC (common fallback)
  Font.register({
    family: 'SimHei',
    fonts: [
      {
        src: 'https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-sc@4.5.12/files/noto-sans-sc-chinese-simplified-400-normal.woff',
        fontWeight: 'normal',
      },
      {
        src: 'https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-sc@4.5.12/files/noto-sans-sc-chinese-simplified-700-normal.woff',
        fontWeight: 'bold',
      },
    ],
  })
}
