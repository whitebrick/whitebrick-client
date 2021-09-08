import React from 'react';
import { ErrorIcon } from 'evergreen-ui';

type NotFoundPropsType = {
  name: string;
};

const NotFound = ({ name }: NotFoundPropsType) => {
  return (
    <div className="d-flex align-items-center" style={{ minHeight: '80vh' }}>
      <div className="container text-center w-50 rounded py-4">
        <ErrorIcon color="danger" size={40} marginTop={16} />
        <span
          className="font-weight-bold my-3 d-block"
          style={{ fontSize: '18px' }}>
          Oh snap!
        </span>
        <i>{name}</i>
      </div>
    </div>
  );
};

export default NotFound;
