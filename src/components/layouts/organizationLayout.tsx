import React, { useEffect, useState } from 'react';
import { EditIcon, IconButton, TrashIcon } from 'evergreen-ui';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withAuthenticationRequired } from '@auth0/auth0-react';
import { useManualQuery } from 'graphql-hooks';
import { actions } from '../../state/actions';
import Tabs from '../elements/tabs';
import OrganizationDatabasesList from '../dashboard/organizationDatabasesList';
import Members from '../common/members';
import DeleteModal from '../common/deleteModal';
import { checkPermission } from '../../utils/checkPermission';
import Loading from '../loading';
import { ORGANIZATION_QUERY } from '../../graphql/queries/wb';
import NotFound from '../notFound';
import Breadcrumb from '../common/breadcrumb';
import Seo from '../seo';

type OrganizationLayoutPropsType = {
  organization: any;
  params: any;
  cloudContext: any;
  actions: any;
};

const OrganizationLayout = ({
  organization,
  params,
  cloudContext,
  actions,
}: OrganizationLayoutPropsType) => {
  const [loading, setLoading] = useState(true);
  const [showDelete, setShowDelete] = useState(false);
  const [error, setError] = useState(null);
  const isOrgAdmin = checkPermission(
    'administer_organization',
    organization?.role?.name,
  );

  const [fetchOrganization] = useManualQuery(ORGANIZATION_QUERY, {
    variables: {
      name: params.organizationName,
    },
  });

  const getError = error => {
    if (
      error?.graphQLErrors[0].originalError.wbCode ===
      'WB_ORGANIZATION_NOT_FOUND'
    )
      return cloudContext.userMessages.WB_ORGANIZATION_URL_NOT_FOUND[0];
    if (error?.graphQLErrors[0].originalError.wbCode === 'WB_FORBIDDEN')
      return cloudContext.userMessages.WB_ORGANIZATION_URL_FORBIDDEN[0];
    return cloudContext.userMessages[
      error?.graphQLErrors[0].originalError.wbCode
    ][0];
  };

  useEffect(() => {
    const fetchData = async () => {
      const { loading, error, data } = await fetchOrganization();
      if (!loading) {
        if (error) setError(error);
        else {
          const org = data.wbMyOrganizationByName;
          if (org !== null) {
            org.users = [];
            org.users = data.wbOrganizationUsers;
            actions.setOrganization(org);
          }
        }
      }
    };
    if (params.organizationName) fetchData().finally(() => setLoading(false));
  }, [actions, fetchOrganization, params.organizationName]);

  if (loading) return <Loading />;
  if (error) return <NotFound name={getError(error)} />;
  return (
    <div className="my-3">
      <Seo title={`${organization.label} | Organization`} />
      <div style={{ padding: `1rem` }}>
        <Breadcrumb organizationLayout />
        <div className="d-flex mt-4 ml-1">
          <h3 className="w-50" aria-hidden style={{ cursor: 'pointer' }}>
            <span>
              {organization.label}
              {isOrgAdmin && (
                <span>
                  <IconButton
                    className="ml-1"
                    appearance="minimal"
                    icon={EditIcon}
                    onClick={() => {
                      actions.setFormData(organization);
                      actions.setShow(true);
                      actions.setType('editOrganization');
                    }}
                  />
                  <IconButton
                    appearance="minimal"
                    icon={TrashIcon}
                    onClick={() => setShowDelete(true)}
                  />
                  {showDelete && (
                    <DeleteModal
                      show={showDelete}
                      setShow={setShowDelete}
                      type="organization"
                      org={organization}
                    />
                  )}
                </span>
              )}
            </span>
          </h3>
        </div>
        <div className="mt-4">
          <Tabs
            items={[
              {
                title: 'Databases',
                element: (
                  <OrganizationDatabasesList
                    organization={organization}
                    renderTitle={false}
                  />
                ),
              },
              {
                title: 'Members',
                element: <Members name="organization" />,
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = state => ({
  organization: state.organization,
  cloudContext: state.cloudContext,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(actions, dispatch),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withAuthenticationRequired(OrganizationLayout));
