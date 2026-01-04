import React from 'react'
import { RegionRenderProps, regionRegistry } from '../core/RegionRegistry'
import { useEditorContext } from '../contexts/EditorContext'
import { useEditorStore } from '../store/editorStore'
import { componentRegistry } from '../core/ComponentRegistry'
import { DraggableItem } from '../components/DraggableItem'

export const FreeLayoutRegion: React.FC<RegionRenderProps> = ({ region }) => {
  const { handlers, data } = useEditorContext()
  const { onItemDragStart, onItemDragEnd } = handlers
  const selectedItemIdx = useEditorStore((state) => state.selectedItemIdx)

  return (
    <>
      {region.data?.map((item: any, index: number) => {
        const plugin = componentRegistry.get(item.type)
        const Content = plugin?.render || (() => <div>Unknown</div>)
        return (
          <DraggableItem
            key={`${region.id}-${index}`}
            item={item}
            index={index}
            region={region.id}
            isSelected={
              selectedItemIdx?.region === region.id &&
              selectedItemIdx?.index === index
            }
            onDragStart={onItemDragStart}
            onDragEnd={onItemDragEnd}
            onClick={() => onItemDragStart(index, region.id, item.x, item.y)}
          >
            <Content
              item={item}
              data={data}
              isSelected={
                selectedItemIdx?.region === region.id &&
                selectedItemIdx?.index === index
              }
            />
          </DraggableItem>
        )
      })}
    </>
  )
}

regionRegistry.register({
  type: 'free-layout',
  render: FreeLayoutRegion,
})
