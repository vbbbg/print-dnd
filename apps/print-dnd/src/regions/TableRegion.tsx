import React from 'react'
import { RegionRenderProps, regionRegistry } from '../core/RegionRegistry'
import { componentRegistry } from '../core/ComponentRegistry'
import { mmToPx } from '../constants/units'

export const TableRegion: React.FC<RegionRenderProps> = ({
  region,
  data,
  margins,
  isSelected,
}) => {
  return (
    <div
      className="absolute z-0"
      style={{
        top: mmToPx(region.top),
        height: mmToPx(region.height),
        left: mmToPx(margins?.left || 0),
        right: mmToPx(margins?.right || 0),
      }}
    >
      {region.data &&
        (() => {
          const plugin = componentRegistry.get('table')
          const Content =
            plugin?.render || (() => <div>Table Plugin Not Found</div>)
          // Adapter: table data casting
          const tableItemAdapter = {
            ...region.data,
            type: 'table',
            rows: data.list,
          } as any

          return (
            <Content
              item={tableItemAdapter}
              data={data}
              isSelected={isSelected}
            />
          )
        })()}
    </div>
  )
}

regionRegistry.register({
  type: 'table',
  render: TableRegion,
})
