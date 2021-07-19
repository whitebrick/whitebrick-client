import React from 'react';

type NotFoundPropsType = {
  name: string;
};

const NotFound = ({ name }: NotFoundPropsType) => {
  return (
    <div className="d-flex align-items-center min-vh-100">
      <div className="container text-center">
        <h4>{name}</h4>
      </div>
    </div>
  );
};

export default NotFound;
