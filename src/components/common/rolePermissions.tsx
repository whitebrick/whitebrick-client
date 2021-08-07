import React from 'react';
import Modal from './modal';
import { Table, TickCircleIcon, CrossIcon } from 'evergreen-ui';
import { isObjectEmpty } from '../../utils/objectEmpty';

type rolePermissionsType = {
  show: boolean;
  setShow: (value: boolean) => void;
  name: string;
  cloudContext: any;
};

const RolePermissions = ({
  show,
  setShow,
  name,
  cloudContext,
}: rolePermissionsType) => {
  const roles = !isObjectEmpty(cloudContext) && cloudContext.roles[name];

  const p = !isObjectEmpty(cloudContext) && cloudContext.policy;
  const policies = Object.keys(p).filter(policy =>
    policy.split('_').includes(name),
  );

  return (
    <Modal
      isShown={show}
      setIsShown={setShow}
      title={`Role Permissions`}
      width={1200}
      hasFooter={false}>
      <div className="pb-4 px-2">
        <Table>
          <Table.Head>
            <Table.TextHeaderCell flexBasis={250} flexShrink={0} flexGrow={0}>
              Access
            </Table.TextHeaderCell>
            {Object.keys(roles)
              .reverse()
              .map(role => (
                <Table.TextHeaderCell>
                  <div className="d-flex justify-content-center align-items-center">
                    {roles[role].label}
                  </div>
                </Table.TextHeaderCell>
              ))}
          </Table.Head>
          <Table.Body>
            {policies.map((policy, index) => (
              <Table.Row key={index}>
                <Table.TextCell flexBasis={250} flexShrink={0} flexGrow={0}>
                  {p[policy].description}
                </Table.TextCell>
                {Object.keys(roles)
                  .reverse()
                  .map(role => {
                    if (p[policy].permittedRoles.includes(role))
                      return (
                        <Table.TextCell>
                          <div className="d-flex justify-content-center align-items-center">
                            <TickCircleIcon color="success" />
                          </div>
                        </Table.TextCell>
                      );
                    else
                      return (
                        <Table.TextCell>
                          <div className="d-flex justify-content-center align-items-center">
                            <CrossIcon color="danger" />
                          </div>
                        </Table.TextCell>
                      );
                  })}
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>
    </Modal>
  );
};

export default RolePermissions;
