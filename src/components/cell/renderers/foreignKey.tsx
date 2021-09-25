import React, { useContext, useState } from 'react';
import { SmallPlusIcon, Badge, IconButton } from 'evergreen-ui';
import { ColDef } from 'ag-grid-community';
import { ClientContext } from 'graphql-hooks';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import ViewForeignKeyData from '../../common/viewForeignKeyData';
import LinkForeignKey from '../../common/linkForeignKey';
import { updateTableData } from '../../../utils/updateTableData';
import { checkPermission } from '../../../utils/checkPermission';
import { actions } from '../../../state/actions';
import { TableItemType } from '../../../types';
import { isObjectEmpty } from '../../../utils/objectEmpty';

type ForeignKeyCellRendererPropsType = {
  valueFormatted: string;
  value: string;
  column: any;
  data: any;
  colDef: ColDef;
  table: TableItemType;
  actions: any;
};

const ForeignKeyCellRenderer = ({
  valueFormatted,
  value,
  column,
  data,
  colDef,
  table,
  actions,
}: ForeignKeyCellRendererPropsType) => {
  const client = useContext(ClientContext);
  const cellValue = valueFormatted || value;

  const [show, setShow] = useState(false);
  const [link, setLink] = useState(false);

  const updateValue = async (row, relData, colDef, schemaName, tableName) => {
    const variables = { where: {}, _set: {} };
    Object.keys(row).forEach(key => {
      if (
        !key.startsWith(`obj_${tableName}`) &&
        !key.startsWith(`arr_${tableName}`) &&
        row[key]
      ) {
        variables.where[key] = {
          _eq: parseInt(row[key], 10) ? parseInt(row[key], 10) : row[key],
        };
      }
    });
    variables._set[colDef.field] =
      relData[colDef.field.split('_').reverse()[0]];
    updateTableData(schemaName, tableName, variables, client, actions);
  };

  const hasPermission = checkPermission(
    'alter_table',
    !isObjectEmpty(table) && table?.role?.name,
  );

  const renderCellValue = () => {
    if (!cellValue) {
      if (hasPermission)
        return (
          <IconButton
            icon={SmallPlusIcon}
            onClick={() => setLink(true)}
            appearance="minimal"
          />
        );
      return <div />;
    }
    return (
      <div>
        <Badge
          aria-hidden
          color="blue"
          style={{ cursor: 'pointer' }}
          onClick={() => setShow(true)}>
          {cellValue}
        </Badge>
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
      {link && (
        <LinkForeignKey
          row={data}
          colDef={colDef}
          show={link}
          setShow={setLink}
          column={column}
          updateData={updateValue}
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
