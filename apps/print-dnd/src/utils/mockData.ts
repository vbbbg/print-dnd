import { EditorState, EditorItem, TableData } from '../types/editor'
import { PAPER_DEFINITIONS } from '../constants/paper'

export const getMockEditorState = (): EditorState => {
  // Title Item
  const titleItems: EditorItem[] = [
    {
      value: '销售单',
      x: 0,
      y: 5,
      width: 210,
      height: 10,
      fontSize: 16,
      bold: true,
      fontFamily: 'SimHei',
      fontColor: '#000000',
      verticalAlignment: 'center',
      horizontalAlignment: 'center',
      visible: true,
      type: 'text',
      name: 'Title',
      alias: '标题',
      field: 'title',
    },
  ]

  // Header Items - Reasonable layout for A4_2 (High density)
  const headerItems: EditorItem[] = [
    {
      alias: '单号',
      field: 'billNo',
      name: '单号',
      type: 'text',
      x: 140, // Top Right
      y: 5,
      width: 60,
      height: 7,
      value: '单号: {billNo}',
      visible: true,
      fontSize: 10,
      fontFamily: 'SimHei',
      fontColor: '#000000',
      horizontalAlignment: 'right',
    },
    {
      alias: '客户名称',
      field: 'customerName',
      name: '客户名称',
      type: 'text',
      x: 10,
      y: 20,
      width: 90,
      height: 7,
      value: '客户: {customerName}',
      visible: true,
      fontSize: 11,
      fontFamily: 'SimHei',
      fontColor: '#000000',
    },
    {
      alias: '录单时间',
      field: 'makeTimeDate',
      name: '录单时间',
      type: 'text',
      x: 110,
      y: 20,
      width: 90,
      height: 7,
      value: '日期: {makeTimeDate}',
      visible: true,
      fontSize: 11,
      fontFamily: 'SimHei',
      fontColor: '#000000',
    },
    {
      alias: '收货地址',
      field: 'fullAddress',
      name: '收货地址',
      type: 'text',
      x: 10,
      y: 28,
      width: 190,
      height: 7,
      value: '地址: {fullAddress}',
      visible: true,
      fontSize: 11,
      fontFamily: 'SimHei',
      fontColor: '#000000',
    },
    {
      alias: '联系人',
      field: 'contactName',
      name: '联系人',
      type: 'text',
      x: 10,
      y: 36,
      width: 60,
      height: 7,
      value: '联系人: {contactName}',
      visible: true,
      fontSize: 11,
      fontFamily: 'SimHei',
      fontColor: '#000000',
    },
    {
      alias: '联系电话',
      field: 'contactPhone',
      name: '联系电话',
      type: 'text',
      x: 75,
      y: 36,
      width: 60,
      height: 7,
      value: '电话: {contactPhone}',
      visible: true,
      fontSize: 11,
      fontFamily: 'SimHei',
      fontColor: '#000000',
    },
    {
      alias: '单据备注',
      field: 'remark',
      name: '单据备注',
      type: 'text',
      x: 10,
      y: 44,
      width: 190,
      height: 7,
      value: '备注: {remark}',
      visible: true,
      fontSize: 11,
      fontFamily: 'SimHei',
      fontColor: '#000000',
    },
  ]

  // Footer Items - Compact for small paper
  const footerItems: EditorItem[] = [
    {
      alias: '制单人',
      field: 'handlerName',
      name: '制单人',
      type: 'text',
      x: 10,
      y: 135,
      width: 60,
      height: 7,
      value: '制单: {handlerName}',
      visible: true,
      fontSize: 11,
      fontFamily: 'SimHei',
      fontColor: '#000000',
    },
    {
      alias: '审核人',
      field: 'examineUserName',
      name: '审核人',
      type: 'text',
      x: 80,
      y: 135,
      width: 60,
      height: 7,
      value: '审核: {examineUserName}',
      visible: true,
      fontSize: 11,
      fontFamily: 'SimHei',
      fontColor: '#000000',
    },
    {
      alias: '本单应收',
      field: 'currentDue',
      name: '本单应收',
      type: 'text',
      x: 150,
      y: 135,
      width: 50,
      height: 7,
      value: '应收: {currentDue}',
      visible: true,
      fontSize: 11,
      fontFamily: 'SimHei',
      fontColor: '#000000',
      bold: true,
    },
  ]

  // Body Columns - Standard sales columns
  const bodyItems: TableData = {
    cols: [
      {
        alias: '行号',
        colname: 'serialNumber',
        title: '序号',
        visible: true,
        width: 10,
      },
      {
        alias: '商品名称',
        colname: 'spuName',
        title: '商品名称',
        visible: true,
        width: 60,
      },
      {
        alias: '规格',
        colname: 'skuName',
        title: '规格',
        visible: true,
        width: 30,
      },
      {
        alias: '单位',
        colname: 'unitName',
        title: '单位',
        visible: true,
        width: 15,
      },
      {
        alias: '数量',
        colname: 'qty',
        title: '数量',
        visible: true,
        width: 20,
      },
      {
        alias: '单价',
        colname: 'price',
        title: '单价',
        visible: true,
        width: 25,
      },
      {
        alias: '金额',
        colname: 'amount',
        title: '金额',
        visible: true,
        width: 30,
      },
    ],
  }

  // Combine all "free layout" items
  const allItems = [...titleItems, ...headerItems, ...footerItems]

  // Define boundaries
  const headerTop = 15
  const bodyTop = 55
  const footerTop = 130
  const paperHeight = 148.5

  // Distribute items into regions based on Y position (using absolute coordinates)
  const newTitleItems = allItems.filter((item) => item.y < headerTop)

  const newHeaderItems = allItems.filter(
    (item) => item.y >= headerTop && item.y < bodyTop
  )

  const newFooterItems = allItems.filter((item) => item.y >= footerTop)

  return {
    // 210mm x 148.5mm (A4_2)
    paperType: 'A4_2',
    paperWidth: 210,
    paperHeight: paperHeight,
    paperDefinitions: PAPER_DEFINITIONS,
    name: '标准销售单 (二等分)',

    margins: {
      top: 5,
      bottom: 5,
      left: 10,
      right: 10,
    },

    regions: [
      {
        id: 'title',
        type: 'free-layout',
        top: 0,
        items: newTitleItems,
      },
      {
        id: 'header',
        type: 'free-layout',
        top: headerTop,
        items: newHeaderItems,
      },
      {
        id: 'body',
        type: 'table',
        top: bodyTop,
        data: bodyItems,
      },
      {
        id: 'footer',
        type: 'free-layout',
        top: footerTop,
        items: newFooterItems,
      },
    ],
  }
}
