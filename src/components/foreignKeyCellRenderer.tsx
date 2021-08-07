import React, { useState } from 'react';
import { SmallPlusIcon, ExpandAllIcon, Badge } from 'evergreen-ui';
import ViewForeignKeyData from './common/viewForeignKeyData';
import LinkForeignKey from './common/linkForeignKey';
import { ColDef } from 'ag-grid-community';

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
  const cellValue = valueFormatted ? valueFormatted : value;

  const [show, setShow] = useState(false);
  const [link, setLink] = useState(false);

  return (
    <React.Fragment>
      <span>
        {cellValue ? (
          <div>
            <Badge color="blue">{cellValue}</Badge>
            <div className="float-right d-flex align-items-center">
              <button className="btn" onClick={() => setShow(true)}>
                <ExpandAllIcon />
              </button>
            </div>
          </div>
        ) : (
          <div className="float-right d-flex align-items-center">
            <button className="btn" onClick={() => setLink(true)}>
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
        />
      )}
    </React.Fragment>
  );
};

export default ForeignKeyCellRenderer;
