import React, { useEffect, useState } from 'react';
import { RadioGroup } from 'evergreen-ui';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { useMutation } from 'graphql-hooks';
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

type InviteUserModalType = {
  show: boolean;
  setShow: (value: boolean) => void;
  cloudContext: any;
  name: string;
  refetch: () => void;
  schema: SchemaItemType;
  organization: OrganizationItemType;
  table: TableItemType;
};

const InviteUserModal = ({
  show,
  setShow,
  cloudContext,
  name,
  refetch,
  organization,
  schema,
  table,
}: InviteUserModalType) => {
  const [data, setData] = useState({ user: {}, role: '' });
  const [options, setOptions] = useState([]);
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

  const onSave = async () => {
    if (name === 'schema') {
      await updateSchemaUserRole({
        variables: {
          schemaName: schema.name,
          roleName: data.role,
          userEmails: [data.user],
        },
      });
    } else if (name === 'table') {
      await updateTableUserRole({
        variables: {
          schemaName: schema.name,
          tableName: table.name,
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
    refetch();
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
