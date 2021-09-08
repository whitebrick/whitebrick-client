import * as React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { navigate } from 'gatsby';
import {
  Popover,
  Menu,
  Position,
  IconButton,
  Avatar,
  LogOutIcon,
  SettingsIcon,
  PlusIcon,
  PanelTableIcon,
  DatabaseIcon,
  ApplicationsIcon,
  UserIcon,
} from 'evergreen-ui';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
// @ts-ignore
import WhitebrickLogo from '../../images/whitebrick-logo.svg';
import { actions } from '../../state/actions';
import { SchemaItemType } from '../../types';

type HeaderPropsType = {
  user: any;
  schema: SchemaItemType;
  actions: any;
};

const Header = ({ user, schema, actions }: HeaderPropsType) => {
  const { logout } = useAuth0();

  return (
    <header className="bg-white nav-shadow fixed-top">
      <nav className="navbar navbar-light">
        <span className="navbar-brand mb-0">
          <div
            style={{ cursor: 'pointer' }}
            aria-hidden="true"
            onClick={() => navigate('/')}>
            <span className="logo">
              <img src={WhitebrickLogo} alt="Logo" height="15vh" /> whitebrick
            </span>
          </div>
        </span>
        <div className="navbar-text d-flex">
          <Popover
            position={Position.BOTTOM_RIGHT}
            content={
              <Menu>
                <Menu.Group>
                  <Menu.Item
                    icon={PanelTableIcon}
                    onClick={() => {
                      actions.setFormData({ schema });
                      actions.setType('createTable');
                      actions.setShow(true);
                    }}>
                    New Table
                  </Menu.Item>
                  <Menu.Item
                    icon={DatabaseIcon}
                    onClick={() => {
                      actions.setFormData({});
                      actions.setType('createDatabase');
                      actions.setShow(true);
                    }}>
                    New Database
                  </Menu.Item>
                  <Menu.Item
                    icon={ApplicationsIcon}
                    onClick={() => {
                      actions.setFormData({});
                      actions.setType('createOrganization');
                      actions.setShow(true);
                    }}>
                    New Organization
                  </Menu.Item>
                </Menu.Group>
              </Menu>
            }>
            <IconButton
              icon={PlusIcon}
              marginRight={10}
              appearance="minimal"
              height={20}
            />
          </Popover>
          <Popover
            position={Position.BOTTOM_RIGHT}
            content={
              <Menu>
                <Menu.Group>
                  <Menu.Item
                    icon={UserIcon}
                    onClick={() => navigate('/profile')}>
                    Profile
                  </Menu.Item>
                </Menu.Group>
                <Menu.Group>
                  <Menu.Item icon={SettingsIcon}>Settings</Menu.Item>
                </Menu.Group>
                <Menu.Divider />
                <Menu.Group>
                  <Menu.Item
                    icon={LogOutIcon}
                    onClick={() =>
                      logout({ returnTo: window.location.origin })
                    }>
                    Log out
                  </Menu.Item>
                </Menu.Group>
              </Menu>
            }>
            <Avatar src={user.picture} name={user.nickname} size={20} />
          </Popover>
        </div>
      </nav>
    </header>
  );
};

const mapStateToProps = state => ({
  user: state.user,
  schema: state.schema,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(actions, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(Header);
