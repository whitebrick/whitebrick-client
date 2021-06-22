import * as React from 'react';
import { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { navigate } from 'gatsby';
import { FaPlus } from 'react-icons/fa';

import WhitebrickLogo from '../images/whitebrick-logo.svg';

const Header = ({ setType, setShow, setFormData }) => {
  const { user, logout } = useAuth0();
  const [userShow, setUserShow] = useState(false);
  const menuClass = `dropdown-menu${userShow ? ' show' : ''}`;

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
          <div>
            <button
              className="btn btn-sm btn-light ml-2"
              onClick={() => {
                setUserShow(false);
                setFormData({});
                setType('');
                setShow(true);
              }}>
              <FaPlus size="14px" />
            </button>
          </div>
          <div
            className="dropdown avatar ml-2"
            onClick={() => {
              setUserShow(!userShow);
            }}
            aria-hidden="true">
            <img src={user.picture} alt={user.nickname} />
            <div className={menuClass}>
              <button className="dropdown-item" aria-hidden="true">
                Settings
              </button>
              <button
                className="dropdown-item"
                onClick={() => logout({ returnTo: window.location.origin })}
                aria-hidden="true">
                Log out
              </button>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
