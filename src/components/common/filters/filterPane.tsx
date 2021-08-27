import React, { useRef, useEffect } from 'react';
import { Button, Pane, PlusIcon } from 'evergreen-ui';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { actions } from '../../../state/actions';
import FilterRow from './filterRow';
import { ColumnItemType } from '../../../types';

type FilterPanePropsType = {
  filters: any[];
  columns: ColumnItemType[];
  close: any;
  actions: any;
};

const FilterPane = ({
  filters,
  columns,
  close,
  actions,
}: FilterPanePropsType) => {
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) close();
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [close, ref]);

  return (
    <div ref={ref}>
      <Pane width={filters.length === 0 ? 350 : 550} padding={20}>
        {filters.map((filter, index) => (
          <FilterRow filter={filter} id={index} key={index.toString()} />
        ))}
        {filters.length === 0 ? (
          <div className="ml-2">
            <p className="font-weight-bold my-1">
              No filters applied to this view
            </p>
            <p className="text-small">Click below to add a filter</p>
          </div>
        ) : (
          <hr />
        )}
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
    </div>
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
