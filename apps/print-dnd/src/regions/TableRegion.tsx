import React from 'react'
import { RegionRenderProps, regionRegistry } from '../core/RegionRegistry'
import { componentRegistry } from '../core/ComponentRegistry'
import { mmToPx } from '../constants/units'

export const TableRegion: React.FC<RegionRenderProps> = ({
  region,
  data,
  margins,
  isSelected,
  onColumnResizeStart,
  onItemDragStart,
}) => {
  const handleTableClick = React.useCallback(() => {
    // Select the table region (index 0 is dummy but unused for table region)
    if (onItemDragStart) {
      onItemDragStart(0, region.id, 0, 0)
    }
  }, [onItemDragStart, region.id])

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
              onColumnResizeStart={onColumnResizeStart}
              onClick={handleTableClick}
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
