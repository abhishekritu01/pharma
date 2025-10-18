"use client";

import React, { useState, useEffect } from 'react';
import Input from "@/app/components/common/Input";
import { Search } from "lucide-react";
import PaginationTable from "@/app/components/common/PaginationTable";
import { ExpiryReportData } from "@/app/types/ExpiryReportData";
import {
  getExpiredStockWithSupplier,
  getNextThreeMonthsStockWithSupplier
} from "@/app/services/ExpiryReportService";
import {
  format,
  startOfMonth,
  endOfMonth,
  isWithinInterval,
  addMonths,
  startOfYear,
  endOfYear
} from "date-fns";
import { FaArrowDown, FaArrowUp } from "react-icons/fa";
import DatePicker from "react-datepicker";
import Button from "@/app/components/common/Button";
import "react-datepicker/dist/react-datepicker.css";
import { CiCalendar } from "react-icons/ci";
import { toast } from "react-toastify";
import { BiExport } from 'react-icons/bi';
import { exportAsCSVService } from "@/app/services/ExportAsCSVService";
import Loader from "@/app/components/common/Loader";
// import Ellipse229 from "@/public/Ellipse229.svg";
import Image from "next/image";

const Page = () => {
  const [expiryReport, setExpiryReport] = useState<ExpiryReportData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<string>("thisMonth");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isCustomRangeApplied, setIsCustomRangeApplied] = useState(false);
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
          setDateFilter("thisMonth");
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
        setLoading(true);
        let response;

        if (dateFilter === "nearExpiry") {
          response = await getNextThreeMonthsStockWithSupplier();
        } else {
          response = await getExpiredStockWithSupplier();
        }
        const items: ExpiryReportData[] = Array.isArray(response)
          ? response
          : response?.data && Array.isArray(response.data)
            ? response.data
            : [];

        const reportsWithFormattedDates = items.map((item: ExpiryReportData) => {
          const expiryDate = new Date(item.expiryDate);
          expiryDate.setHours(0, 0, 0, 0);
          const today = new Date();
          today.setHours(0, 0, 0, 0);


          return {
            ...item,
            quantity: item.packageQuantity,
            formattedExpiryDate: format(expiryDate, "dd-MM-yyyy"),
            expiryDate: expiryDate,
          };
        });

        setExpiryReport(reportsWithFormattedDates);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching expiry report:", error);
        setError(
          error instanceof Error ? error.message : "An unknown error occurred"
        );
        toast.error("Failed to load expiry report data");
        setLoading(false);
      }
    };

    fetchExpiryReport();
  }, [dateFilter]);

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
          return a.itemName?.localeCompare(b.itemName || "") || 0;
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

    const currentYear = new Date().getFullYear();
    const yearStart = new Date(currentYear, 0, 1);
    const yearEnd = new Date(currentYear, 11, 31);

    switch (dateFilter) {
      case "thisMonth":
        const monthStart = startOfMonth(today);
        const monthEnd = endOfMonth(today);
        return data.filter((item) =>
          isWithinInterval(item.expiryDate, {
            start: monthStart,
            end: monthEnd,
          })
        );

      case "nearExpiry":
        const nextMonthStart = startOfMonth(addMonths(today, 1));
        const threeMonthsEnd = endOfMonth(addMonths(today, 3));
        return data.filter((item) =>
          isWithinInterval(item.expiryDate, {
            start: nextMonthStart,
            end: threeMonthsEnd,
          })
        );

      case "thisYear":
        return data.filter((item) =>
          isWithinInterval(item.expiryDate, {
            start: yearStart,
            end: yearEnd,
          })
        );

      case "expired":
        return data.filter((item) =>
          item.expiryDate < today &&
          isWithinInterval(item.expiryDate, {
            start: yearStart,
            end: yearEnd,
          })
        );

      case "custom":
        if (isCustomRangeApplied && startDate && endDate) {
          const customStart = new Date(Math.max(startDate.getTime(), yearStart.getTime()));
          const customEnd = new Date(Math.min(endDate.getTime(), yearEnd.getTime()));

          return data.filter((item) =>
            isWithinInterval(item.expiryDate, {
              start: customStart,
              end: customEnd,
            })
          );
        }
        return [];

      case "all":
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
      accessor: (row: ExpiryReportData) => (
        <div className="flex items-center gap-1">
          {row.expiryDate < new Date() && (
            <Image
              src="/Ellipse229.svg"
              alt="Expired"
              width={9}
              height={9}
              className="w-[9px] h-[9px]"
            />
          )}
          {row.formattedExpiryDate}
        </div>
      ),
    },
    {
      header: (
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => handleSort("packageQuantity")}
        >
          <span>Total Quantity</span>
          {sortConfig.key === "packageQuantity" ? (
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
          <span className="px-2 py-1 rounded-xl text-sm font-medium">
            {row.packageQuantity}
          </span>
        </div>
      ),
    },
  ];

  const filteredData = filterByDateRange(
    expiryReport.filter((item) => {
      const search = searchText.toLowerCase();
      return (
        (item.supplierName?.toLowerCase().includes(search) || "N/A".includes(search)) ||
        (item.itemName?.toLowerCase().includes(search) || "N/A".includes(search)) ||
        (item.formattedExpiryDate?.toLowerCase().includes(search) || "N/A".includes(search)) ||
        item.batchNo?.toLowerCase().includes(search)
      );
    })
  );

  const prepareExportData = () => {
    return getSortedData().map(item => ({
      "Item Name": item.itemName || "N/A",
      "Batch Number": item.batchNo,
      "Supplier Name": item.supplierName || "N/A",
      "Expiry Date": item.formattedExpiryDate || "N/A",
      "Total Quantity": item.packageQuantity
    }));
  };

  const handleExport = async () => {
    try {
      const dataToExport = prepareExportData();
      let filenameSuffix;
      const today = new Date();
      const currentYear = today.getFullYear();

      switch (dateFilter) {
        case "thisMonth":
          filenameSuffix = `for_${format(today, 'MM_yyyy')}`;
          break;
        case "nearExpiry":
          filenameSuffix = `next_three_months_${format(today, 'MM_yyyy')}`;
          break;
        case "thisYear":
          filenameSuffix = `this_year_${currentYear}`;
          break;
        case "expired":
          filenameSuffix = `expired_items_${currentYear}`;
          break;
        case "custom":
          if (startDate && endDate) {
            filenameSuffix = `_${format(startDate, 'dd_MM_yyyy')}_to_${format(endDate, 'dd_MM_yyyy')}`;
          } else {
            filenameSuffix = "custom_range";
          }
          break;
        default:
          filenameSuffix = format(today, 'dd_MM_yyyy');
      }

      await exportAsCSVService.exportData(
        dataToExport,
        'csv',
        {
          filename: `expiry_report_${filenameSuffix}`,
          headers: {
            "Item Name": "Item Name",
            "Batch Number": "Batch Number",
            "Supplier Name": "Supplier Name",
            "Expiry Date": "Expiry Date",
            "Total Quantity": "Total Quantity"
          },
          csv: {
            delimiter: ','
          }
        }
      );

      toast.success("CSV exported successfully!");
    } catch (error) {
      console.error("Export failed:", error);
      toast.error(error instanceof Error ? error.message : "Failed to export CSV");
    }
  };

  return (
    <main className="space-y-10">
      {loading && (
        <div className="flex justify-center items-center h-64">
          <Loader type="spinner" size="md" text="Loading ..." fullScreen={false} />
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
              Stock Expiry Report
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
                <Button
                  label="Export as CSV"
                  className="px-6 bg-darkPurple text-white hover:bg-darkPurple"
                  icon={<BiExport size={18} />}
                  onClick={handleExport}
                />
              </div>
            </div>
          </div>

          <div className="text-sm font-normal text-[#726C6C] flex space-x-7 cursor-pointer ml-3">
            {[
              { value: "thisMonth", label: "This Month" },
              { value: "nearExpiry", label: "Near Expiry" },
              { value: "thisYear", label: "This Year" },
              { value: "expired", label: "Expired Items" },
            ].map((filter) => (
              <div
                key={filter.value}
                onClick={() => {
                  const newFilter = filter.value;
                  setDateFilter(newFilter);
                  setShowDatePicker(false);
                  setIsCustomRangeApplied(false);
                  if (newFilter === "custom") {
                    setStartDate(null);
                    setEndDate(null);
                  }
                }}
                className={`hover:text-[#4B0082] transition-colors ${dateFilter === filter.value ? "text-[#4B0082]" : ""
                  }`}
              >
                {filter.label}
              </div>
            ))}

            <div className="relative">
              <div
                id="custom-date-button"
                onClick={() => {
                  setDateFilter("custom");
                  setShowDatePicker(!showDatePicker);
                  setIsCustomRangeApplied(false);
                }}
                className={`hover:text-[#4B0082] transition-colors flex items-center gap-1 ${dateFilter === "custom" && (startDate || endDate)
                  ? "text-[#4B0082]"
                  : ""
                  }`}
              >
                Custom Date Range
                <CiCalendar size={18} />
              </div>

              {showDatePicker && (
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
                          minDate={startOfYear(new Date())}
                          maxDate={endOfYear(new Date())}
                          className="w-full focus:outline-none text-gray-900 text-sm"
                          placeholderText="Select date"
                          dateFormat="MMM d, yy"
                        />
                        <div
                          className="w-5 h-5 text-gray-500 ml-2 cursor-pointer"
                          onClick={() => {
                            const datePickerInputs = document.querySelectorAll('.react-datepicker-wrapper input');
                            if (datePickerInputs[0]) {
                              (datePickerInputs[0] as HTMLElement).focus();
                            }
                          }}
                        >
                          <CiCalendar size={20} />
                        </div>
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
                          minDate={startDate || startOfYear(new Date())}
                          maxDate={endOfYear(new Date())}
                          className="w-full focus:outline-none text-gray-900 text-sm"
                          placeholderText="Select date"
                          dateFormat="MMM d, yy"
                        />
                        <div
                          className="w-5 h-5 text-gray-500 ml-2 cursor-pointer"
                          onClick={() => {
                            const datePickerInputs = document.querySelectorAll('.react-datepicker-wrapper input');
                            if (datePickerInputs[1]) {
                              (datePickerInputs[1] as HTMLElement).focus();
                            }
                          }}
                        >
                          <CiCalendar size={20} />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between pt-2">
                      <button
                        onClick={() => {
                          setStartDate(null);
                          setEndDate(null);
                          setIsCustomRangeApplied(false);
                          setShowDatePicker(false);
                          setDateFilter("thisMonth");
                        }}
                        className="px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          if (startDate && endDate) {
                            setIsCustomRangeApplied(true);
                            setShowDatePicker(false);
                          }
                        }}
                        disabled={!startDate || !endDate}
                        className={`px-3 py-1 text-sm rounded ${!startDate || !endDate
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-darkPurple text-white"
                          }`}
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <PaginationTable
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