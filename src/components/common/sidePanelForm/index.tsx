import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withAuthenticationRequired } from '@auth0/auth0-react';
import { actions } from '../../../state/actions';
import ViewForm from './view';
import Token from './token';
import OrganizationForm from './organization';
import DatabaseForm from './database';

type SidePanelFormPropsType = {
  type: string;
};

const SidePanelForm = ({ type }: SidePanelFormPropsType) => {
  const renderPanel = () => {
    if (type === 'token') return <Token />;
    if (type === 'view') return <ViewForm />;
    if (type === 'createOrganization' || type === 'editOrganization')
      return <OrganizationForm />;
    if (type === 'createDatabase' || type === 'editDatabase')
      return <DatabaseForm />;
    return null;
  };
  return renderPanel();
};

const mapStateToProps = state => ({
  type: state.type,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(actions, dispatch),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withAuthenticationRequired(SidePanelForm));
