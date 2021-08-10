import React, { useEffect, useState } from 'react';
import SchemaTablesList from '../dashboard/schemaTablesList';
import Tabs from '../elements/tabs';
import { FaChevronRight, FaPen } from 'react-icons/fa';
import { SchemaItemType } from '../../types';
import { bindActionCreators } from 'redux';
import { actions } from '../../state/actions';
import { connect } from 'react-redux';
import Members from '../../components/common/members';
import { useManualQuery } from 'graphql-hooks';
import { SCHEMA_USERS_QUERY } from '../../graphql/queries/wb';
import { Link } from 'gatsby';

type SchemaLayoutType = {
  schema: SchemaItemType;
  actions: any;
};

const SchemaLayout = ({ schema, actions }: SchemaLayoutType) => {
  const [users, setUsers] = useState([]);
  const [fetchSchemaUsers] = useManualQuery(SCHEMA_USERS_QUERY, {
    variables: {
      schemaName: schema.name,
    },
  });

  const fetchData = () => {
    fetchSchemaUsers().then(r => setUsers(r?.data?.wbSchemaUsers));
  };
  useEffect(fetchData, []);

  const tabs = [
    {
      title: 'Tables',
      element: <SchemaTablesList />,
    },
    {
      title: 'Members',
      element: <Members users={users} refetch={fetchData} name={'schema'} />,
      noPane: true,
    },
  ];

  return (
    <div className="mt-3">
      <div style={{ padding: `1rem` }}>
        <p>
          <Link to="/">Home</Link> <FaChevronRight />{' '}
          <Link
            to={
              schema.organizationOwnerName
                ? `/${schema.organizationOwnerName}/${schema.name}`
                : `/db/${schema.name}`
            }>
            {schema.label}
          </Link>
        </p>
        <h3
          className="m-0 w-25"
          aria-hidden={true}
          style={{ cursor: 'pointer' }}>
          <span>
            {schema.label}
            <FaPen
              className="ml-1"
              size="15px"
              onClick={() => {
                actions.setType('editDatabase');
                actions.setFormData(schema);
                actions.setShow(true);
              }}
            />
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
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(actions, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(SchemaLayout);
