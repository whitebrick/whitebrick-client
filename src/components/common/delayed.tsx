import React, { useState, useEffect, useRef } from 'react';

type DelayedProps = {
  children: React.ReactNode;
  wait: number;
};

const Delayed = ({ children, wait }: DelayedProps) => {
  const [isShown, setIsShown] = useState(false);
  const isMountedRef = useRef(null);
  useEffect(() => {
    isMountedRef.current = true;
    setTimeout(() => {
      if (isMountedRef.current === true) {
        setIsShown(true);
      }
    }, wait);
    return function cleanup() {
      isMountedRef.current = false;
    };
  }, [wait]);

  return <div>{isShown && children}</div>;
};

export default Delayed;
