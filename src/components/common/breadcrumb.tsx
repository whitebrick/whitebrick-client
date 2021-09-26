import React from 'react';
import { Link, navigate } from 'gatsby';
import {
  ChevronRightIcon,
  ChevronDownIcon,
  SelectMenu,
  Button,
  Pane,
  Text,
  DatabaseIcon,
  JoinTableIcon,
  ApplicationsIcon,
  IconButton,
} from 'evergreen-ui';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
  OrganizationItemType,
  SchemaItemType,
  TableItemType,
} from '../../types';
import { actions } from '../../state/actions';

type BreadcrumbPropsType = {
  schema: SchemaItemType;
  schemas: SchemaItemType[];
  table: TableItemType;
  tables: TableItemType[];
  organization: OrganizationItemType;
  organizations: OrganizationItemType[];
  tableLayout?: boolean;
  organizationLayout?: boolean;
};

const defaultProps = {
  tableLayout: false,
  organizationLayout: false,
};

const Breadcrumb = ({
  schema,
  schemas,
  table,
  tables,
  organization,
  organizations,
  tableLayout,
  organizationLayout,
}: BreadcrumbPropsType) => {
  const breadcrumbLabel = {
    borderTopRightRadius: '0px',
    borderBottomRightRadius: '0px',
  };

  const breadcrumbArrow = {
    borderTopLeftRadius: '0px',
    borderBottomLeftRadius: '0px',
    padding: '0px',
    width: '25px',
    minWidth: '25px',
  };

  // This function is used with sort() to alphabetically arrange the elements in an
  // object.
  const compare = (a, b) => {
    if (a.label < b.label) {
      return -1;
    }
    if (a.label > b.label) {
      return 1;
    }
    return 0;
  };

  // This function handles the user's wish to go to another table within the same schema
  // when prompted through the breadcrumb navigation in tableLayout.
  const changeTable = value => {
    navigate(
      schema.organizationOwnerName
        ? `/${schema.organizationOwnerName}/${schema.name}/${value}`
        : `/db/${schema.name}/${value}`,
    );
  };

  // This function handles the user's trigger to go to another schema when prompted
  // through the breadcrumb navigation in tableLayout.
  const changeSchema = value => {
    navigate(
      schema.organizationOwnerName
        ? `/${schema.organizationOwnerName}/${value}/`
        : `/db/${value}/`,
    );
  };

  // This function handles user's trigger to go to another organizato=ion when prompted
  // through the breadcrumb navigation in OrganizationLayout.
  const changeOrg = value => {
    navigate(`/${value}`);
  };

  return (
    <p>
      <Link to="/">Home</Link> <ChevronRightIcon />{' '}
      {organizationLayout && (
        <>
          <Button
            style={breadcrumbLabel}
            onClick={() => changeOrg(organization.name)}>
            {organization.label}
          </Button>
          <SelectMenu
            title="Organizations"
            onSelect={item => changeOrg(item.value)}
            options={organizations
              ?.sort(compare)
              ?.map(({ name, label }) => ({ label, value: name }))}
            closeOnSelect
            selected={organization.name}
            filterPlaceholder="Choose an organization"
            filterIcon={ApplicationsIcon}
            emptyView={
              <Pane
                height="100%"
                display="flex"
                alignItems="center"
                justifyContent="center">
                <Text size={300}>No options found</Text>
              </Pane>
            }>
            <IconButton icon={ChevronDownIcon} style={breadcrumbArrow} />
          </SelectMenu>
        </>
      )}
      {!organizationLayout && (
        <>
          <Button
            style={breadcrumbLabel}
            onClick={() => changeSchema(schema.name)}>
            {schema.label}
          </Button>
          <SelectMenu
            title="Databases"
            onSelect={item => changeSchema(item.value)}
            options={schemas.map(({ name, label }) => ({ label, value: name }))}
            closeOnSelect
            selected={schema.name}
            filterPlaceholder="Choose a database"
            filterIcon={DatabaseIcon}
            emptyView={
              <Pane
                height="100%"
                display="flex"
                alignItems="center"
                justifyContent="center">
                <Text size={300}>No options found</Text>
              </Pane>
            }>
            <IconButton icon={ChevronDownIcon} style={breadcrumbArrow} />
          </SelectMenu>
        </>
      )}
      {tableLayout && (
        <>
          <ChevronRightIcon />
          <Button
            style={breadcrumbLabel}
            onClick={() => changeTable(table.name)}>
            {table.label}
          </Button>
          <SelectMenu
            title="Tables"
            onSelect={item => changeTable(item.value)}
            options={tables
              ?.sort(compare)
              ?.map(({ name, label }) => ({ label, value: name }))}
            closeOnSelect
            selected={table.name}
            filterPlaceholder="Choose a table"
            filterIcon={JoinTableIcon}
            emptyView={
              <Pane
                height="100%"
                display="flex"
                alignItems="center"
                justifyContent="center">
                <Text size={300}>No options found</Text>
              </Pane>
            }>
            <IconButton icon={ChevronDownIcon} style={breadcrumbArrow} />
          </SelectMenu>
        </>
      )}
    </p>
  );
};

Breadcrumb.defaultProps = defaultProps;
const mapStateToProps = state => ({
  schema: state.schema,
  schemas: state.schemas,
  table: state.table,
  tables: state.tables,
  organization: state.organization,
  organizations: state.organizations,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(actions, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(Breadcrumb);
