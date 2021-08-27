import React from 'react';
import { Button, Pane, PlusIcon } from 'evergreen-ui';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { actions } from '../../../state/actions';
import FilterRow from './filterRow';
import { ColumnItemType } from '../../../types';

type FilterPanePropsType = {
  filters: any[];
  columns: ColumnItemType[];
  actions: any;
};

const FilterPane = ({ filters, columns, actions }: FilterPanePropsType) => {
  return (
    <Pane width={filters.length === 0 ? 350 : 550} padding={20}>
      {filters.length === 0 && (
        <div className="ml-2">
          <p className="font-weight-bold my-1">
            No filters applied to this view
          </p>
          <p className="text-small">Click below to add a filter</p>
        </div>
      )}
      {filters.map((filter, index) => (
        <FilterRow filter={filter} id={index} key={index.toString()} />
      ))}
      {filters.length > 0 && <hr />}
      <Button
        marginLeft={10}
        appearance="primary"
        iconBefore={PlusIcon}
        onClick={() =>
          actions.setFilter({
            clause: '_where',
            column: columns[0].name,
            condition: '_eq',
            filterText: '',
          })
        }>
        Add Filter
      </Button>
    </Pane>
  );
};

const mapStateToProps = state => ({
  filters: state.filters,
  columns: state.columns,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(actions, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(FilterPane);
