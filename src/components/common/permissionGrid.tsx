import React, { useEffect, useState } from 'react';
import { FaCheck } from 'react-icons/fa';
import ReactTooltip from 'react-tooltip';

type PermissionGridType = {
  fetchData: any;
  label: string;
};

const PermissionGrid = ({ fetchData, label }: PermissionGridType) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData()
      .then(r => setData(r))
      .finally(() => setLoading(false));
  }, []);

  return (
    !loading && (
      <div className="table-responsive">
        <ReactTooltip />
        <table className="table">
          <thead>
            <tr>
              <th scope="col">Email</th>
              <th scope="col">Reader</th>
              <th scope="col">Editor</th>
              <th scope="col">Manager</th>
              <th scope="col">Administrator</th>
              {label === 'schema' && <th scope="col">Owner</th>}
            </tr>
          </thead>
          <tbody>
            {data.map(user => (
              <tr>
                <td>{user.userEmail}</td>
                <td className="text-center">
                  {user.role.split('_').pop() === `reader` && (
                    <p
                      data-tip={
                        user.roleImpliedFrom
                          ? `Implicitly Assigned from ${user.roleImpliedFrom}`
                          : 'Explicitly Assigned'
                      }>
                      <FaCheck className="text-success" />
                    </p>
                  )}
                </td>
                <td className="text-center">
                  {user.role.split('_').pop() === `editor` && (
                    <p
                      data-tip={
                        user.roleImpliedFrom
                          ? `Implicitly Assigned from ${user.roleImpliedFrom}`
                          : 'Explicitly Assigned'
                      }>
                      <FaCheck className="text-success" />
                    </p>
                  )}
                </td>
                <td className="text-center">
                  {user.role.split('_').pop() === `manager` && (
                    <p
                      data-tip={
                        user.roleImpliedFrom
                          ? `Implicitly Assigned from ${user.roleImpliedFrom}`
                          : 'Explicitly Assigned'
                      }>
                      <FaCheck className="text-success" />
                    </p>
                  )}
                </td>
                <td className="text-center">
                  {user.role.split('_').pop() === `administrator` && (
                    <p
                      data-tip={
                        user.roleImpliedFrom
                          ? `Implicitly Assigned from ${user.roleImpliedFrom}`
                          : 'Explicitly Assigned'
                      }>
                      <FaCheck className="text-success" />
                    </p>
                  )}
                </td>
                {label === 'schema' && (
                  <td className="text-center">
                    {user.role.split('_').pop() === `owner` && (
                      <p
                        data-tip={
                          user.roleImpliedFrom
                            ? `Implicitly Assigned from ${user.roleImpliedFrom}`
                            : 'Explicitly Assigned'
                        }>
                        <FaCheck className="text-success" />
                      </p>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  );
};

export default PermissionGrid;
