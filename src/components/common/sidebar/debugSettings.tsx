import React from 'react';
import {
  CogIcon,
  IconButton,
  KeyIcon,
  RefreshIcon,
  Tooltip,
} from 'evergreen-ui';
import { useAuth0 } from '@auth0/auth0-react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { actions } from '../../../state/actions';

type DebugProps = {
  expand: boolean;
  setExpand: (value: boolean) => void;
  sendAdminSecret: boolean;
  actions;
};

const DebugSettings = ({
  expand,
  setExpand,
  actions,
  sendAdminSecret,
}: DebugProps) => {
  const { getAccessTokenSilently, getIdTokenClaims } = useAuth0();

  const handleRefreshToken = async () => {
    await getAccessTokenSilently({ ignoreCache: true });
    const tokenClaims = await getIdTokenClaims();
    actions.setAccessToken(tokenClaims.__raw);
    actions.setTokenClaims(tokenClaims);
  };

  return (
    process.env.NODE_ENV === 'development' && (
      <div>
        {expand ? (
          <>
            <div className="sidebar-heading list-group-item mt-2">
              Debug Settings
            </div>
            <div
              className="list-group-item btn py-1 d-flex align-items-center"
              aria-hidden="true"
              onClick={() => {
                actions.setShow(true);
                actions.setType('token');
              }}>
              <KeyIcon />
              <span className="ml-2">Display Token</span>
            </div>
            <div
              className="list-group-item btn py-1 d-flex align-items-center"
              aria-hidden="true"
              onClick={handleRefreshToken}>
              <RefreshIcon />
              <span className="ml-2">Refresh Token</span>
            </div>
            <div
              className="list-group-item btn py-1 d-flex align-items-center"
              aria-hidden="true"
              onClick={() => actions.setSendAdminSecret(!sendAdminSecret)}>
              <input
                type="checkbox"
                checked={sendAdminSecret}
                onChange={e => actions.setSendAdminSecret(e.target.checked)}
              />
              <span className="ml-2">Send Admin Secret</span>
            </div>
          </>
        ) : (
          <div className="list-group-item p-0 d-flex align-items-center">
            <Tooltip content="All Settings">
              <IconButton
                size="large"
                icon={CogIcon}
                appearance="minimal"
                onClick={() => setExpand(true)}
              />
            </Tooltip>
          </div>
        )}
      </div>
    )
  );
};

const mapStateToProps = state => ({
  sendAdminSecret: state.sendAdminSecret,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(actions, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(DebugSettings);
