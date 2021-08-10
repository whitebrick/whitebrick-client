import React, { useEffect, useState } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withAuthenticationRequired } from '@auth0/auth0-react';
import { Card, Pane, TextInputField, Button, toaster } from 'evergreen-ui';
import { useManualQuery, useMutation } from 'graphql-hooks';
import Layout from '../components/layouts/layout';
import { actions } from '../state/actions';
import { UPDATE_USER_DETAILS_MUTATION } from '../graphql/mutations/wb';
import { USER_BY_EMAIL } from '../graphql/queries/wb';
import ResetPassword from '../utils/resetPassword';

type ProfileType = {
  user: any;
};

const Profile = ({ user }: ProfileType) => {
  const [fetchUserBasicData] = useManualQuery(USER_BY_EMAIL, {
    variables: {
      email: user.email,
    },
  });
  const [data, setData] = useState(null);
  const [updateBasicDetails] = useMutation(UPDATE_USER_DETAILS_MUTATION);

  useEffect(() => {
    const fetchData = async () => {
      const { loading, data, error } = await fetchUserBasicData();
      if (!loading && !error) setData(data?.wbUserByEmail);
    };
    fetchData();
  }, [fetchUserBasicData]);

  const onSave = async () => {
    delete data.email;
    const { loading, data: me, error } = await updateBasicDetails({
      variables: data,
    });
    if (!loading && !error) {
      toaster.success('Successfully updated your details!', {
        duration: 10,
      });
      setData(me?.wbUpdateMyProfile);
    }
  };

  const updatePassword = () => {
    const resetPassword = () => ResetPassword();
    resetPassword().finally(() => {
      toaster.success(
        'Please check your registered email to change your password!',
        {
          duration: 10,
        },
      );
    });
  };

  return (
    <Layout>
      <Pane padding={24} marginBottom={16}>
        <h3>Edit Profile</h3>
      </Pane>
      <Pane flex="1" overflowY="scroll" padding={16}>
        <div className="row m-0">
          <div className="col-md-4 p-2">
            <Card backgroundColor="white" elevation={0}>
              <div className="p-4">
                <h5>Email</h5>
                <div className="mt-3">
                  <TextInputField
                    hint="Note: Your email can't be editing/changed."
                    value={data?.email}
                    disabled
                  />
                </div>
              </div>
            </Card>
          </div>
          <div className="col-md-8 p-2">
            <Card backgroundColor="white" elevation={0}>
              <div className="p-4">
                <h5>Basic Details</h5>
                <div className="row mt-3">
                  <div className="col-md-6 col-sm-12">
                    <TextInputField
                      label="First Name"
                      value={data?.firstName}
                      onChange={e =>
                        setData({ ...data, firstName: e.target.value })
                      }
                    />
                  </div>
                  <div className="col-md-6 col-sm-12">
                    <TextInputField
                      label="Last Name"
                      value={data?.lastName}
                      onChange={e =>
                        setData({ ...data, lastName: e.target.value })
                      }
                    />
                  </div>
                </div>
                <Button appearance="primary" onClick={onSave}>
                  Save
                </Button>
              </div>
            </Card>
          </div>
          <div className="col-md-4 p-2">
            <Card backgroundColor="white" elevation={0}>
              <div className="p-4">
                <h5>Change Password</h5>
                <div className="pt-4">
                  <Button appearance="primary" onClick={updatePassword}>
                    Click here to reset your password
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </Pane>
    </Layout>
  );
};

const mapStateToProps = state => ({
  user: state.user,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(actions, dispatch),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withAuthenticationRequired(Profile));
