import React from 'react'
import { mmToPx } from '../constants/units'

interface MarginsGuideProps {
  margins?: {
    top: number
    bottom: number
    left: number
    right: number
  }
}

export const MarginsGuide: React.FC<MarginsGuideProps> = ({ margins }) => {
  if (!margins) return null

  return (
    <>
      {/* Top Margin */}
      <div
        className="absolute left-0 right-0 top-0 pointer-events-none z-40 bg-gray-200 opacity-30"
        style={{
          height: mmToPx(margins.top),
        }}
      />
      {/* Bottom Margin */}
      <div
        className="absolute left-0 right-0 bottom-0 pointer-events-none z-40 bg-gray-200 opacity-30"
        style={{
          height: mmToPx(margins.bottom),
        }}
      />
      {/* Left Margin */}
      <div
        className="absolute left-0 top-0 bottom-0 pointer-events-none z-40 bg-gray-200 opacity-30"
        style={{
          width: mmToPx(margins.left),
        }}
      />
      {/* Right Margin */}
      <div
        className="absolute right-0 top-0 bottom-0 pointer-events-none z-40 bg-gray-200 opacity-30"
        style={{
          width: mmToPx(margins.right),
        }}
      />
      {/* Dashed Border for Printable Area */}
      <div
        className="absolute pointer-events-none z-50 border-dashed border-gray-400 opacity-50"
        style={{
          top: mmToPx(margins.top),
          bottom: mmToPx(margins.bottom),
          left: mmToPx(margins.left),
          right: mmToPx(margins.right),
          borderWidth: '1px',
        }}
      />
    </>
  )
}
