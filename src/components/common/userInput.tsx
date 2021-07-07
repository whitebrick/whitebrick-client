import React, { useState } from 'react';
import { AsyncTypeahead } from 'react-bootstrap-typeahead';
import { useManualQuery } from 'graphql-hooks';
import { USERS_SEARCH_PATTERN } from '../../graphql/queries/wb';
import 'react-bootstrap-typeahead/css/Typeahead.css';

type UserSearchInputType = {
  data: any;
  setData: (value: any) => void;
};

const UserSearchInput = ({ data, setData }: UserSearchInputType) => {
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState([]);
  const [fetchUserSearchPattern] = useManualQuery(USERS_SEARCH_PATTERN);

  const handleSearch = async query => {
    setIsLoading(true);
    const { data } = await fetchUserSearchPattern({
      variables: { searchPattern: query + '*' },
    });
    setOptions(data?.wbUsersBySearchPattern);
    setIsLoading(false);
  };
  const filterBy = () => true;

  return (
    <AsyncTypeahead
      id="search-users"
      filterBy={filterBy}
      isLoading={isLoading}
      labelKey="email"
      onSearch={handleSearch}
      options={options}
      onChange={selected => setData({ ...data, user: selected })}
      placeholder="Search by User E-mail or name"
      renderMenuItemChildren={option => (
        <React.Fragment>
          <div>
            {option.firstName} {option.lastName}
          </div>
          <small>{option.email}</small>
        </React.Fragment>
      )}
    />
  );
};

export default UserSearchInput;
