import React from 'react';
import { Dialog } from 'evergreen-ui';

type ModalType = {
  isShown: boolean;
  setIsShown: (value: boolean) => void;
  title: string;
  label?: string;
  onSave?: () => void;
  hasFooter?: boolean;
  width?: number;
  children: React.ReactNode;
};

const defaultProps = {
  label: null,
  onSave: null,
  hasFooter: true,
  width: 560,
};

const Modal = ({
  isShown,
  setIsShown,
  title,
  label,
  width = 560,
  hasFooter = true,
  onSave = null,
  children,
}: ModalType) => {
  return (
    <Dialog
      isShown={isShown}
      title={title}
      onCloseComplete={() => setIsShown(false)}
      confirmLabel={label}
      hasFooter={hasFooter}
      width={width}
      shouldCloseOnEscapePress
      onConfirm={onSave}>
      {children}
    </Dialog>
  );
};

Modal.defaultProps = defaultProps;
export default Modal;
