import React, { ChangeEvent, useState, useEffect } from 'react';
import { SelectField } from 'evergreen-ui';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { useManualQuery } from 'graphql-hooks';
import { parseOptions } from '../../utils/select';
import { actions } from '../../state/actions';
import { TableItemType } from '../../types';
import { SCHEMA_TABLE_BY_NAME_QUERY } from '../../graphql/queries/wb';

type ForeignKeyProps = {
  tableName: any;
  columnName: any;
  values: any;
  handleChange: (e: ChangeEvent<any>) => void;
  tables: TableItemType[];
  actions: any;
  schema: any;
};

const ForeignKey = ({
  tableName,
  columnName,
  values,
  handleChange,
  tables,
  actions,
  schema,
}: ForeignKeyProps) => {
  const [fetchSchemaTable] = useManualQuery(SCHEMA_TABLE_BY_NAME_QUERY);
  const [columnOptions, setColumnOptions] = useState([]);

  useEffect(() => {
    const fetchColumns = async () => {
      const { loading, data, error } = await fetchSchemaTable({
        variables: {
          schemaName: schema.name,
          tableName: values?.[tableName],
          withColumns: true,
          withSettings: true,
        },
      });
      if (!loading && !error) setColumnOptions(data.wbMyTableByName.columns);
    };
    if (values?.[tableName]) fetchColumns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchSchemaTable, schema.name, values?.[tableName]]);

  return (
    <div className="mt-4">
      <hr />
      <h5 className="pb-2">Foreign Key Relation</h5>
      <SelectField
        name={tableName}
        label="Table"
        value={values?.[tableName]}
        required
        onChange={handleChange}>
        {parseOptions(tables).map(option => (
          <option key={option.value} value={option.value}>
            {option.key}
          </option>
        ))}
      </SelectField>
      <SelectField
        name={columnName}
        label="Column"
        value={values?.[columnName]}
        required
        onChange={handleChange}>
        {parseOptions(columnOptions).map(option => (
          <option key={option.value} value={option.value}>
            {option.key}
          </option>
        ))}
      </SelectField>
    </div>
  );
};

const mapStateToProps = state => ({
  tables: state.tables,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(actions, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(ForeignKey);
