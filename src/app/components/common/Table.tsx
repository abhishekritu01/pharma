import React from "react";

interface TableProps<T> {
  data: T[]; // Array of data to be displayed
  columns: {
    header: React.ReactNode;
    accessor: keyof T | ((item: T, index: number) => React.ReactNode); // Field name or custom renderer
  }[];
  actions?: (item: T) => React.ReactNode; // Optional actions for each row
  noDataMessage?: string; // Message when there's no data
}

const Table = <T,>({
  data,
  columns,
  actions,
  noDataMessage = "No data available",
}: TableProps<T>) => {
  return (
    <div
      className={`${
        data.length > 10 ? "overflow-y-auto max-h-[560px]" : "overflow-visible"
      }`}
    >
      <table className="table-auto w-full text-sm">
        <thead className="h-14 bg-primaryPurple text-black font-bold sticky top-0 z-10">
          <tr>
            {columns.map((col, index) => (
              <th
                key={index}
                className={`p-2 text-left ${
                  index === 0 ? "rounded-l-xl" : "" // ✅ Round top-left corner
                } ${
                  index === columns.length - 1 ? "rounded-r-xl" : "" // ✅ Round top-right corner
                }`}
              >
                {col.header}
              </th>
            ))}
            {/* {actions && <th className="rounded-tr-xl rounded-br-xl px-4 py-2">Actions</th>} */}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((item, rowIndex) => (
              <tr
                key={rowIndex}
                className="h-14 even:bg-purple-100 odd:bg-white shadow-md rounded-xl overflow-hidden space-y-5 px-2"
              >
                {columns.map((col, colIndex) => (
                  <td
                    key={colIndex}
                    className={`p-2 text-left ${
                      colIndex === 0 ? "rounded-l-xl" : "" // ✅ Round left side of first column
                    } ${
                      colIndex === columns.length - 1 ? "rounded-r-xl" : "" // ✅ Round right side of last column
                    }`}
                  >
                    {typeof col.accessor === "function"
                      ? col.accessor(item, rowIndex)
                      : String(item[col.accessor])}
                  </td>
                ))}
                {/* {actions && (
                   <td
                   className={`px-3 py-3 text-center space-x-3 flex justify-center ${
                     rowIndex === 0 ? "rounded-t-xl" : "" // ✅ Ensure top-right corner is rounded for first row
                   } ${
                     rowIndex === data.length - 1 ? "rounded-bl-xl" : "" // ✅ Ensure bottom-right corner is rounded for last row
                   } rounded-r-xl`}
                 >
                   {actions(item)}
                 </td>
                )} */}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={columns.length + (actions ? 1 : 0)}
                className="text-center py-1 text-gray-500"
              >
                {noDataMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
