import React from 'react';
import { SchemaItemType, TableItemType } from '../../../types';
import TableMenuItem from './tableMenuItem';
import SchemaMenuItem from './schemaMenuItem';
import 'react-contexify/dist/ReactContexify.css';

type ContextMenuProps = {
  type: 'table' | 'schema';
  item: TableItemType | SchemaItemType;
};

const ContextMenu = ({ type, item }: ContextMenuProps) => {
  const renderItem = () => {
    if (type === 'table')
      return <TableMenuItem tableItem={item as TableItemType} />;
    return <SchemaMenuItem schemaItem={item as SchemaItemType} />;
  };
  return renderItem();
};

export default ContextMenu;
