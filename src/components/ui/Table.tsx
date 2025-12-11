import React from 'react';

interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
}

export function Table<T extends Record<string, any>>({
  data,
  columns,
  onRowClick,
  emptyMessage = 'No data available',
}: TableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 text-sm font-medium">{emptyMessage}</p>
      </div>
    );
  }

  // Helper function to get a unique key for each row
  const getRowKey = (item: T, index: number): string => {
    // Try to use id first (most common)
    if ('id' in item && item.id != null) {
      return String(item.id);
    }
    // Try product_id for inventory items
    if ('product_id' in item && item.product_id != null) {
      return String(item.product_id);
    }
    // Fall back to index as last resort
    return `row-${index}`;
  };

  return (
    <div className="overflow-x-auto -mx-6 px-6">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column, index) => (
              <th
                key={`header-${column.key}-${index}`}
                className={`px-6 py-3.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider ${column.className || ''}`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item, index) => (
            <tr
              key={getRowKey(item, index)}
              onClick={() => onRowClick?.(item)}
              className={`transition-colors duration-150 ${
                onRowClick 
                  ? 'cursor-pointer hover:bg-gray-50 active:bg-gray-100' 
                  : ''
              }`}
            >
              {columns.map((column, colIndex) => (
                <td
                  key={`cell-${getRowKey(item, index)}-${column.key}-${colIndex}`}
                  className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${column.className || ''}`}
                >
                  {column.render
                    ? column.render(item)
                    : (item[column.key as keyof T] as React.ReactNode)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

