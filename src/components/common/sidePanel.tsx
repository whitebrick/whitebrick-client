import React from 'react';
import Modal from 'react-modal';

type SidePanelPropsType = {
  name: string;
  show: boolean;
  setShow: (value: boolean) => void;
  onSave?: () => void;
  children: React.ReactNode;
  renderSaveButton?: boolean;
};

const SidePanel = ({
  name,
  show,
  setShow,
  onSave,
  children,
  renderSaveButton = true,
}: SidePanelPropsType) => {
  const customStyles = {
    content: {
      top: 0,
      right: 0,
      left: 'auto',
      height: '100vh',
      padding: '1rem',
      width: '450px',
      overflowY: 'scroll',
      zIndex: 1030,
    },
  };

  return (
    <Modal
      onRequestClose={() => setShow(false)}
      isOpen={show}
      style={customStyles}
      ariaHideApp={false}>
      <div className="modal-header">
        <h4 className="text-center">{name}</h4>
      </div>
      <div className="modal-body">{children}</div>
      <div className="modal-footer fixed-bottom">
        <button onClick={() => setShow(false)} className="btn btn-danger m-2">
          Cancel
        </button>
        {renderSaveButton && (
          <button onClick={onSave} className="btn btn-primary">
            Save
          </button>
        )}
      </div>
    </Modal>
  );
};

export default SidePanel;
