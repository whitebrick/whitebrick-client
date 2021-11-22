
import * as React from 'react';
import { navigate } from 'gatsby';

// gatsby-theme-whitebrick is the name of the published theme. We access the
// headerMenu component as followed
import HeaderMenu from 'gatsby-theme-whitebrick/src/components/elements/headerMenu';
// @ts-ignore
import CustomLogo from '../images/custom-logo.png';

export default function Header() {
  return (
    <header className="bg-white nav-shadow fixed-top">
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
            <div className="container-fluid">
                <a className="navbar-brand" href="/">
                  <img src={CustomLogo} alt="" height="45vh" className="d-inline-block align-text-top" />
                </a>
                <button
                className="navbar-toggler"
                type="button"
                data-bs-toggle="collapse"data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent"
                aria-expanded="false"
                aria-label="Toggle navigation">
                  <span className="navbar-toggler-icon"></span>
                </button>
                <div
                className="collapse navbar-collapse"
                id="navbarSupportedContent">
                <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                    <li className="nav-item">
                      <a className="nav-link" href="https://google.com" target="_blank">Link example</a>
                    </li>
                    <li className="nav-item dropdown">
                      <a className="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                        Dropdown example
                    </a>
                    <ul className="dropdown-menu" aria-labelledby="navbarDropdown">
                        <li><a className="dropdown-item" href="https://google.com" target="_blank">Dropdown Link 1</a></li>
                        <li><a className="dropdown-item" href="https://google.com" target="_blank">Dropdown Link 2</a></li>
                        <li><a className="dropdown-item" href="https://google.com" target="_blank">Dropdown link 3</a></li>
                    </ul>
                    </li>
                </ul>
                </div>
            </div>
            <HeaderMenu />
        </nav>
    </header>
  );
};
