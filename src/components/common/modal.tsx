import React from 'react';
import { Dialog } from 'evergreen-ui';

type ModalType = {
  isShown: boolean;
  setIsShown: (value: boolean) => void;
  title: string;
  label: string;
  onSave: () => void;
  children: React.ReactNode;
};

const Modal = ({
  isShown,
  setIsShown,
  title,
  label,
  onSave,
  children,
}: ModalType) => {
  return (
    <Dialog
      isShown={isShown}
      title={title}
      onCloseComplete={() => setIsShown(false)}
      confirmLabel={label}
      onConfirm={onSave}>
      {children}
    </Dialog>
  );
};

export default Modal;
