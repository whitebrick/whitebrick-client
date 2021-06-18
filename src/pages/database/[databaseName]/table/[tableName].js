import React, { useEffect } from 'react';
import Layout from '../../../../components/layout';
import { bindActionCreators } from 'redux';
import { actions } from '../../../../actions';
import { connect } from 'react-redux';
import { withAuthenticationRequired } from '@auth0/auth0-react';
import Seo from '../../../../components/seo';

const Table = ({ params, schemas, schema, tables, table, actions }) => {
  useEffect(() => {
    if (schemas && schemas.length > 0) {
      let s = schemas.filter(
        schema => schema.name === params['databaseName'],
      )[0];
      actions.setSchema(s);
      if (tables && tables.length > 0) {
        let table = tables.filter(
          table => table.name === params['tableName'],
        )[0];
        actions.setTable(table);
        actions.setColumns(table.columns);
        actions.setOrderBy(table.columns[0].name);
      }
    }
  }, [params, schemas, tables, actions]);

  return (
    <React.Fragment>
      <Seo title={`${table.label} | ${schema.label}`} />
      <Layout />
    </React.Fragment>
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
