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
import FormMaker from './formMaker';
import { GET_TABLE_FIELDS } from '../graphql/queries/table';
import { SCHEMAS_QUERY, SCHEMA_TABLES_QUERY } from '../graphql/queries/wb';
import {
  CREATE_SCHEMA_MUTATION,
  CREATE_TABLE_MUTATION,
} from '../graphql/mutations/wb';

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
      if (schema !== '' && table !== '' && table !== undefined) {
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
          {user && schema !== '' && table !== '' && fields.length > 0 ? (
            <Table key={table} />
          ) : (
            <p>Please select a table to render</p>
          )}
          <SidePanel
            show={show}
            renderSaveButton={type !== ''}
            setShow={setShow}
            onSave={onSave}
            type="save"
            name={`Create a new ${type}?`}>
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
