import React from 'react';
import { Badge } from 'evergreen-ui';
import { RowNode } from 'ag-grid-community';
import { useDispatch } from 'react-redux';
import { actions } from '../../../state/actions';
import store from '../../../state/store';
import {
  checkPermission,
  checPermission,
} from '../../../utils/checkPermission';

type PrimaryKeyCellRendererPropsType = {
  valueFormatted: string;
  value: string;
  node: RowNode;
};

const PrimaryKeyCellRenderer = ({
  valueFormatted,
  value,
  node,
}: PrimaryKeyCellRendererPropsType) => {
  const dispatch = useDispatch();
  const cellValue = valueFormatted || value;
  const state = store.getState();

  const handleClick = () => {
    if (checkPermission('alter_table', state?.table?.role?.name)) {
      dispatch(actions.setType('editRow'));
      dispatch(actions.setParams(node.data));
      dispatch(actions.setFormData(node.data));
      dispatch(actions.setShow(true));
    }
  };

  return (
    <>
      {cellValue && (
        <Badge
          aria-hidden
          color="blue"
          style={{ cursor: 'pointer' }}
          onClick={handleClick}>
          {cellValue}
        </Badge>
      )}
    </>
  );
};

export default PrimaryKeyCellRenderer;
