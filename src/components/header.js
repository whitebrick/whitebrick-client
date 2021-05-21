import * as React from 'react';
import PropTypes from 'prop-types';
import { useAuth0 } from '@auth0/auth0-react';
import { useState } from 'react';

const Header = ({ siteTitle }) => {
  const { user, logout } = useAuth0();
  const [show, setShow] = useState(false);

  const menuClass = `dropdown-menu${show ? ' show' : ''}`;
  return (
    <header
      style={{
        background: `#fff`,
        borderBottom: `1px solid #dfe1eb`,
      }}
      className="text-center">
      <nav className="navbar">
        <span className="navbar-brand mb-0 h1">{siteTitle}</span>
        <span className="navbar-text">
          <div
            className="dropdown avatar"
            onClick={() => setShow(!show)}
            aria-hidden="true">
            <img
              onClick={() => setShow(!show)}
              aria-hidden="true"
              src={user.picture}
              alt={user.nickname}
            />
            <div className={menuClass}>
              <div className="p-4 text-center">
                <img
                  src={user.picture}
                  alt={user.nickname}
                  style={{ width: '50px', height: '50px' }}
                />
                <div className="mt-2">
                  <b>{user.name}</b>
                  <div style={{ color: '#757575', fontSize: '0.875rem' }}>
                    {user.email}
                  </div>
                </div>
              </div>
              <div className="dropdown-divider" />
              <button
                className="dropdown-item"
                onClick={() => logout({ returnTo: window.location.origin })}
                aria-hidden="true">
                Log out
              </button>
            </div>
          </div>
        </span>
      </nav>
    </header>
  );
};

Header.propTypes = {
  siteTitle: PropTypes.string,
};

Header.defaultProps = {
  siteTitle: ``,
};

export default Header;
