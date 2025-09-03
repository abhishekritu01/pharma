import React, { useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

interface TableProps<T> {
  data: T[];
  columns: {
    header: React.ReactNode;
    accessor: keyof T | ((item: T, index: number) => React.ReactNode);
  }[];
  actions?: (item: T) => React.ReactNode;
  noDataMessage?: string;
}

/**
 * A reusable pagination table component
 * Displays tabular data with pagination controls
 * Supports custom column rendering and actions
 */
const PaginationTable = <T,>({
  data,
  columns,
  actions,
  noDataMessage = "No data available",
}: TableProps<T>) => {
  const pageSize = 10; // Number of items per page
  const [currentPage, setCurrentPage] = useState(1);

  // Calculate total number of pages based on data length and page size
  const totalPages = Math.ceil(data.length / pageSize);

  // Get the current page's data slice
  const currentData = data.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  /**
   * Handles page navigation
   * Validates page number before updating current page
   */
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="w-full">
      <table className="table-auto w-full text-sm">
        <thead className="h-14 bg-primaryPurple text-black font-bold">
          <tr>
            {columns.map((col, index) => (
              <th
                key={index}
                className={`p-2 text-left ${index === 0 ? "rounded-l-xl" : ""
                  } ${index === columns.length - 1 ? "rounded-r-xl" : ""}`}
              >
                {col.header}
              </th>
            ))}
            {actions && <th className="px-4 py-2">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {currentData.length > 0 ? (
            currentData.map((item, rowIndex) => (
              <tr
                key={rowIndex}
                className="h-14 even:bg-purple-100 odd:bg-white shadow-md rounded-xl overflow-hidden space-y-5 px-2"
              >
                {columns.map((col, colIndex) => (
                  <td
                    key={colIndex}
                    className={`p-2 text-left ${colIndex === 0 ? "rounded-l-xl" : ""
                      } ${colIndex === columns.length - 1 && !actions
                        ? "rounded-r-xl"
                        : ""
                      }`}
                  >
                    {typeof col.accessor === "function"
                      ? col.accessor(item, rowIndex)
                      : String(item[col.accessor])}
                  </td>
                ))}
                {actions && (
                  <td className="px-4 py-2 text-center rounded-r-xl">
                    {actions(item)}
                  </td>
                )}
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

      {/* Pagination Controls */}
      {data.length > pageSize && (
        <div className="flex justify-end items-center mt-2 w-full  py-1 space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`p-2 rounded-lg ${currentPage === 1
                ? "text-gray-400 cursor-not-allowed"
                : "text-black hover:bg-gray-100"
              }`}
          >
            <FaChevronLeft />
          </button>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-black">Page</span>
            <div className="w-10 h-9 flex items-center justify-center border border-gray-300 rounded-lg text-sm font-medium text-black">
              {currentPage}
            </div>
            <span className="text-sm text-black">of</span>
            <span className="text-sm font-medium text-black">{totalPages}</span>
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`p-2 rounded-lg ${currentPage === totalPages
                ? "text-gray-400 cursor-not-allowed"
                : "text-black hover:bg-gray-100"
              }`}
          >
            <FaChevronRight />
          </button>
        </div>
      )}
    </div>
  );
};

export default PaginationTable;