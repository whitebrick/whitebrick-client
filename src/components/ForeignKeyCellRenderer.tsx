import React, { useState } from 'react';
import { FaExternalLinkAlt } from 'react-icons/fa';
import ViewForeignKeyData from './viewForeignKeyData';

type ForeignKeyCellRendererPropsType = {
  valueFormatted: string;
  value: string;
  column: any;
};

const ForeignKeyCellRenderer = ({
  valueFormatted,
  value,
  column,
}: ForeignKeyCellRendererPropsType) => {
  const cellValue = valueFormatted ? valueFormatted : value;
  const [show, setShow] = useState(false);

  return (
    <React.Fragment>
      <span>
        <span>{cellValue}</span>
        {cellValue && (
          <div className="float-right d-flex align-items-center">
            <button className="btn" onClick={() => setShow(true)}>
              <FaExternalLinkAlt size="12px" />
            </button>
          </div>
        )}
      </span>
      <ViewForeignKeyData
        show={show}
        setShow={setShow}
        column={column}
        cellValue={cellValue}
      />
    </React.Fragment>
  );
};

export default ForeignKeyCellRenderer;
