import React from 'react';
import { Button, ErrorIcon } from 'evergreen-ui';

type AuthErrorProps = {
  message: string;
  logout: any;
};

const AuthError = ({ message, logout }: AuthErrorProps) => {
  return (
    <div className="d-flex align-items-center" style={{ minHeight: '80vh' }}>
      <div className="container text-center w-50 rounded py-4">
        <ErrorIcon color="danger" size={40} marginTop={16} />
        <span
          className="font-weight-bold my-3 d-block"
          style={{ fontSize: '18px' }}>
          Something went wrong!
        </span>
        <i>{message}</i>
        <p className="my-2">
          Please email{' '}
          <a href={`mailto:${process.env.GATSBY_SUPPORT_MAIL}`}>
            {process.env.GATSBY_SUPPORT_MAIL}
          </a>{' '}
          for assistance.
        </p>
        <Button
          appearance="primary"
          onClick={() => logout({ returnTo: window.location.origin })}>
          Back to home
        </Button>
      </div>
    </div>
  );
};

export default AuthError;
