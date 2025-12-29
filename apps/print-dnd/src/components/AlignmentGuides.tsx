import React from 'react'
import { Guide } from '../types/editor'
import { mmToPx } from '../constants/units'

interface AlignmentGuidesProps {
  guides?: Guide[]
}

export const AlignmentGuides: React.FC<AlignmentGuidesProps> = ({ guides }) => {
  return (
    <>
      {guides?.map((guide, idx) => {
        const isV = guide.type === 'vertical'
        return (
          <div
            key={`guide-${idx}`}
            className={`absolute bg-blue-500 z-50 pointer-events-none ${
              isV ? 'w-px h-full' : 'h-px w-full'
            }`}
            style={{
              left: isV ? mmToPx(guide.pos) : 0,
              top: isV ? 0 : mmToPx(guide.pos),
            }}
          />
        )
      })}
    </>
  )
}
