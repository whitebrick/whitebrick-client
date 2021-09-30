import React from 'react';
import { Badge } from 'evergreen-ui';
import { RowNode } from 'ag-grid-community';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { actions } from '../../../state/actions';
import { checkPermission } from '../../../utils/checkPermission';
import { TableItemType } from '../../../types';

type PrimaryKeyCellRendererPropsType = {
  columnDefault: any;
  valueFormatted: string;
  value: string;
  node: RowNode;
  table: TableItemType;
  actions: any;
};

const PrimaryKeyCellRenderer = ({
  columnDefault,
  valueFormatted,
  value,
  node,
  table,
  actions,
}: PrimaryKeyCellRendererPropsType) => {
  const cellValue = valueFormatted || value;
  const hasPermission = checkPermission('alter_table', table?.role?.name);

  const handleClick = () => {
    actions.setType('editRow');
    actions.setParams(node.data);
    actions.setFormData(node.data);
    actions.setShow(true);
  };

  const renderCell = () => {
    if (hasPermission) {
      if (cellValue)
        return (
          <Badge
            aria-hidden
            color="blue"
            style={{ cursor: 'pointer' }}
            onClick={handleClick}>
            {cellValue}
          </Badge>
        );
      if (columnDefault?.startsWith('nextval'))
        return <Badge color="neutral">AUTO</Badge>;
    }
    return <div>{cellValue}</div>;
  };

  return renderCell();
};

const mapStateToProps = state => ({
  table: state.table,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(actions, dispatch),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(PrimaryKeyCellRenderer);
