import React from 'react';
import { useManualQuery } from 'graphql-hooks';
import { USERS_SEARCH_PATTERN } from '../../graphql/queries/wb';
import AsyncSelect from 'react-select/async';
import { components } from 'react-select';
import { debounce } from 'lodash';

type UserSearchInputType = {
  data: any;
  setData: (value: any) => void;
};

const UserSearchInput = ({ data, setData }: UserSearchInputType) => {
  const [fetchUserSearchPattern] = useManualQuery(USERS_SEARCH_PATTERN);

  const mapOptionsToValues = options => {
    return options.map(option => ({
      value: option.email,
      label: option.firstName + ' ' + option.lastName,
      ...option,
    }));
  };

  const promiseOptions = debounce((inputValue, callback) => {
    if (!inputValue) {
      return callback([]);
    }
    fetchUserSearchPattern({
      variables: { searchPattern: inputValue + '*' },
    }).then(({ data }) =>
      callback(mapOptionsToValues(data.wbUsersBySearchPattern)),
    );
  }, 400);

  const CustomOption = props => {
    return (
      <components.Option {...props}>
        <React.Fragment>
          <div>
            {props.data.firstName} {props.data.lastName}
          </div>
          <small>{props.data.email}</small>
        </React.Fragment>
      </components.Option>
    );
  };

  return (
    <React.Fragment>
      <label htmlFor="search-user">Search by User E-mail or name</label>
      <AsyncSelect
        placeholder="Search"
        loadOptions={promiseOptions}
        onChange={({ value }) => setData({ ...data, user: value })}
        components={{ Option: CustomOption }}
      />
    </React.Fragment>
  );
};

export default UserSearchInput;
