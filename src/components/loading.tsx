import React from 'react';
import '../styles/loading.css'

const Loading = () => {
  return (
    <div className="d-flex align-items-center min-vh-100">
      <div className="container text-center">
        <div className="ripple">
          <div></div>
          <div></div>
        </div>
      </div>
    </div>
  );
};

export default Loading;
