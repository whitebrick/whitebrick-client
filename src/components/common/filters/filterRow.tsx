import React from 'react';
import { CrossIcon, IconButton, Select, TextInput } from 'evergreen-ui';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { actions } from '../../../state/actions';
import { ColumnItemType } from '../../../types';

type FilterRowPropsType = {
  id: number;
  columns: ColumnItemType[];
  filter: any;
  filters: any[];
  actions: any;
};

const FilterRow = ({
  id,
  columns,
  filter,
  filters,
  actions,
}: FilterRowPropsType) => {
  const clauseOptions = [
    { value: '_where', label: 'WHERE' },
    { value: '_and', label: 'AND' },
    { value: '_or', label: 'OR' },
    { value: '_not', label: 'NOT' },
  ];

  const conditionOptions = [
    { value: '_eq', label: '[eq] equals' },
    { value: '_neq', label: '[neq] not equal' },
    { value: '_gt', label: '[gt] greater than' },
    { value: '_lt', label: '[lt] less than' },
    { value: '_gte', label: '[gte] greater than or equal' },
    { value: '_lte', label: '[lte]less than or equal' },
    { value: '_like', label: '[like] LIKE operator' },
    { value: '_ilike', label: '[ilike] ILIKE operator' },
    { value: '_is', label: '[is] checking for (null,true,false)' },
    { value: '_in', label: '[in] one of a list of values' },
  ];

  const removeFilter = () => {
    filters.splice(id, 1);
    actions.setFilters([...filters]);
  };

  const handleFilterChange = (filter, element, e) => {
    filters.splice(id, 1, { ...filter, [element]: e.target.value });
    actions.setFilters([...filters]);
  };

  return (
    <div className="py-2">
      <IconButton
        onClick={removeFilter}
        marginRight={10}
        appearance="minimal"
        icon={CrossIcon}
      />
      <Select
        width={100}
        marginRight={10}
        value={filter.clause}
        onChange={e => handleFilterChange(filter, 'clause', e)}>
        {clauseOptions.map(clause => (
          <option value={clause.value}>{clause.label}</option>
        ))}
      </Select>
      <Select
        marginRight={10}
        value={filter.column}
        onChange={e => handleFilterChange(filter, 'column', e)}>
        {columns.map(column => (
          <option value={column.name}>{column.label}</option>
        ))}
      </Select>
      <Select
        width={100}
        marginRight={10}
        value={filter.condition}
        onChange={e => handleFilterChange(filter, 'condition', e)}>
        {conditionOptions.map(condition => (
          <option value={condition.value}>{condition.label}</option>
        ))}
      </Select>
      <TextInput
        width={100}
        value={filter.filterText}
        onChange={e => handleFilterChange(filter, 'filterText', e)}
      />
    </div>
  );
};

const mapStateToProps = state => ({
  columns: state.columns,
  filters: state.filters,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(actions, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(FilterRow);
