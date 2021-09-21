import React from 'react';
import { OrganizationItemType, SchemaItemType } from '../../../types';
import NoItem from './noItem';

type EmptyModalProps = {
  type: 'schema' | 'table';
  item: OrganizationItemType | SchemaItemType;
};

const EmptyModal = ({ type, item }: EmptyModalProps) => {
  const data =
    type === 'schema'
      ? (item as OrganizationItemType)
      : (item as SchemaItemType);

  return (
    <div className="col-md-6 offset-md-4">
      <div
        className="text-center rounded p-3"
        style={{ backgroundColor: 'transparent', width: '60%' }}>
        <NoItem type={type} data={data} />
      </div>
    </div>
  );
};

export default EmptyModal;
