import React from 'react'
import {
  ComponentPlugin,
  ComponentRenderProps,
  SettingsPanelProps,
} from '../core/ComponentRegistry'
import { resolveItemText } from '../utils/itemUtils'
import { ItemSettingsPanel } from '../components/ItemSettingsPanel'

const TextRender: React.FC<ComponentRenderProps> = ({ item, data }) => {
  return <>{resolveItemText(item, data)}</>
}

// We reuse the existing ItemSettingsPanel for text items for now
const TextSettingsPanel: React.FC<SettingsPanelProps> = (props) => {
  return <ItemSettingsPanel {...props} />
}

export const TextPlugin: ComponentPlugin = {
  type: 'text',
  name: '文本',
  defaultWidth: 100,
  defaultHeight: 10,
  render: TextRender,
  settingsPanel: TextSettingsPanel,
  defaultData: {
    type: 'text',
    value: 'New Text',
    fontSize: 12,
    fontFamily: 'SimHei',
  },
}
