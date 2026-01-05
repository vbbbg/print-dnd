import React from 'react'
import { mmToPx } from '../constants/units'

interface RegionGuideProps {
  regions: any[]
}

export const RegionGuide: React.FC<RegionGuideProps> = ({ regions }) => {
  return (
    <>
      {regions.map((region) => (
        <div
          key={`guide-${region.id}`}
          className={`absolute w-full box-border pointer-events-none ${
            region.type === 'table'
              ? 'border-b border-dashed border-gray-300'
              : region.id !== regions[regions.length - 1].id
                ? 'border-b border-dashed border-gray-300'
                : ''
          }`}
          style={{
            top: mmToPx(region.top),
            height: mmToPx(region.height),
          }}
        />
      ))}
    </>
  )
}
