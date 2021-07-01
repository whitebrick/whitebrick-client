import React from 'react';
import { FaCheck } from 'react-icons/fa';

type PermissionGridType = {
  data: any[];
};

const PermissionGrid = ({ data }: PermissionGridType) => {
  return (
    <div className="table-responsive">
      <table className="table">
        <thead>
          <tr>
            <th scope="col">Email</th>
            <th scope="col">Reader</th>
            <th scope="col">Editor</th>
            <th scope="col">Manager</th>
            <th scope="col">Administrator</th>
          </tr>
        </thead>
        <tbody>
          {data.map(user => (
            <tr>
              <td>{user.userEmail}</td>
              <td className="text-center">
                {user.role === 'table_reader' && (
                  <FaCheck className="text-success" />
                )}
              </td>
              <td className="text-center">
                {user.role === 'table_editor' && (
                  <FaCheck className="text-success" />
                )}
              </td>
              <td className="text-center">
                {user.role === 'table_manager' && (
                  <FaCheck className="text-success" />
                )}
              </td>
              <td className="text-center">
                {user.role === 'table_administrator' && (
                  <FaCheck className="text-success" />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PermissionGrid;
