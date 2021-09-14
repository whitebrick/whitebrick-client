import React, { useEffect, useState } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withAuthenticationRequired } from '@auth0/auth0-react';
import Skeleton from 'react-loading-skeleton';
import { Pane } from 'evergreen-ui';
import { useManualQuery } from 'graphql-hooks';
import { SchemaItemType, TableItemType } from '../../types';
import { actions } from '../../state/actions';
import { SCHEMA_TABLES_QUERY } from '../../graphql/queries/wb';
import NoData from '../common/noData';
import AddData from '../common/addData';
import TableContextItem from '../common/tableContextItem';

type TablesPropsType = {
  schema: SchemaItemType;
  tables: TableItemType[];
  actions: any;
};

const SchemaTablesList = ({ schema, tables, actions }: TablesPropsType) => {
  const [loaded, setLoaded] = useState(false);
  const [fetchTables] = useManualQuery(SCHEMA_TABLES_QUERY);

  useEffect(() => {
    const fetchTablesData = async () => {
      actions.setTables([]);
      const { data } = await fetchTables({
        variables: {
          schemaName: schema.name,
        },
      });
      return data;
    };
    fetchTablesData()
      .then(r => actions.setTables(r.wbMyTables))
      .finally(() => setLoaded(true));
  }, [actions, fetchTables, schema]);

  return (
    <Pane padding={16} flex={1} background="tint1">
      {loaded ? (
        <div className="row">
          {tables && tables.length > 0 ? (
            tables.map(table => (
              <div
                key={table.name}
                className="col-md-2 col-sm-6 text-center btn">
                <TableContextItem table={table} />
              </div>
            ))
          ) : (
            <NoData type="createTable" name="table" bg="transparent" />
          )}
          {tables.length > 0 && (
            <AddData
              type="createTable"
              name="table"
              permissionType="alter_schema"
            />
          )}
        </div>
      ) : (
        <div className="row">
          {[...Array(12)].map(e => (
            <div className="col-md-2 text-center btn" key={e}>
              <Skeleton height="100px" />
            </div>
          ))}
        </div>
      )}
    </Pane>
  );
};

const mapStateToProps = state => ({
  schema: state.schema,
  tables: state.tables,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(actions, dispatch),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withAuthenticationRequired(SchemaTablesList));
