import React, { useEffect, useState } from 'react';
import { RadioGroup } from 'evergreen-ui';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { useManualQuery, useMutation } from 'graphql-hooks';
import Modal from '../elements/modal';
import UserSearchInput from '../elements/userInput';
import { actions } from '../../state/actions';
import {
  SCHEMA_SET_USER_ROLE_MUTATION,
  SET_USERS_ROLE_MUTATION,
  TABLE_SET_USER_ROLE_MUTATION,
} from '../../graphql/mutations/wb';
import {
  OrganizationItemType,
  SchemaItemType,
  TableItemType,
} from '../../types';
import { isObjectEmpty } from '../../utils/objectEmpty';
import {
  ORGANIZATION_USERS_QUERY,
  SCHEMA_USERS_QUERY,
  TABLE_USERS_QUERY,
} from '../../graphql/queries/wb';

type InviteUserModalType = {
  show: boolean;
  setShow: (value: boolean) => void;
  cloudContext: any;
  name: string;
  schema: SchemaItemType;
  organization: OrganizationItemType;
  table: TableItemType;
  singleSchema?: any;
  singleTable?: any;
  actions: any;
};

const defaultProps = {
  singleSchema: null,
  singleTable: null,
};

const InviteUserModal = ({
  show,
  setShow,
  cloudContext,
  name,
  organization,
  schema,
  table,
  singleSchema,
  singleTable,
  actions,
}: InviteUserModalType) => {
  const [data, setData] = useState({ user: {}, role: '' });
  const [options, setOptions] = useState([]);

  const [fetchTableUsers] = useManualQuery(TABLE_USERS_QUERY);
  const [fetchSchemaUsers] = useManualQuery(SCHEMA_USERS_QUERY);
  const [fetchOrganizationUsers] = useManualQuery(ORGANIZATION_USERS_QUERY);

  const [updateSchemaUserRole] = useMutation(SCHEMA_SET_USER_ROLE_MUTATION);
  const [updateTableUserRole] = useMutation(TABLE_SET_USER_ROLE_MUTATION);
  const [updateOrganizationUserRole] = useMutation(SET_USERS_ROLE_MUTATION);

  const roles = !isObjectEmpty(cloudContext) && cloudContext.roles[name];

  useEffect(() => {
    if (name !== '') {
      const opts = [];
      Object.keys(roles).map((role: string) =>
        opts.push({ label: roles[role].label, value: role }),
      );
      setOptions(opts);
      setData({ ...data, role: Object.keys(roles)[0] });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, roles]);

  const fetchUsers = () => {
    if (name === 'table') {
      fetchTableUsers({
        variables: {
          schemaName: schema.name,
          tableName: isObjectEmpty(table) ? singleTable.name : table.name,
        },
      }).then(r => actions.setUsers(r?.data?.wbTableUsers));
    } else if (name === 'schema') {
      fetchSchemaUsers({
        variables: {
          schemaName: isObjectEmpty(schema) ? singleSchema.name : schema.name,
        },
      }).then(r => actions.setUsers(r?.data?.wbSchemaUsers));
    } else {
      fetchOrganizationUsers({
        variables: {
          organizationName: organization.name,
        },
      }).then(r => actions.setUsers(r?.data?.wbOrganizationUsers));
    }
  };

  const onSave = async () => {
    if (name === 'schema') {
      await updateSchemaUserRole({
        variables: {
          schemaName: isObjectEmpty(schema) ? singleSchema?.name : schema?.name,
          roleName: data.role,
          userEmails: [data.user],
        },
      });
    } else if (name === 'table') {
      await updateTableUserRole({
        variables: {
          schemaName: isObjectEmpty(schema) ? singleSchema?.name : schema?.name,
          tableName: isObjectEmpty(table) ? singleTable?.name : table?.name,
          roleName: data.role,
          userEmails: [data.user],
        },
      });
    } else {
      await updateOrganizationUserRole({
        variables: {
          organizationName: organization.name,
          roleName: data.role,
          userEmails: [data.user],
        },
      });
    }
    fetchUsers();
    setShow(false);
  };

  return (
    <Modal
      isShown={show}
      setIsShown={setShow}
      title="Invite User"
      label="Invite"
      onSave={onSave}>
      <div className="p-2" style={{ minHeight: '30vh' }}>
        <UserSearchInput data={data} setData={setData} />
        <div className="mt-3">
          <RadioGroup
            label="Choose a role"
            size={16}
            value={data.role}
            options={options}
            onChange={e => setData({ ...data, role: e.target.value })}
          />
        </div>
      </div>
    </Modal>
  );
};

InviteUserModal.defaultProps = defaultProps;
const mapStateToProps = state => ({
  cloudContext: state.cloudContext,
  schema: state.schema,
  organization: state.organization,
  table: state.table,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(actions, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(InviteUserModal);
