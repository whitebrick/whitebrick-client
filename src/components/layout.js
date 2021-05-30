/**
 * Layout component that queries for data
 * with Gatsby's useStaticQuery component
 *
 * See: https://www.gatsbyjs.com/docs/use-static-query/
 */

import React, { useEffect, useState } from 'react';
import { useStaticQuery, graphql } from 'gatsby';

import Seo from './seo';
import { useManualQuery, useMutation, useQuery } from 'graphql-hooks';
import { bindActionCreators } from 'redux';
import { actions } from '../actions';
import { connect } from 'react-redux';
import Table from './table';
import { useAuth0 } from '@auth0/auth0-react';
import SidePanel from './sidePanel';
import Sidebar from './sidebar';

const GET_TABLE_FIELDS = `query ($name: String!){
  __type(name: $name) {
    name
    fields {
      name
      type{
        kind
        ofType{
          kind
        }
      }
    }
  }
}`;

const SCHEMAS_QUERY = `query ($userEmail: String!) {
  wbSchemas(userEmail: $userEmail) {
    name
  }
}`;

const SCHEMA_TABLES_QUERY = `query ($schemaName: String!){
  wbTables(schemaName: $schemaName) {
    name
    label
  }
}`;

const CREATE_SCHEMA_MUTATION = `mutation ($name: String!, $label: String!, $email: String!){
  wbCreateSchema(name: $name, label: $label, userOwnerEmail: $email){
    name
  }
}`;

const CREATE_TABLE_MUTATION = `mutation ($schemaName: String!, $tableName: String!){
  wbCreateTable(schemaName: $schemaName, tableName: $tableName)
}`;

const Layout = ({ table, schema, fields, actions }) => {
  const data = useStaticQuery(graphql`
    query SiteTitleQuery {
      site {
        siteMetadata {
          title
        }
      }
    }
  `);

  const { user } = useAuth0();
  const [show, setShow] = useState(false);
  const [type, setType] = useState('');
  const [formData, setFormData] = useState({});
  const { loading, error, data: schemas, refetch } = useQuery(SCHEMAS_QUERY, {
    variables: { userEmail: user.email },
  });
  const [fetchSchemaTables] = useManualQuery(SCHEMA_TABLES_QUERY);
  const [fetchQueryFields] = useManualQuery(GET_TABLE_FIELDS);
  const [createSchema] = useMutation(CREATE_SCHEMA_MUTATION);
  const [createTable] = useMutation(CREATE_TABLE_MUTATION);

  const [userShow, setUserShow] = useState(false);
  const menuClass = `dropdown-menu${userShow ? ' show' : ''}`;

  useEffect(() => {
    actions.setTables([]);
    const fetchTables = async () => {
      if (schema !== '' && schema !== undefined) {
        const { data } = await fetchSchemaTables({
          variables: { schemaName: schema },
        });
        actions.setTables(data.wbTables);
      }
    };
    fetchTables();
  }, [schema, fetchSchemaTables, actions]);

  useEffect(() => {
    const fetchFields = async () => {
      if (table !== '' && table !== undefined) {
        const { data } = await fetchQueryFields({
          variables: { name: schema + '_' + table.name },
        });
        const { fields } = data['__type'];
        let f = [];
        fields.forEach(field => {
          let kind = field.type?.kind;
          let type = field.type.ofType?.kind
            ? field.type.ofType.kind
            : 'SCALAR';
          if (
            kind !== 'OBJECT' &&
            kind !== 'LIST' &&
            type !== 'OBJECT' &&
            type !== 'LIST'
          )
            f.push(field.name);
        });
        actions.setFields(f);
      }
    };
    fetchFields();
  }, [schema, table, fetchQueryFields, actions]);

  const setTable = name => {
    actions.setTable(name);
    actions.setFields([]);
  };

  const onSave = async () => {
    if (type === 'database') {
      const { error, loading } = createSchema({
        variables: {
          name: formData.name,
          label: formData.label,
          email: user.email,
        },
      });
      if (!loading && !error) {
        refetch();
        setShow(false);
      }
    } else {
      const { error, loading } = createTable({
        variables: {
          schemaName: formData.schema,
          tableName: formData.name,
        },
      });
      if (!loading && !error) {
        const { data } = await fetchSchemaTables({
          variables: { schemaName: schema },
        });
        actions.setTables(data.wbSchemaTableNames);
        setShow(false);
      }
    }
  };

  if (loading) return 'Loading...';
  if (error) return 'Something Bad Happened';

  return (
    <>
      <Seo title={data.site.siteMetadata?.title || `Title`} />
      <div>
        <Sidebar
          setFormData={setFormData}
          setShow={setShow}
          setTable={setTable}
          setType={setType}
          userShow={userShow}
          menuClass={menuClass}
          setUserShow={setUserShow}
          schemas={schemas}
        />
        <main id="main">
          {user && table !== '' && fields.length > 0 && <Table key={table} />}
          <SidePanel
            show={show}
            renderSaveButton={type !== ''}
            setShow={setShow}
            onSave={onSave}
            type="save"
            name={`Create a new ${type}?`}>
            {type === 'database' ? (
              <React.Fragment>
                <div className="mt-3">
                  <label htmlFor="name">Name</label>
                  <input
                    className="form-control"
                    value={formData?.name}
                    onChange={e =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="mt-3">
                  <label htmlFor="label">Label</label>
                  <input
                    className="form-control"
                    value={formData?.label}
                    onChange={e =>
                      setFormData({ ...formData, label: e.target.value })
                    }
                    required
                  />
                </div>
              </React.Fragment>
            ) : type === 'table' ? (
              <React.Fragment>
                <div className="mt-3">
                  <label htmlFor="schema">Database Name</label>
                  <select
                    className="form-control"
                    value={formData.schema}
                    onBlur={() => {}}
                    onChange={e =>
                      setFormData({ ...formData, schema: e.target.value })
                    }>
                    {schemas.wbSchemas.map(schema => (
                      <option key={schema.name} value={schema.name}>
                        {schema.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mt-3">
                  <label htmlFor="name">Name</label>
                  <input
                    className="form-control"
                    value={formData?.name}
                    onChange={e =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
              </React.Fragment>
            ) : (
              <React.Fragment>
                <div className="list-group w-100 rounded-0">
                  <div
                    className="list-group-item py-2"
                    aria-hidden="true"
                    onClick={() => {
                      setType('database');
                      setFormData({});
                    }}>
                    Database
                  </div>
                  <div
                    className="list-group-item py-2"
                    aria-hidden="true"
                    onClick={() => {
                      setType('table');
                      setFormData({});
                    }}>
                    Table
                  </div>
                </div>
              </React.Fragment>
            )}
          </SidePanel>
        </main>
      </div>
    </>
  );
};

const mapStateToProps = state => ({
  schema: state.schema,
  tables: state.tables,
  table: state.table,
  fields: state.fields,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(actions, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(Layout);
