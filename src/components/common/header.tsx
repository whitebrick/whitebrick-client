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
} from 'evergreen-ui';

// @ts-ignore
import WhitebrickLogo from '../../images/whitebrick-logo.svg';

type HeaderPropsType = {
  setType: (value: string) => void;
  setShow: (value: boolean) => void;
  setFormData: (value: any) => void;
};

const Header = ({ setType, setShow, setFormData }: HeaderPropsType) => {
  const { user, logout } = useAuth0();

  return (
    <header className="bg-white nav-shadow fixed-top">
      <nav className="navbar navbar-light">
        <span className="navbar-brand mb-0 h1">
          <div
            style={{ cursor: 'pointer' }}
            aria-hidden="true"
            onClick={() => navigate('/')}>
            <span>
              <img src={WhitebrickLogo} alt="Logo" height="20vh" /> Whitebrick
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
                      setFormData({});
                      setType('table');
                      setShow(true);
                    }}>
                    New Table
                  </Menu.Item>
                  <Menu.Item
                    icon={DatabaseIcon}
                    onClick={() => {
                      setFormData({});
                      setType('database');
                      setShow(true);
                    }}>
                    New Database
                  </Menu.Item>
                  <Menu.Item
                    icon={ApplicationsIcon}
                    onClick={() => {
                      setFormData({});
                      setType('organization');
                      setShow(true);
                    }}>
                    New Organization
                  </Menu.Item>
                </Menu.Group>
              </Menu>
            }>
            <IconButton icon={PlusIcon} marginRight={10} appearance="minimal" />
          </Popover>
          <Popover
            position={Position.BOTTOM_RIGHT}
            content={
              <Menu>
                <Menu.Group>
                  <Menu.Item icon={SettingsIcon}>Settings</Menu.Item>
                </Menu.Group>
                <Menu.Divider />
                <Menu.Group>
                  <Menu.Item icon={LogOutIcon} onClick={() => logout()}>
                    Log out
                  </Menu.Item>
                </Menu.Group>
              </Menu>
            }>
            <Avatar
              src={user.picture}
              name={user.nickname}
              size={30}
            />
          </Popover>
        </div>
      </nav>
    </header>
  );
};

export default Header;
