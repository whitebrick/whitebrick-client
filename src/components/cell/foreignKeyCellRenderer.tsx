import React, { useState } from 'react';
import { SmallPlusIcon, Badge } from 'evergreen-ui';
import { ColDef } from 'ag-grid-community';
import ViewForeignKeyData from '../common/viewForeignKeyData';
import LinkForeignKey from '../common/linkForeignKey';

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
  const cellValue = valueFormatted || value;

  const [show, setShow] = useState(false);
  const [link, setLink] = useState(false);

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
        />
      )}
    </>
  );
};

export default ForeignKeyCellRenderer;
