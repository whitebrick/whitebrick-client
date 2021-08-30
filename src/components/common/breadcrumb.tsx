import React from 'react';
import { Link, navigate } from 'gatsby';
import { ChevronRightIcon, Select } from 'evergreen-ui';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { SchemaItemType, TableItemType } from '../../types';
import { actions } from '../../state/actions';

type BreadcrumbPropsType = {
  schema: SchemaItemType;
  schemas: SchemaItemType[];
  table: TableItemType;
  tables: TableItemType[];
  tableLayout?: boolean;
};

const defaultProps = {
  tableLayout: false,
};

const Breadcrumb = ({
  schema,
  schemas,
  table,
  tables,
  tableLayout,
}: BreadcrumbPropsType) => {
  // This function is used with sort() to alphabetically arrange the elements in an
  // object.
  const compare = (a, b) => {
    if (a.label < b.label) {
      return -1;
    }
    if (a.label > b.label) {
      return 1;
    }
    return 0;
  };

  // This function handles the user's wish to go to another table within the same schema
  // when prompted through the breadcrumb navigation in tableLayout.
  const changeTable = e => {
    const tableName = e.target.value;
    navigate(
      schema.organizationOwnerName
        ? `/${schema.organizationOwnerName}/${schema.name}/${tableName}`
        : `/db/${schema.name}/table/${tableName}`,
    );
  };

  // This function handles the user's trigger to go to another schema when prompted
  // through the breadcrumb navigation in tableLayout.
  const changeSchema = e => {
    const schemaName = e.target.value;
    navigate(
      schema.organizationOwnerName
        ? `/${schema.organizationOwnerName}/${schemaName}/`
        : `/db/${schemaName}/`,
    );
  };

  return (
    <p>
      <Link to="/">Home</Link> <ChevronRightIcon />{' '}
      <Select
        onChange={event => changeSchema(event)}
        width={150}
        height={20}
        value={schema.name}>
        {schemas.map(schema => (
          <option value={schema.name}>{schema.label}</option>
        ))}
      </Select>
      {tableLayout && (
        <>
          <ChevronRightIcon />
          <Select
            onChange={event => changeTable(event)}
            width={150}
            height={20}
            value={table.name}>
            {tables?.sort(compare)?.map(table => (
              <option value={table.name}>{table.label}</option>
            ))}
          </Select>
        </>
      )}
    </p>
  );
};

Breadcrumb.defaultProps = defaultProps;
const mapStateToProps = state => ({
  schema: state.schema,
  schemas: state.schemas,
  table: state.table,
  tables: state.tables,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(actions, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(Breadcrumb);
