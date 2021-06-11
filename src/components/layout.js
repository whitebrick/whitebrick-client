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
import Table from './tableLayout';
import { useAuth0, withAuthenticationRequired } from '@auth0/auth0-react';
import SidePanel from './sidePanel';
import Sidebar from './sidebar';
import FormMaker from './formMaker';
import { SCHEMAS_QUERY, SCHEMA_TABLES_QUERY } from '../graphql/queries/wb';
import {
  CREATE_SCHEMA_MUTATION,
  CREATE_TABLE_MUTATION,
} from '../graphql/mutations/wb';
import Loading from './loading';

const Layout = ({ table, schema, accessToken, actions }) => {
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
  const [createSchema] = useMutation(CREATE_SCHEMA_MUTATION);
  const [createTable] = useMutation(CREATE_TABLE_MUTATION);

  const [userShow, setUserShow] = useState(false);
  const menuClass = `dropdown-menu${userShow ? ' show' : ''}`;

  const newTableFormFields = [
    {
      name: 'schema',
      label: 'Database Name',
      type: 'select',
      options: schemas?.wbSchemas,
      nested: true,
      nestedValue: 'name',
    },
    { name: 'name', label: 'Name', type: 'text', required: true },
    { name: 'label', label: 'Table Label', type: 'text', required: true },
  ];

  const newDataBaseFormFields = [
    { name: 'name', label: 'Name', type: 'text', required: true },
    {
      name: 'name',
      label: 'Label',
      type: 'text',
      required: true,
    },
  ];

  useEffect(() => {
    actions.setTables([]);
    const fetchTables = async () => {
      if (schema.name !== '' && schema.name !== undefined) {
        const { data } = await fetchSchemaTables({
          variables: { schemaName: schema.name },
        });
        actions.setTables(data.wbTables);
      }
    };
    fetchTables();
  }, [schema, fetchSchemaTables, actions]);

  const fetchTablesAndColumns = async () => {
    const { data } = await fetchSchemaTables({
      variables: { schemaName: schema.name },
    });
    let t = data.wbTables.filter(tableName => tableName.name === table.name)[0];
    if (t.columns.length > 0) {
      actions.setTables(data.wbTables);
      actions.setColumns(t.columns);
      actions.setOrderBy(t.columns[0].name);
    } else {
      actions.setColumns([]);
    }
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
          schemaName: formData.schema.name,
          tableName: formData.name,
          tableLabel: formData.label,
          create: true,
        },
      });
      if (!loading && !error) {
        await fetchTablesAndColumns();
        setShow(false);
      }
    }
  };

  if (loading) return <Loading />;
  if (error) return 'Something Bad Happened';

  return (
    <>
      <Seo
        title={
          user && schema.name !== '' && table !== ''
            ? `${table.label} | ${schema.label}`
            : data.site.siteMetadata?.title || `Title`
        }
      />
      <div>
        <Sidebar
          setFormData={setFormData}
          setShow={setShow}
          setType={setType}
          userShow={userShow}
          menuClass={menuClass}
          setUserShow={setUserShow}
          schemas={schemas}
        />
        <main id="main">
          {user && schema.name !== '' && table !== '' ? (
            <Table
              key={schema.name + table.name}
              fetchTables={fetchTablesAndColumns}
            />
          ) : (
            <p>Please select a table to render</p>
          )}
          <SidePanel
            show={show}
            renderSaveButton={type !== ''}
            setShow={setShow}
            onSave={onSave}
            type="save"
            name={type === 'token' ? 'Access Token' : `Create a new ${type}?`}>
            {type === 'database' ? (
              <FormMaker
                formData={formData}
                setFormData={setFormData}
                fields={newDataBaseFormFields}
              />
            ) : type === 'table' ? (
              <FormMaker
                formData={formData}
                setFormData={setFormData}
                fields={newTableFormFields}
              />
            ) : type === 'token' ? (
              <React.Fragment>
                <code
                  aria-hidden="true"
                  style={{ cursor: 'pointer' }}
                  onClick={() =>
                    navigator.clipboard.writeText(`Bearer ${accessToken}`)
                  }>
                  Bearer {accessToken}
                </code>
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
  accessToken: state.accessToken,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(actions, dispatch),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withAuthenticationRequired(Layout));
