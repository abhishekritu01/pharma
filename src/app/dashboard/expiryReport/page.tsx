"use client";

import React, { useState, useEffect } from 'react';
import Input from "@/app/components/common/Input";
import { Search } from "lucide-react";
import Table from "@/app/components/common/Table";
import { ExpiryReportData } from "@/app/types/ExpiryReportData";
import { getExpiredStockWithSupplier } from "@/app/services/ExpiryReportService";
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  isWithinInterval,
  isSameDay
} from "date-fns";
import { FaArrowDown, FaArrowUp } from "react-icons/fa";
import { FiDownload, FiPrinter } from "react-icons/fi";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { CiCalendar } from "react-icons/ci";
import { toast } from "react-toastify";

const Page = () => {
  const [expiryReport, setExpiryReport] = useState<ExpiryReportData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<string>("today");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof ExpiryReportData | null;
    direction: "asc" | "desc";
  }>({ key: "expiryDate", direction: "desc" });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const datePickerElement = document.getElementById("custom-date-picker");
      const datePickerButton = document.getElementById("custom-date-button");

      if (
        showDatePicker &&
        datePickerElement &&
        !datePickerElement.contains(event.target as Node) &&
        datePickerButton &&
        !datePickerButton.contains(event.target as Node)
      ) {
        setShowDatePicker(false);
        if (!startDate || !endDate) {
          setDateFilter("today");
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDatePicker, startDate, endDate]);

  useEffect(() => {
    const fetchExpiryReport = async () => {
      try {
        const response = await getExpiredStockWithSupplier();
        const items: ExpiryReportData[] = Array.isArray(response)
          ? response
          : response?.data && Array.isArray(response.data)
            ? response.data
            : [];

        if (!items.length) {
          throw new Error("No expired stock data found");
        }

        const reportsWithFormattedDates = items.map((item: ExpiryReportData) => {
          const expiryDate = new Date(item.expiryDate);
          expiryDate.setHours(0, 0, 0, 0);

          return {
            ...item,
            quantity: item.packageQuantity,
            formattedExpiryDate: format(expiryDate, "dd-MM-yyyy"),
            expiryDate: expiryDate
          };
        });

        setExpiryReport(reportsWithFormattedDates);
      } catch (error) {
        console.error("Error fetching expiry report:", error);
        setError(
          error instanceof Error ? error.message : "An unknown error occurred"
        );
        toast.error("Failed to load expiry report data");
      } finally {
        setLoading(false);
      }
    };

    fetchExpiryReport();
  }, []);

  useEffect(() => {
    if (dateFilter === "custom" && startDate && endDate) {
      setDateFilter("custom");
    }
  }, [startDate, endDate, dateFilter]);

  const handleSort = (key: keyof ExpiryReportData) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return {
          key,
          direction: prev.direction === "asc" ? "desc" : "asc",
        };
      }
      return { key, direction: "asc" };
    });
  };

  const getSortedData = () => {
    const sorted = [...filteredData];
    if (sortConfig.key) {
      sorted.sort((a, b) => {
        if (sortConfig.key === "expiryDate") {
          const aDate = a.expiryDate.getTime();
          const bDate = b.expiryDate.getTime();

          if (aDate !== bDate) {
            return sortConfig.direction === "asc"
              ? aDate - bDate
              : bDate - aDate;
          }
          return a.itemName.localeCompare(b.itemName);
        }

        const aValue = a[sortConfig.key!];
        const bValue = b[sortConfig.key!];

        if (typeof aValue === "string" && typeof bValue === "string") {
          return sortConfig.direction === "asc"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        if (typeof aValue === "number" && typeof bValue === "number") {
          return sortConfig.direction === "asc"
            ? aValue - bValue
            : bValue - aValue;
        }

        return 0;
      });
    }
    return sorted;
  };

  const filterByDateRange = (data: ExpiryReportData[]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (dateFilter) {
      case "today":
        return data.filter((item) =>
          isSameDay(item.expiryDate, today)
        );
      case "thisWeek":
        return data.filter((item) =>
          isWithinInterval(item.expiryDate, {
            start: startOfWeek(today),
            end: endOfWeek(today),
          })
        );
      case "thisMonth":
        return data.filter((item) =>
          isWithinInterval(item.expiryDate, {
            start: startOfMonth(today),
            end: endOfMonth(today),
          })
        );
      case "all":
        return data;
      case "custom":
        if (startDate && endDate) {
          return data.filter((item) =>
            isWithinInterval(item.expiryDate, {
              start: startDate,
              end: endDate,
            })
          );
        }
        return data;
      default:
        return data;
    }
  };

  const columns = [
    {
      header: (
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => handleSort("itemName")}
        >
          <span>Item Name</span>
          {sortConfig.key === "itemName" ? (
            sortConfig.direction === "asc" ? (
              <FaArrowUp />
            ) : (
              <FaArrowDown />
            )
          ) : (
            <FaArrowDown />
          )}
        </div>
      ),
      accessor: "itemName" as keyof ExpiryReportData,
    },
    {
      header: (
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => handleSort("batchNo")}
        >
          <span>Batch Number</span>
          {sortConfig.key === "batchNo" ? (
            sortConfig.direction === "asc" ? (
              <FaArrowUp />
            ) : (
              <FaArrowDown />
            )
          ) : (
            <FaArrowDown />
          )}
        </div>
      ),
      accessor: "batchNo" as keyof ExpiryReportData,
    },
    {
      header: (
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => handleSort("supplierName")}
        >
          <span>Supplier Name</span>
          {sortConfig.key === "supplierName" ? (
            sortConfig.direction === "asc" ? (
              <FaArrowUp />
            ) : (
              <FaArrowDown />
            )
          ) : (
            <FaArrowDown />
          )}
        </div>
      ),
      accessor: "supplierName" as keyof ExpiryReportData,
    },

    {
      header: (
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => handleSort("expiryDate")}
        >
          <span>Expiry Date</span>
          {sortConfig.key === "expiryDate" ? (
            sortConfig.direction === "asc" ? (
              <FaArrowUp />
            ) : (
              <FaArrowDown />
            )
          ) : (
            <FaArrowDown />
          )}
        </div>
      ),
      accessor: (row: ExpiryReportData) => row.formattedExpiryDate,
    },

    {
      header: (
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => handleSort("quantity")}
        >
          <span>Expired Quantity</span>
          {sortConfig.key === "quantity" ? (
            sortConfig.direction === "asc" ? (
              <FaArrowUp />
            ) : (
              <FaArrowDown />
            )
          ) : (
            <FaArrowDown />
          )}
        </div>
      ),
      accessor: (row: ExpiryReportData) => (
        <div className="flex items-center">
          <span className="inline-block w-2 h-2 rounded-full bg-danger"></span>
          <span className="px-2 py-1 rounded-xl text-sm font-medium">
            {row.quantity}
          </span>
        </div>
      ),
    },
  ];

  const filteredData = filterByDateRange(
    expiryReport.filter((item) => {
      const search = searchText.toLowerCase();
      return (
        item.supplierName?.toLowerCase().includes(search) ||
        item.itemName?.toLowerCase().includes(search) ||
        item.formattedExpiryDate?.toLowerCase().includes(search) ||
        item.batchNo?.toLowerCase().includes(search)
      );
    })
  );

  return (
    <main className="space-y-10">
      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <strong>Error: </strong> {error}
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="flex justify-between">
            <div className="justify-start text-darkPurple text-3xl font-medium leading-10">
              Expired Stock Report
            </div>
            <div>
              <div className="flex space-x-4">
                <div>
                  <Input
                    type="text"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder="Search Table..."
                    className="w-80 border-gray-300"
                    icon={<Search size={18} />}
                  />
                </div>
                <div className="flex h-[48px] px-[28px] py-[10px] justify-center items-center gap-[14px] rounded-[24px] bg-[#4B0082] text-white cursor-pointer hover:bg-[#4B0082]/90 transition-colors">
                  <FiDownload size={18} />
                  <span className="text-base font-medium">Export as CSV</span>
                </div>
                <div className="flex h-[48px] px-[28px] py-[10px] justify-center items-center gap-[6px] rounded-[24px] border border-[#9F9C9C] cursor-pointer hover:bg-gray-50 transition-colors">
                  <FiPrinter size={18} />
                  <span className="text-base font-medium">Print</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 bg-white p-4 rounded-lg shadow relative">
            {[
              { value: "today", label: "Today" },
              { value: "thisWeek", label: "This Week" },
              { value: "thisMonth", label: "This Month" },
              { value: "all", label: "All" },
              { value: "custom", label: "Custom Range" },
            ].map((filter) => (
              <div key={filter.value} className="relative">
                <button
                  onClick={() => {
                    const newFilter = filter.value;
                    setDateFilter(newFilter);
                    setShowDatePicker(newFilter === "custom");
                    if (newFilter === "custom") {
                      setStartDate(null);
                      setEndDate(null);
                    }
                  }}
                  className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-1 ${dateFilter === filter.value
                    ? "bg-purple-800 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                >
                  {filter.label}
                  {filter.value === "custom" && <CiCalendar size={18} />}
                </button>

                {dateFilter === "custom" &&
                  filter.value === "custom" &&
                  showDatePicker && (
                    <div
                      id="custom-date-picker"
                      className="absolute top-full left-0 mt-2 bg-white p-4 rounded-lg shadow-lg z-50 border border-gray-200 w-[240px]"
                    >
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">
                            From
                          </label>
                          <div className="flex items-center border rounded-md p-2">
                            <DatePicker
                              selected={startDate}
                              onChange={(date) => setStartDate(date)}
                              selectsStart
                              startDate={startDate}
                              endDate={endDate}
                              className="w-full focus:outline-none text-gray-900 text-sm"
                              placeholderText="Select date"
                              dateFormat="MMM d, yy"
                            />
                            <CiCalendar className="w-5 h-5 text-gray-500 ml-2" />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm text-gray-600 mb-1">
                            To
                          </label>
                          <div className="flex items-center border rounded-md p-2">
                            <DatePicker
                              selected={endDate}
                              onChange={(date) => setEndDate(date)}
                              selectsEnd
                              startDate={startDate}
                              endDate={endDate}
                              minDate={startDate || undefined}
                              className="w-full focus:outline-none text-gray-900 text-sm"
                              placeholderText="Select date"
                              dateFormat="MMM d, yy"
                            />
                            <CiCalendar className="w-5 h-5 text-gray-500 ml-2" />
                          </div>
                        </div>

                        <div className="flex justify-between pt-2">
                          <button
                            onClick={() => {
                              setStartDate(null);
                              setEndDate(null);
                              setShowDatePicker(false);
                              setDateFilter("today");
                            }}
                            className="px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => {
                              if (startDate && endDate) {
                                setShowDatePicker(false);
                              }
                            }}
                            disabled={!startDate || !endDate}
                            className={`px-3 py-1 text-sm rounded ${!startDate || !endDate
                              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                              : "bg-purple-800 text-white hover:bg-purple-700"
                              }`}
                          >
                            Apply
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
              </div>
            ))}
          </div>

          <Table
            data={getSortedData()}
            columns={columns}
            noDataMessage="No expired stock found"
          />
        </>
      )}
    </main>
  );
};

export default Page;