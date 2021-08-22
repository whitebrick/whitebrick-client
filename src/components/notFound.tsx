import React from 'react';
import { ErrorIcon } from 'evergreen-ui';

type NotFoundPropsType = {
  name: string;
};

const NotFound = ({ name }: NotFoundPropsType) => {
  return (
    <div className="d-flex align-items-center min-vh-100">
      <div
        className="container text-center w-50 rounded"
        style={{ boxShadow: '2px 4px 12px 2px rgba(0,0,0,0.2)' }}>
        <ErrorIcon color="danger" size={40} marginTop={16} />
        <span
          className="font-weight-bold my-3 d-block"
          style={{ fontSize: '18px' }}>
          Oh snap!
        </span>
        <div
          className="py-2 my-2 rounded"
          style={{ backgroundColor: '#F65656', color: 'white' }}>
          <h6>{name}</h6>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
