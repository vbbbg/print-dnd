import React from 'react'
import {
  ComponentPlugin,
  ComponentRenderProps,
  SettingsPanelProps,
} from '../core/ComponentRegistry'
import { RegionTable } from '../components/RegionTable'
import { TableSettingsPanel } from '../components/TableSettingsPanel'

const TableRender: React.FC<ComponentRenderProps> = ({ item, isSelected }) => {
  // We assume item (EditorItem) has been augmented or we cast it to what RegionTable expects
  // For now, the "value" or specific table props might need to be stored in "item" or "data"
  // Since TableData was separate in EditorState, we need to bridge this.
  // For this refactor, let's assume bodyItems (TableData) is passed as `item` or we use a specific property

  // TEMPORARY ADAPTER: The current architecture has bodyItems as a top-level object in EditorState,
  // not an item in an array. This is a disparity.
  // However, the goal is to make Table a plugin.
  // So the body region should ideally contain a "Table Item".

  // For now, we pass the *entire* item as the "data" prop to RegionTable if it matches TableData shape,
  // or we wrap it.

  const tableData = item as any // Bridge type

  return (
    <RegionTable
      data={tableData} // The item itself holds cols, showSubtotal etc.
      isSelected={isSelected}
      // We need to pass down rows data mock
      // In the real app, this comes from 'data' prop passed to Paper -> Content
      // RenderEngine passes { list: [...] }
      rows={(item as any).rows || []} // dynamic data rows usually come from external 'data'
    />
  )
}

const TableSettingsAdapter: React.FC<SettingsPanelProps> = ({
  item,
  onChange,
}) => {
  return <TableSettingsPanel data={item as any} onChange={onChange} />
}

export const TablePlugin: ComponentPlugin = {
  type: 'table',
  name: '表格区域',
  defaultWidth: 210, // A4 width usually, but dynamic
  defaultHeight: 100,
  render: TableRender,
  settingsPanel: TableSettingsAdapter,
  defaultData: {
    type: 'table',
    cols: [
      { title: '序号', colname: 'index', width: 50 },
      { title: '商品名称', colname: 'name', width: 150 },
      { title: '数量', colname: 'quantity', width: 50 },
      { title: '单价', colname: 'price', width: 50 },
      { title: '金额', colname: 'amount', width: 50 },
    ],
    showSubtotal: true,
    showTotal: true,
  },
}
