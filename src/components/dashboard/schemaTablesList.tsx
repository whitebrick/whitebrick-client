import React, { useEffect, useState } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withAuthenticationRequired } from '@auth0/auth0-react';
import Avatar from 'react-avatar';
import { navigate } from 'gatsby';
import Skeleton from 'react-loading-skeleton';
import { Pane, AddIcon } from 'evergreen-ui';
import { useManualQuery } from 'graphql-hooks';
import { SchemaItemType, TableItemType } from '../../types';
import { actions } from '../../state/actions';
import { SCHEMA_TABLES_QUERY } from '../../graphql/queries/wb';

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
      <div className="row">
        {tables && tables.length === 0 ? (
          <div className="col-md-6 offset-md-4">
            <div
              className="text-center rounded p-2"
              style={{ backgroundColor: '#ececec', width: '60%' }}>
              <p>You do not have any tables yet.</p>
              <div
                aria-hidden
                onClick={() => {
                  actions.setFormData({ schema });
                  actions.setType('createTable');
                  actions.setShow(true);
                }}>
                <AddIcon color="info" />
              </div>
            </div>
          </div>
        ) : (
          <div>
            {loaded ? (
              <>
                {tables &&
                  tables.length > 0 &&
                  tables.map(table => (
                    <div
                      key={table.name}
                      className="col-md-2 col-sm-6 text-center btn"
                      aria-hidden="true"
                      onClick={() => {
                        if (schema.organizationOwnerName)
                          navigate(
                            `/${schema.organizationOwnerName}/${schema.name}/${table.name}`,
                          );
                        else navigate(`/db/${schema.name}/table/${table.name}`);
                      }}>
                      <Avatar name={table.label} size="75" round="12px" />
                      <p className="mt-2">{table.label}</p>
                    </div>
                  ))}
                <div
                  className="col-md-2 text-center btn"
                  aria-hidden="true"
                  onClick={() => {
                    actions.setFormData({ schema });
                    actions.setType('createTable');
                    actions.setShow(true);
                  }}>
                  <Avatar name="+" size="75" round="12px" color="#4B5563" />
                  <p className="mt-2">Add table</p>
                </div>
              </>
            ) : (
              [...Array(12)].map(e => (
                <div className="col-md-2 text-center btn" key={e}>
                  <Skeleton height="100px" />
                </div>
              ))
            )}
          </div>
        )}
      </div>
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
