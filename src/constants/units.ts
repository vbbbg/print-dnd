export const SCALE = 3.78 // 1mm ~= 3.78px at 96 DPI

export const mmToPx = (mm: number): number => {
  return mm * SCALE
}

export const pxToMm = (px: number): number => {
  return px / SCALE
}
