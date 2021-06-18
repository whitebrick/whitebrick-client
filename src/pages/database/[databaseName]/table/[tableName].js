import React, { useEffect, useState } from 'react';
import Layout from '../../../../components/layout';
import { bindActionCreators } from 'redux';
import { actions } from '../../../../actions';
import { connect } from 'react-redux';
import { withAuthenticationRequired } from '@auth0/auth0-react';
import Seo from '../../../../components/seo';
import NotFound from '../../../../components/notFound';
import Loading from '../../../../components/loading';

const Table = ({ params, schemas, schema, tables, table, actions }) => {
  const [found, setFound] = useState(true);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    if (schemas && schemas.length > 0) {
      let s = schemas.filter(
        schema => schema.name === params['databaseName'],
      )[0];
      if (s && Object.keys(s).length > 0) actions.setSchema(s);
      if (tables && tables.length > 0) {
        let table = tables.filter(
          table => table.name === params['tableName'],
        )[0];
        if (table && Object.keys(table).length > 0) {
          actions.setTable(table);
          actions.setColumns(table.columns);
          actions.setOrderBy(table.columns[0].name);
        }
      }
    }
    setFound(Object.keys(table).length > 0 && Object.keys(schema).length > 0);
    setLoading(false);
  }, [params, schemas, tables, actions, table, schema]);

  return !isLoading ? (
    <React.Fragment>
      {found ? (
        <div>
          <Seo title={`${table.label} | ${schema.label}`} />
          <Layout />
        </div>
      ) : (
        <Layout>
          <NotFound name="Table" />
        </Layout>
      )}
    </React.Fragment>
  ) : (
    <Loading />
  );
};

const mapStateToProps = state => ({
  schemas: state.schemas,
  tables: state.tables,
  table: state.table,
  schema: state.schema,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(actions, dispatch),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withAuthenticationRequired(Table));
