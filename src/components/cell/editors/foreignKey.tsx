import React, {
  useState,
  useEffect,
  forwardRef,
  useRef,
  useImperativeHandle,
  useContext,
} from 'react';
import { ClientContext } from 'graphql-hooks';
import { IconButton, PlusIcon, SmallPlusIcon } from 'evergreen-ui';
import LinkForeignKey from '../../common/linkForeignKey';
import { updateTableData } from '../../../utils/updateTableData';

const ForeignKeyEditor = forwardRef((props: any, ref) => {
  const client = useContext(ClientContext);
  const [value, setValue] = useState(parseInt(props.value, 10));
  const [show, setShow] = useState(false);

  const refInput = useRef(null);

  const updateData = async (row, relData, colDef, schemaName, tableName) => {
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
    updateTableData(schemaName, tableName, variables, client, null);
    setValue(relData[colDef.field.split('_').reverse()[0]]);
  };

  useEffect(() => {
    setTimeout(() => refInput.current.focus());
  }, []);

  useImperativeHandle(ref, () => {
    return {
      getValue() {
        return value;
      },

      isCancelBeforeStart() {
        return false;
      },

      isCancelAfterEnd() {
        return value > 1000;
      },
    };
  });

  return (
    <>
      <div className="d-flex align-items-center">
        <input
          type="number"
          ref={refInput}
          value={value}
          onChange={event => setValue(parseInt(event.target.value, 10))}
          style={{ width: '90%' }}
        />
        <IconButton
          onClick={() => setShow(true)}
          appearance="minimal"
          icon={PlusIcon}
          style={{ height: '100%' }}
        />
      </div>
      {show && (
        <LinkForeignKey
          row={props.data}
          colDef={props.colDef}
          show={show}
          setShow={setShow}
          column={props.column}
          updateData={updateData}
        />
      )}
    </>
  );
});

export default ForeignKeyEditor;
