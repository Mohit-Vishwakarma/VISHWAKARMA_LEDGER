
import React from 'react';

export interface Column<T> {
  title: string;
  accessor: keyof T;
  render?: (item: T) => React.ReactNode;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
}

export function Table<T extends { transactionId?: string, orderId?: string; id?: string }>({ columns, data }: TableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            {columns.map((col) => (
              <th
                key={String(col.accessor)}
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                {col.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                No data available
              </td>
            </tr>
          ) : (
            data.map((item, index) => (
              <tr key={item.transactionId || (item.orderId ? `${item.orderId}-${index}`: item.id ? `${item.id}-${index}`: index)} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                {columns.map((col) => (
                  <td
                    key={`${String(col.accessor)}-${index}`}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300"
                  >
                    {col.render ? col.render(item) : (item[col.accessor] as React.ReactNode)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
