import React from 'react';
import { useManualQuery } from 'graphql-hooks';
import { Text } from 'evergreen-ui';
import AsyncSelect from 'react-select/async';
import { components } from 'react-select';
import { debounce } from 'lodash';
import { USERS_SEARCH_PATTERN } from '../../graphql/queries/wb';

type UserSearchInputType = {
  data: any;
  setData: (value: any) => void;
};

const UserSearchInput = ({ data, setData }: UserSearchInputType) => {
  const [fetchUserSearchPattern] = useManualQuery(USERS_SEARCH_PATTERN);

  const customStyles = {
    menu: provided => ({
      ...provided,
      zIndex: 9000,
    }),
    option: styles => ({
      ...styles,
      zIndex: 9000,
    }),
  };

  const mapOptionsToValues = options => {
    return options.map(option => ({
      value: option.email,
      label: `${option.firstName} ${option.lastName}`,
      ...option,
    }));
  };

  // eslint-disable-next-line consistent-return
  const promiseOptions = debounce((inputValue, callback) => {
    if (!inputValue) {
      return callback([]);
    }
    fetchUserSearchPattern({
      variables: { searchPattern: `${inputValue}*` },
    }).then(({ data }) =>
      callback(mapOptionsToValues(data.wbUsersBySearchPattern)),
    );
  }, 400);

  const CustomOption = props => {
    const data = props;
    return (
      <components.Option {...props}>
        <>
          <div>
            {data.firstName} {data.lastName}
          </div>
          <small>{data.email}</small>
        </>
      </components.Option>
    );
  };

  return (
    <div style={{ zIndex: 100 }}>
      <Text color="muted" fontWeight={500}>
        Search by User E-mail or name
      </Text>
      <AsyncSelect
        styles={customStyles}
        placeholder="Search"
        loadOptions={promiseOptions}
        onChange={({ value }) => setData({ ...data, user: value })}
        components={{ Option: CustomOption }}
      />
    </div>
  );
};

export default UserSearchInput;
