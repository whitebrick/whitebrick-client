import * as React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'gatsby';

const Header = ({ siteTitle }) => (
  <header
    style={{
      background: `#fff`,
      borderBottom: `1px solid #dfe1eb`,
    }}
    className="text-center">
    <div
      style={{
        padding: `1rem`,
      }}>
      <h3 style={{ margin: 0 }}>
        <Link
          to="/"
          style={{
            color: `#1443b7`,
            textDecoration: `none`,
          }}>
          {siteTitle}
        </Link>
      </h3>
    </div>
  </header>
);

Header.propTypes = {
  siteTitle: PropTypes.string,
};

Header.defaultProps = {
  siteTitle: ``,
};

export default Header;
