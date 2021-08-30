import React, { useEffect, useState } from 'react';
import { ChevronRightIcon, EditIcon, IconButton, Select } from 'evergreen-ui';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { useManualQuery } from 'graphql-hooks';
import { Link, navigate } from 'gatsby';
import SchemaTablesList from '../dashboard/schemaTablesList';
import Tabs from '../elements/tabs';
import { SchemaItemType } from '../../types';
import { actions } from '../../state/actions';
import Members from '../common/members';
import { SCHEMA_USERS_QUERY } from '../../graphql/queries/wb';

type SchemaLayoutType = {
  schema: SchemaItemType;
  schemas: SchemaItemType[];
  actions: any;
};

const SchemaLayout = ({ schema, schemas, actions }: SchemaLayoutType) => {
  const userRole = schema?.role?.name;
  const [users, setUsers] = useState([]);
  const [fetchSchemaUsers] = useManualQuery(SCHEMA_USERS_QUERY, {
    variables: {
      schemaName: schema.name,
    },
  });

  const fetchData = () => {
    fetchSchemaUsers().then(r => setUsers(r?.data?.wbSchemaUsers));
  };
  useEffect(fetchData, [fetchSchemaUsers]);

  const tabs = [
    {
      title: 'Tables',
      element: <SchemaTablesList />,
    },
    {
      title: 'Members',
      element: <Members users={users} refetch={fetchData} name="schema" />,
      noPane: true,
    },
  ];

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
    <div className="mt-3">
      <div style={{ padding: `1rem` }}>
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
        </p>
        <h3 className="m-0 w-50">
          <span>
            {schema.label}
            {(userRole === 'schema_owner' ||
              userRole === 'schema_administrator') && (
              <IconButton
                appearance="minimal"
                className="ml-1"
                onClick={() => {
                  actions.setType('editDatabase');
                  actions.setFormData(schema);
                  actions.setShow(true);
                }}
                icon={EditIcon}
              />
            )}
          </span>
        </h3>
        <div className="mt-4">
          <Tabs items={tabs} />
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = state => ({
  schema: state.schema,
  schemas: state.schemas,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(actions, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(SchemaLayout);
