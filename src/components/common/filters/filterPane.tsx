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
    <Pane width={650} padding={20}>
      <h6>Filters</h6>
      <p className="text-small">Add a column below to filter view</p>
      {filters.length > 0 && <hr />}
      {filters.map((filter, index) => (
        <FilterRow filter={filter} id={index} key={index.toString()} />
      ))}
      <hr />
      <Button
        appearance="minimal"
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
