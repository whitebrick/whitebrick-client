import React, { useEffect, useState } from 'react';
import SchemaTablesList from '../dashboard/schemaTablesList';
import Tabs from '../elements/tabs';
import { FaPen } from 'react-icons/fa';
import { SchemaItemType } from '../../types';
import { bindActionCreators } from 'redux';
import { actions } from '../../state/actions';
import { connect } from 'react-redux';
import Members from '../../components/common/members';
import { useManualQuery } from 'graphql-hooks';
import { SCHEMA_USERS_QUERY } from '../../graphql/queries/wb';

type SchemaLayoutType = {
  schema: SchemaItemType;
  loaded: boolean;
  setShow: (value: boolean) => void;
  setType: (value: string) => void;
  actions: any;
};

const SchemaLayout = ({
  schema,
  loaded,
  setShow,
  setType,
  actions,
}: SchemaLayoutType) => {
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
      element: <SchemaTablesList loaded={loaded} />,
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
        <h3
          className="m-0"
          aria-hidden={true}
          style={{ cursor: 'pointer' }}
          onClick={() => {
            setType('editSchema');
            actions.setFormData(schema);
            setShow(true);
          }}>
          <span>
            {schema.label}
            <FaPen className="ml-1" size="15px" />
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
