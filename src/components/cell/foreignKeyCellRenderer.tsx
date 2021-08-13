import React, { useContext, useState } from 'react';
import { SmallPlusIcon, Badge } from 'evergreen-ui';
import { ColDef } from 'ag-grid-community';
import { ClientContext } from 'graphql-hooks';
import ViewForeignKeyData from '../common/viewForeignKeyData';
import LinkForeignKey from '../common/linkForeignKey';
import { updateTableData } from '../../utils/updateTableData';

type ForeignKeyCellRendererPropsType = {
  valueFormatted: string;
  value: string;
  column: any;
  data: any;
  colDef: ColDef;
};

const ForeignKeyCellRenderer = ({
  valueFormatted,
  value,
  column,
  data,
  colDef,
}: ForeignKeyCellRendererPropsType) => {
  const client = useContext(ClientContext);
  const cellValue = valueFormatted || value;

  const [show, setShow] = useState(false);
  const [link, setLink] = useState(false);

  const updateValue = async (row, relData, colDef, schemaName, tableName) => {
    const variables = { where: {}, _set: {} };
    Object.keys(row).forEach(key => {
      if (row[key]) {
        variables.where[key] = {
          _eq: parseInt(row[key], 10) ? parseInt(row[key], 10) : row[key],
        };
      }
    });
    variables._set[colDef.field] =
      relData[colDef.field.split('_').reverse()[0]];
    updateTableData(schemaName, tableName, variables, client, null);
  };

  return (
    <>
      <span>
        {cellValue ? (
          <div>
            <Badge
              aria-hidden
              color="blue"
              style={{ cursor: 'pointer' }}
              onClick={() => setShow(true)}>
              {cellValue}
            </Badge>
          </div>
        ) : (
          <div className="float-right d-flex align-items-center">
            <button type="submit" className="btn" onClick={() => setLink(true)}>
              <SmallPlusIcon />
            </button>
          </div>
        )}
      </span>
      {show && (
        <ViewForeignKeyData
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

export default ForeignKeyCellRenderer;
