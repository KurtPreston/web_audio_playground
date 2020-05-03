import {map} from 'lodash';
import React from 'react';

export function objectInfoTable<T extends object>(data: T): React.ReactElement<HTMLTableElement> {
  return (
    <table>
      <tbody>
        {map(data, (value, key) => (
          <tr>
            <td>{key}</td>
            <td>{value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
