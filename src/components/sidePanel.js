import React from 'react';
import Modal from 'react-modal';

const SidePanel = ({
  name,
  show,
  setShow,
  onSave,
  onEdit = null,
  type,
  children,
  renderSaveButton = true,
}) => {
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
      <div
        className="modal-footer fixed-bottom"
        style={{ left: 'auto!important', width: '450px!important' }}>
        <button onClick={() => setShow(false)} className="btn btn-danger m-2">
          Cancel
        </button>
        {renderSaveButton && (
          <button
            onClick={type !== 'edit' ? onSave : onEdit}
            className="btn btn-primary">
            Save
          </button>
        )}
      </div>
    </Modal>
  );
};

export default SidePanel;
