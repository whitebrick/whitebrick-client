import React, { useState } from 'react';
import { Badge, Tooltip } from 'evergreen-ui';
import { ColDef } from 'ag-grid-community';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import ViewForeignKeyData from '../../common/viewForeignKeyData';
import { checkPermission } from '../../../utils/checkPermission';
import { actions } from '../../../state/actions';
import { TableItemType } from '../../../types';
import { isObjectEmpty } from '../../../utils/objectEmpty';

type ForeignKeyCellRendererPropsType = {
  value: string;
  column: any;
  table: TableItemType;
};

const ForeignKeyCellRenderer = ({
  value,
  column,
  table,
}: ForeignKeyCellRendererPropsType) => {
  const NOT_A_NUMBER = 'Nan';
  const cellValue = value || NOT_A_NUMBER;

  const [show, setShow] = useState(false);

  const hasPermission = checkPermission(
    'alter_table',
    !isObjectEmpty(table) && table?.role?.name,
  );

  const Cell = () => {
    return (
      <Badge
        aria-hidden
        color={cellValue === NOT_A_NUMBER ? 'neutral' : 'blue'}
        style={{ cursor: 'pointer' }}
        onClick={() => cellValue !== NOT_A_NUMBER && setShow(true)}>
        {cellValue}
      </Badge>
    );
  };

  const renderCellValue = () => {
    return (
      <div>
        {cellValue === NOT_A_NUMBER ? (
          <Tooltip content="Double click to add foreign key">{Cell()}</Tooltip>
        ) : (
          Cell()
        )}
      </div>
    );
  };

  return (
    <>
      <span>{renderCellValue()}</span>
      {show && (
        <ViewForeignKeyData
          canEdit={hasPermission}
          show={show}
          setShow={setShow}
          column={column}
          cellValue={cellValue}
        />
      )}
    </>
  );
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
)(ForeignKeyCellRenderer);
