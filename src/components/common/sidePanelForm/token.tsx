import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withAuthenticationRequired } from '@auth0/auth0-react';
import { actions } from '../../../state/actions';
import SidePanel from '../../elements/sidePanel';

const Token = ({ show, accessToken, actions }) => {
  return (
    <SidePanel
      name="Access Token"
      show={show}
      setShow={actions.setShow}
      renderSaveButton={false}>
      <code
        className="w-100 p-4"
        aria-hidden="true"
        style={{ cursor: 'pointer' }}
        onClick={() => navigator.clipboard.writeText(`Bearer ${accessToken}`)}>
        Bearer {accessToken}
      </code>
    </SidePanel>
  );
};

const mapStateToProps = state => ({
  show: state.show,
  accessToken: state.accessToken,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(actions, dispatch),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withAuthenticationRequired(Token));
