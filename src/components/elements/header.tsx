import * as React from 'react';
import { navigate } from 'gatsby';
import HeaderMenu from './headerMenu';
// @ts-ignore
import WhitebrickLogo from '../../images/whitebrick-logo-square.svg';

const Header = () => {
  return (
    <header className="bg-white nav-shadow fixed-top">
      <nav className="navbar navbar-light">
        <span className="navbar-brand mb-0">
          <div
            style={{ cursor: 'pointer' }}
            aria-hidden="true"
            onClick={() => navigate('/')}>
            <span className="logo">
              <img src={WhitebrickLogo} alt="Logo" height="30vh" /> whitebrick
            </span>
          </div>
        </span>
        <HeaderMenu />
      </nav>
    </header>
  );
};

export default Header;
