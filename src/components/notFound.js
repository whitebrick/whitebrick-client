import React from 'react';

const NotFound = ({ name }) => {
  return (
    <div className="d-flex align-items-center min-vh-100">
      <div className="container text-center">
        <h3>{name} not found</h3>
      </div>
    </div>
  );
};

export default NotFound;
