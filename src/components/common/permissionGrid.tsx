import React, { useEffect, useState } from 'react';
import { FaCheck } from 'react-icons/fa';

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
                  {user.role === `${label}_reader` && (
                    <FaCheck className="text-success" />
                  )}
                </td>
                <td className="text-center">
                  {user.role === `${label}_editor` && (
                    <FaCheck className="text-success" />
                  )}
                </td>
                <td className="text-center">
                  {user.role === `${label}_manager` && (
                    <FaCheck className="text-success" />
                  )}
                </td>
                <td className="text-center">
                  {user.role === `${label}_administrator` && (
                    <FaCheck className="text-success" />
                  )}
                </td>
                {label === 'schema' && (
                  <td className="text-center">
                    {user.role === `${label}_owner` && (
                      <FaCheck className="text-success" />
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
