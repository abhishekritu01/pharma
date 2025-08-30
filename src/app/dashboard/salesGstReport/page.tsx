"use client";

import React, { useState, useEffect } from 'react';
import PaginationTable from "@/app/components/common/PaginationTable";
import { exportAsCSVService } from "@/app/services/ExportAsCSVService";
import { BillingGstSummaryItem } from "@/app/types/BillingSummaryData";
import { getBillingGstSummary } from "@/app/services/BillingSummaryService";
import { format, isSameDay, isSameMonth, isSameYear } from "date-fns";
import { FaArrowDown, FaArrowUp } from "react-icons/fa";
import DatePicker from "react-datepicker";
import Button from "@/app/components/common/Button";
import "react-datepicker/dist/react-datepicker.css";
import { CiCalendar } from "react-icons/ci";
import { toast } from "react-toastify";
import { BiExport } from 'react-icons/bi';
import Loader from "@/app/components/common/Loader";

const Page = () => {
  const [gstReport, setGstReport] = useState<BillingGstSummaryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<string>("today");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof BillingGstSummaryItem;
    direction: "asc" | "desc";
  }>({ key: "billId1", direction: "desc" });

  const filterButtons = [
    { value: "today", label: "Today" },
    { value: "month", label: "This Month" },
    { value: "selectMonth", label: "Select Month" },
    { value: "selectDate", label: "Select Date" },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const datePickerElement = document.getElementById("custom-date-picker");
      const datePickerButton = document.getElementById("custom-date-button");
      const monthPickerElement = document.getElementById("custom-month-picker");
      const monthPickerButton = document.getElementById("custom-month-button");

      if (
        showPicker &&
        ((datePickerElement && !datePickerElement.contains(event.target as Node) && 
          datePickerButton && !datePickerButton.contains(event.target as Node)) ||
        (monthPickerElement && !monthPickerElement.contains(event.target as Node) && 
          monthPickerButton && !monthPickerButton.contains(event.target as Node)))
      ) {
        setShowPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showPicker]);

  useEffect(() => {
    const fetchGstReport = async () => {
      try {
        setLoading(true);
        let response: BillingGstSummaryItem[] = [];
        const today = new Date();

        if (dateFilter === "today") {
          response = await getBillingGstSummary({ date: today });
        } else if (dateFilter === "month") {
          response = await getBillingGstSummary({
            month: format(today, "yyyy-MM")
          });
        } else if (dateFilter === "selectMonth" && selectedMonth) {
          response = await getBillingGstSummary({
            month: format(selectedMonth, "yyyy-MM")
          });
        } else if (dateFilter === "selectDate" && selectedDate) {
          const adjustedDate = new Date(selectedDate);
          adjustedDate.setHours(23, 59, 59, 999);
          response = await getBillingGstSummary({
            date: adjustedDate
          });
        }

        const reportsWithFormattedDates = response.map((item) => ({
          ...item,
          formattedBillDate: format(new Date(item.billDate), "dd-MM-yyyy"),
          billDateObj: new Date(item.billDate)
        }));

        setGstReport(reportsWithFormattedDates);
      } catch (error) {
        console.error("Error fetching GST report:", error);
        setError(error instanceof Error ? error.message : "An unknown error occurred");
        toast.error("Failed to load GST report data");
      } finally {
        setLoading(false);
      }
    };

    fetchGstReport();
  }, [dateFilter, selectedDate, selectedMonth]);

  const handleSort = (key: keyof BillingGstSummaryItem) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc"
    }));
  };

  const getSortedData = () => {
    const sorted = [...gstReport];
    if (sortConfig.key) {
      sorted.sort((a, b) => {
        if (sortConfig.key === "billDate") {
          const aDate = new Date(a.billDate).getTime();
          const bDate = new Date(b.billDate).getTime();
          return sortConfig.direction === "asc" ? aDate - bDate : bDate - aDate;
        }

        if (sortConfig.key === "subTotal" ||
          sortConfig.key === "totalGst" ||
          sortConfig.key === "grandTotal") {
          return sortConfig.direction === "asc"
            ? a[sortConfig.key] - b[sortConfig.key]
            : b[sortConfig.key] - a[sortConfig.key];
        }

        return sortConfig.direction === "asc"
          ? String(a[sortConfig.key]).localeCompare(String(b[sortConfig.key]))
          : String(b[sortConfig.key]).localeCompare(String(a[sortConfig.key]));
      });
    }
    return sorted;
  };

  const columns = [
    {
      header: "S.No",
      accessor: (row: BillingGstSummaryItem, index: number) => index + 1,
    },
    {
      header: (
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => handleSort("billId1")}
        >
          <span>Bill No.</span>
          {sortConfig.key === "billId1" && (
            sortConfig.direction === "asc" ? <FaArrowUp /> : <FaArrowDown />
          )}
        </div>
      ),
      accessor: (row: BillingGstSummaryItem) => row.billId1,
    },
    {
      header: (
        <div className="flex items-center gap-2">
          <span>Bill Date</span>
        </div>
      ),
      accessor: (row: BillingGstSummaryItem) => row.formattedBillDate,
    },
    {
      header: (
        <div className="flex items-center gap-2">
          <span>Gross Amount</span>
        </div>
      ),
      accessor: (row: BillingGstSummaryItem) => `₹${row.subTotal.toFixed(2)}`,
    },
    {
      header: (
        <div className="flex items-center gap-2">
          <span>Net Amount</span>
        </div>
      ),
      accessor: (row: BillingGstSummaryItem) => `₹${row.grandTotal.toFixed(2)}`,
    },
    {
      header: (
        <div className="flex items-center gap-2">
          <span>GST Amount</span>
        </div>
      ),
      accessor: (row: BillingGstSummaryItem) => `₹${row.totalGst.toFixed(2)}`,
    },
  ];

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
          <div className="flex justify-between items-center">
            <div className="justify-start text-darkPurple text-3xl font-medium leading-10">
              Sales GST Report
            </div>
            <div className="flex space-x-4">
              <Button
                label="Export as CSV"
                className="px-6 bg-darkPurple text-white hover:bg-darkPurple"
                icon={<BiExport size={18} />}
                onClick={async () => {
                  try {
                    const dataToExport = getSortedData().map((item, index) => ({
                      "S.No": index + 1,
                      "Bill No.": item.billId1,
                      "Bill Date": item.formattedBillDate,
                      "Gross Amount": item.subTotal,
                      "Net Amount": item.grandTotal,
                      "GST Amount": item.totalGst
                    }));

                    const filenameSuffix = selectedDate
                      ? format(selectedDate, 'ddMMyyyy')
                      : selectedMonth
                        ? format(selectedMonth, 'MMyyyy')
                        : dateFilter === 'month'
                          ? format(new Date(), 'MMyyyy')
                          : format(new Date(), 'ddMMyyyy');

                    await exportAsCSVService.exportData(
                      dataToExport,
                      'csv',
                      {
                        filename: `Sales_GST_Report_${filenameSuffix}`,
                        headers: {
                          "S.No": "Serial No",
                          "Bill No.": "Bill Number",
                          "Bill Date": "Date",
                          "Gross Amount": "Gross Amount (Rs.)",
                          "Net Amount": "Net Amount (Rs.)",
                          "GST Amount": "GST Amount (Rs.)"
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
                }}
              />
            </div>
          </div>

          {/* Date Filters with new styling */}
          <div className="flex items-center gap-6">
            <div className="text-sm font-normal text-[#726C6C] flex space-x-7 cursor-pointer">
              {filterButtons.map((filter) => (
                <div key={filter.value} className="relative">
                  <div
                    id={filter.value === "selectDate" ? "custom-date-button" : 
                        filter.value === "selectMonth" ? "custom-month-button" : ""}
                    onClick={() => {
                      if (filter.value === "selectDate") {
                        setSelectedMonth(null);
                      } else if (filter.value === "selectMonth") {
                        setSelectedDate(null);
                      }
                      setDateFilter(filter.value);
                      if (filter.value === "selectDate" || filter.value === "selectMonth") {
                        setShowPicker(true);
                      } else {
                        setShowPicker(false);
                        setSelectedDate(null);
                        setSelectedMonth(null);
                      }
                    }}
                    className={`hover:text-[#4B0082] transition-colors flex items-center gap-1 ${
                      dateFilter === filter.value ? "text-[#4B0082]" : ""
                    }`}
                  >
                    {filter.label}
                    {(filter.value === "selectDate" || filter.value === "selectMonth") && (
                      <CiCalendar size={18} />
                    )}
                  </div>

                  {(filter.value === dateFilter && showPicker) && (
                    <div
                      id={filter.value === "selectDate" ? "custom-date-picker" : "custom-month-picker"}
                      className="absolute top-full left-0 mt-2 bg-white p-4 rounded-lg shadow-lg z-50 border border-gray-200"
                    >
                      {dateFilter === "selectDate" ? (
                        <DatePicker
                          selected={selectedDate}
                          onChange={(date) => {
                            setSelectedDate(date);
                            setShowPicker(false);
                          }}
                          inline
                          maxDate={new Date()}
                          calendarClassName="border-0"
                          dayClassName={(date) => {
                            if (selectedDate && isSameDay(date, selectedDate)) {
                              return "bg-darkPurple text-white rounded-full";
                            }
                            return "";
                          }}
                        />
                      ) : (
                        <DatePicker
                          selected={selectedMonth}
                          onChange={(date) => {
                            setSelectedMonth(date);
                            setShowPicker(false);
                          }}
                          inline
                          showMonthYearPicker
                          maxDate={new Date()}
                          calendarClassName="border-0"
                          monthClassName={(date) => {
                            if (selectedMonth &&
                              isSameMonth(date, selectedMonth) &&
                              isSameYear(date, selectedMonth)) {
                              return "bg-darkPurple text-white rounded";
                            }
                            return "";
                          }}
                        />
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {(selectedDate || selectedMonth) && (
              <div className={`
                flex items-center text-sm p-2 rounded-md bg-darkPurple text-white
              `}>
                {selectedDate ? (
                  <>
                    <span>Selected Date: </span>
                    <span className="ml-2 font-medium">
                      {format(selectedDate, "dd-MM-yyyy")}
                    </span>
                  </>
                ) : selectedMonth ? (
                  <>
                    <span>Selected Month: </span>
                    <span className="ml-2 font-medium">
                      {format(selectedMonth, "MMM yyyy")}
                    </span>
                  </>
                ) : null}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-500">Total Bill Amount</p>
              <p className="text-xl text-gray-800 mt-2">
                ₹{gstReport.reduce((sum, item) => sum + item.grandTotal, 0).toFixed(2)}
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-500">Total GST Amount</p>
              <p className="text-xl text-gray-800 mt-2">
                ₹{gstReport.reduce((sum, item) => sum + item.totalGst, 0).toFixed(2)}
              </p>
            </div>
          </div>

          <PaginationTable
            data={getSortedData()}
            columns={columns}
            noDataMessage="No GST data found"
          />
        </>
      )}
    </main>
  )
};

export default Page;