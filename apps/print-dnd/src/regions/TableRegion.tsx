import React from 'react'
import { RegionRenderProps, regionRegistry } from '../core/RegionRegistry'
import { useEditorContext } from '../contexts/EditorContext'
import { useEditorStore } from '../store/editorStore'
import { componentRegistry } from '../core/ComponentRegistry'
import { mmToPx } from '../constants/units'

export const TableRegion: React.FC<RegionRenderProps> = ({
  region,
  isSelected,
}) => {
  const { handlers, data } = useEditorContext()
  const { onColumnResizeStart, onItemDragStart } = handlers
  const margins = useEditorStore((state) => state.margins)

  if (region.type !== 'table') return null
  if (!region.data || region.data.length === 0) return null

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
        height: mmToPx(region.data[0].height),
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
          const tableItem = region.data[0]
          const tableItemAdapter = {
            ...tableItem,
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
