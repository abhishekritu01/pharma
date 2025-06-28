"use client";

import Input from "@/app/components/common/Input";
import { Search } from "lucide-react";
import React, { useEffect, useState } from "react";
import PurchaseEntry from "@/app/dashboard/entry/components/PurchaseEntry";
import { PurchaseEntryData } from "@/app/types/PurchaseEntry";
import Table from "@/app/components/common/Table";
import { getPurchase } from "@/app/services/PurchaseEntryService";
import { getSupplierById } from "@/app/services/SupplierService";
import { BsThreeDotsVertical } from "react-icons/bs";
import Link from "next/link";
import {
  format,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachQuarterOfInterval,
  getYear,
  getMonth,
  startOfQuarter,
  endOfQuarter,
} from "date-fns";
import { FaArrowDown, FaArrowUp } from "react-icons/fa";
import { FiPrinter } from "react-icons/fi";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { CiCalendar } from "react-icons/ci";
import { BiExport } from "react-icons/bi";
import { FiChevronDown } from "react-icons/fi";

const getFinancialYearQuarters = (year: number) => {
  const start = new Date(year, 3, 1); // April 1
  const end = new Date(year + 1, 2, 31); // March 31 next year
  return eachQuarterOfInterval({ start, end });
};

const getFinancialYearForDate = (date: Date) => {
  const year = getYear(date);
  const month = getMonth(date);
  return month >= 3 ? year : year - 1; // April (3) to March (2)
};

const Page = () => {
  const [showPurchasEntry, setShowPurchasEntry] = useState(false);
  const [purchaseEntryData, setPurchaseEntryData] = useState<PurchaseEntryData[]>([]);
  const [, setLoading] = useState<boolean>(true);
  const [, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<string>("thisMonth");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showFinancialYearDropdown, setShowFinancialYearDropdown] = useState(false);
  const [selectedFinancialYear, setSelectedFinancialYear] = useState<number>(getFinancialYearForDate(new Date()));
  const [selectedQuarter, setSelectedQuarter] = useState<number | null>(null);
  const [showQuarterDropdown, setShowQuarterDropdown] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>("paid");
  const [showPaymentStatusDropdown, setShowPaymentStatusDropdown] = useState(false);

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const datePickerElement = document.getElementById('custom-date-picker');
      const datePickerButton = document.getElementById('custom-date-button');
      const paymentStatusElement = document.getElementById('payment-status-dropdown');
      const paymentStatusButton = document.getElementById('payment-status-button');
      
      if (showDatePicker && 
          datePickerElement && 
          !datePickerElement.contains(event.target as Node) && 
          datePickerButton && 
          !datePickerButton.contains(event.target as Node)) {
        setShowDatePicker(false);
        if (!startDate || !endDate) {
          setDateFilter("thisMonth");
        }
      }

      if (showPaymentStatusDropdown && 
          paymentStatusElement && 
          !paymentStatusElement.contains(event.target as Node) && 
          paymentStatusButton && 
          !paymentStatusButton.contains(event.target as Node)) {
        setShowPaymentStatusDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDatePicker, showPaymentStatusDropdown, startDate, endDate]);

  // Update financial year when month filters change
  useEffect(() => {
    if (dateFilter === "thisMonth" || dateFilter === "lastMonth") {
      const today = new Date();
      const targetDate = dateFilter === "thisMonth" ? today : subMonths(today, 1);
      const fy = getFinancialYearForDate(targetDate);
      setSelectedFinancialYear(fy);
    }
  }, [dateFilter]);

  // Automatically show quarter dropdown after selecting financial year
  useEffect(() => {
    if (dateFilter === "financialYearQuarter" && showFinancialYearDropdown === false && selectedFinancialYear) {
      setShowQuarterDropdown(true);
    }
  }, [selectedFinancialYear, dateFilter, showFinancialYearDropdown]);

  // Reset to "This Month" if quarter selection is cancelled
  useEffect(() => {
    if (dateFilter === "financialYearQuarter" && selectedQuarter === null && !showQuarterDropdown) {
      setDateFilter("thisMonth");
    }
  }, [selectedQuarter, showQuarterDropdown, dateFilter]);

  const fetchSupplier = async (supplierId: string): Promise<string> => {
    try {
      const supplier = await getSupplierById(supplierId.trim());
      if (!supplier || !supplier.supplierName) {
        console.warn(`Supplier not found for ID: ${supplierId} in frontend`);
        return "Unknown Supplier";
      }
      return supplier.supplierName;
    } catch (error) {
      console.error(`Error fetching supplier for ID ${supplierId}:`, error);
      return "Unknown Supplier";
    }
  };

  useEffect(() => {
    const fetchPurchaseEntry = async () => {
      try {
        const response = await getPurchase();
        if (!response?.data || response.status !== "success") {
          throw new Error("Failed to fetch purchases");
        }

        const purchases: PurchaseEntryData[] = response.data;
        const purchasesWithSuppliers = await Promise.all(
          purchases.map(async (purchase) => {
            const supplierName = await fetchSupplier(purchase.supplierId);
            return { ...purchase, supplierName };
          })
        );

        setPurchaseEntryData(purchasesWithSuppliers.reverse());
      } catch (error) {
        console.error("Error fetching purchases:", error);
        setError(
          error instanceof Error ? error.message : "An unknown error occurred"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPurchaseEntry();
  }, []);

  const formatDate = (date: string | Date): string => {
    const parsedDate = typeof date === "string" ? new Date(date) : date;
    return format(parsedDate, "dd-MM-yyyy");
  };

  const [sortConfig, setSortConfig] = useState<{
    key: keyof PurchaseEntryData | null;
    direction: "asc" | "desc";
  }>({ key: null, direction: "asc" });

  const handleSort = (key: keyof PurchaseEntryData) => {
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
        const aValue = a[sortConfig.key!];
        const bValue = b[sortConfig.key!];

        // Special handling for date sorting
        if (sortConfig.key === "purchaseDate") {
          const aDate = new Date(aValue as string);
          const bDate = new Date(bValue as string);
          return sortConfig.direction === "asc" 
            ? aDate.getTime() - bDate.getTime() 
            : bDate.getTime() - aDate.getTime();
        }

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

  const filterByDateRange = (data: PurchaseEntryData[]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (dateFilter) {
      case "thisMonth":
        const thisMonthStart = startOfMonth(today);
        const thisMonthEnd = endOfMonth(today);
        thisMonthEnd.setHours(23, 59, 59, 999);
        return data.filter((item) => {
          const purchaseDate = new Date(item.purchaseDate);
          return purchaseDate >= thisMonthStart && purchaseDate <= thisMonthEnd;
        });
      
      case "lastMonth":
        const lastMonth = subMonths(today, 1);
        const lastMonthStart = startOfMonth(lastMonth);
        const lastMonthEnd = endOfMonth(lastMonth);
        lastMonthEnd.setHours(23, 59, 59, 999);
        return data.filter((item) => {
          const purchaseDate = new Date(item.purchaseDate);
          return purchaseDate >= lastMonthStart && purchaseDate <= lastMonthEnd;
        });
      
      case "financialYearQuarter":
        if (selectedQuarter !== null) {
          if (selectedQuarter === 4) { // Annual summary
            const financialYearStart = new Date(selectedFinancialYear, 3, 1);
            const financialYearEnd = new Date(selectedFinancialYear + 1, 2, 31);
            financialYearEnd.setHours(23, 59, 59, 999);
            return data.filter((item) => {
              const purchaseDate = new Date(item.purchaseDate);
              return purchaseDate >= financialYearStart && purchaseDate <= financialYearEnd;
            });
          } else {
            const quarters = getFinancialYearQuarters(selectedFinancialYear);
            if (quarters[selectedQuarter]) {
              const quarterStart = startOfQuarter(quarters[selectedQuarter]);
              const quarterEnd = endOfQuarter(quarters[selectedQuarter]);
              quarterEnd.setHours(23, 59, 59, 999);
              return data.filter((item) => {
                const purchaseDate = new Date(item.purchaseDate);
                return purchaseDate >= quarterStart && purchaseDate <= quarterEnd;
              });
            }
          }
        }
        return [];
      
      case "financialYear":
        const financialYearStart = new Date(selectedFinancialYear, 3, 1); 
        const financialYearEnd = new Date(selectedFinancialYear + 1, 2, 31);
        financialYearEnd.setHours(23, 59, 59, 999);
        return data.filter((item) => {
          const purchaseDate = new Date(item.purchaseDate);
          return purchaseDate >= financialYearStart && purchaseDate <= financialYearEnd;
        });
      
      case "custom":
        if (startDate && endDate) {
          const adjustedStart = new Date(startDate);
          const adjustedEnd = new Date(endDate);
          adjustedStart.setHours(0, 0, 0, 0);
          adjustedEnd.setHours(23, 59, 59, 999);
          return data.filter((item) => {
            const purchaseDate = new Date(item.purchaseDate);
            return purchaseDate >= adjustedStart && purchaseDate <= adjustedEnd;
          });
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
          onClick={() => handleSort("purchaseDate")}
        >
          <span>Purchase Date</span>
          {sortConfig.key === "purchaseDate" ? (
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
      accessor: (row: PurchaseEntryData) => formatDate(row.purchaseDate),
    },
    {
      header: "Bill No",
      accessor: "purchaseBillNo" as keyof PurchaseEntryData,
    },
    {
      header: "Gross Amount",
      accessor: "supplierName" as keyof PurchaseEntryData,
    },
    {
      header: "CGST In Rs.",
      accessor: "supplierName" as keyof PurchaseEntryData,
    },
    {
      header: "SGST In Rs.",
      accessor: "supplierName" as keyof PurchaseEntryData,
    },
    {
      header: "Net Amount",
      accessor: "grandTotal" as keyof PurchaseEntryData,
    },
    {
      header: "Payment Status",
      accessor: (row: PurchaseEntryData) => {
        const isPending = row.paymentStatus?.toLowerCase() === "pending";
        const bgClass = isPending ? "bg-warning" : "bg-green";
        const textClass = isPending ? "text-warning" : "text-green";

        return (
          <span
            className={`px-2 py-1 rounded-xl text-sm font-medium ${bgClass} ${textClass}`}
          >
            {row.paymentStatus}
          </span>
        );
      },
    },
    {
      header: <BsThreeDotsVertical size={18} />,
      accessor: (row: PurchaseEntryData) => (
        <div className="relative group">
          <button className="p-2 rounded-full hover:bg-gray-200 cursor-pointer">
            <BsThreeDotsVertical size={18} />
          </button>
          <div className="absolute right-0 mt-2 w-18 bg-white shadow-xl rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
            <Link
              href={`/dashboard/orderSummary?id=${row.invId}`}
              className="block w-full px-4 py-2 text-left text-gray-700 cursor-pointer hover:bg-purple-950 hover:text-white hover:rounded-lg"
            >
              View
            </Link>
          </div>
        </div>
      ),
    },
  ];

  const filteredData = filterByDateRange(
    purchaseEntryData.filter((item) => {
      const search = searchText.toLowerCase();
      const purchaseDateFormatted = format(
        new Date(item.purchaseDate),
        "dd-MM-yyyy"
      );

      // Payment status filter
      const paymentStatusMatch = 
        paymentStatusFilter === "all" ||
        (paymentStatusFilter === "paid" && item.paymentStatus?.toLowerCase() === "paid") ||
        (paymentStatusFilter === "pending" && item.paymentStatus?.toLowerCase() === "pending");

      return (
        paymentStatusMatch &&
        (item.grnNo?.toLowerCase().includes(search) ||
        item.supplierName?.toLowerCase().includes(search) ||
        purchaseDateFormatted.toLowerCase().includes(search) ||
        item.purchaseBillNo?.toLowerCase().includes(search) ||
        item.grandTotal?.toString().toLowerCase().includes(search) ||
        item.paymentStatus?.toString().toLowerCase().includes(search) ||
        item.goodStatus?.toString().toLowerCase().includes(search))
      );
    })
  );

  // Always show the latest 5 financial years
  const financialYears = Array.from({ length: 5 }, (_, i) => {
    const currentFY = getFinancialYearForDate(new Date());
    return currentFY - i;
  });

  const quarterNames = [
    "1st Quarter (Apr-Jun)",
    "2nd Quarter (Jul-Sep)", 
    "3rd Quarter (Oct-Dec)",
    "4th Quarter (Jan-Mar)",
    "Annual Summary"
  ];

  return (
    <>
      {!showPurchasEntry && (
        <main className="space-y-10">
          <div className="flex justify-between">
            <div className="justify-start text-darkPurple text-3xl font-medium leading-10">
              Purchase GST Summary
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
                  <BiExport size={18} />
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
              { value: "thisMonth", label: "This Month" },
              { value: "lastMonth", label: "Last Month" },
            ].map((filter) => (
              <button
                key={filter.value}
                onClick={() => {
                  setDateFilter(filter.value);
                  setSelectedQuarter(null);
                  setShowQuarterDropdown(false);
                  setShowFinancialYearDropdown(false);
                  setShowDatePicker(false);
                }}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  dateFilter === filter.value && !selectedQuarter
                    ? "bg-purple-800 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {filter.label}
              </button>
            ))}

            {/* Financial Year Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setDateFilter("financialYear");
                  setShowFinancialYearDropdown(!showFinancialYearDropdown);
                  setShowQuarterDropdown(false);
                  setShowDatePicker(false);
                }}
                className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-1 ${
                  dateFilter === "financialYear"
                    ? "bg-purple-800 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                FY {selectedFinancialYear}-{selectedFinancialYear + 1}
                <FiChevronDown size={16} />
              </button>

              {showFinancialYearDropdown && (
                <div className="absolute top-full left-0 mt-1 bg-white rounded-md shadow-lg z-50 w-40">
                  {financialYears.map((year) => (
                    <div
                      key={year}
                      className={`px-3 py-2 hover:bg-gray-100 cursor-pointer ${
                        year === selectedFinancialYear && dateFilter === "financialYear"
                          ? "bg-purple-100"
                          : ""
                      }`}
                      onClick={() => {
                        setSelectedFinancialYear(year);
                        setDateFilter("financialYear");
                        setShowFinancialYearDropdown(false);
                      }}
                    >
                      {year}-{year + 1}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quarter Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setDateFilter("financialYearQuarter");
                  setShowQuarterDropdown(!showQuarterDropdown);
                  setShowFinancialYearDropdown(false);
                  setShowDatePicker(false);
                }}
                className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-1 ${
                  dateFilter === "financialYearQuarter" && selectedQuarter !== null
                    ? "bg-purple-800 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {selectedQuarter !== null 
                  ? selectedQuarter === 4 
                    ? `FY ${selectedFinancialYear}-${selectedFinancialYear + 1}`
                    : `Q${selectedQuarter + 1} ${selectedFinancialYear}-${selectedFinancialYear + 1}`
                  : "Select Quarter"}
                <FiChevronDown size={16} />
              </button>

              {showQuarterDropdown && (
                <div className="absolute top-full left-0 mt-1 bg-white rounded-md shadow-lg z-50 w-64">
                  <div className="p-2 border-b">
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowFinancialYearDropdown(!showFinancialYearDropdown);
                          setShowQuarterDropdown(false);
                        }}
                        className="w-full text-left px-3 py-2 bg-gray-100 rounded flex justify-between items-center"
                      >
                        {selectedFinancialYear}-{selectedFinancialYear + 1}
                        <FiChevronDown size={16} />
                      </button>
                      
                      {showFinancialYearDropdown && (
                        <div className="absolute top-full left-0 mt-1 bg-white rounded-md shadow-lg z-50 w-full">
                          {financialYears.map((year) => (
                            <div
                              key={year}
                              className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedFinancialYear(year);
                                setShowFinancialYearDropdown(false);
                                setShowQuarterDropdown(true);
                              }}
                            >
                              {year}-{year + 1}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {quarterNames.map((name, index) => (
                      <div
                        key={index}
                        className={`px-3 py-2 hover:bg-gray-100 cursor-pointer ${
                          selectedQuarter === index && dateFilter === "financialYearQuarter"
                            ? "bg-purple-100"
                            : ""
                        }`}
                        onClick={() => {
                          setSelectedQuarter(index);
                          setDateFilter("financialYearQuarter");
                          setShowQuarterDropdown(false);
                        }}
                      >
                        {name}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Custom Date Range */}
            <div className="relative">
              <button
                id="custom-date-button"
                onClick={() => {
                  setDateFilter("custom");
                  setShowDatePicker(!showDatePicker);
                  setSelectedQuarter(null);
                  setShowQuarterDropdown(false);
                  setShowFinancialYearDropdown(false);
                }}
                className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-1 ${
                  dateFilter === "custom" && (startDate || endDate)
                    ? "bg-purple-800 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Custom Range
                <CiCalendar size={18} />
              </button>

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
                          maxDate={new Date()}
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
                          maxDate={new Date()}
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
                          setDateFilter("thisMonth");
                        }}
                        className="px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          if (startDate && endDate) {
                            setDateFilter("custom");
                            setShowDatePicker(false);
                          }
                        }}
                        disabled={!startDate || !endDate}
                        className={`px-3 py-1 text-sm rounded ${
                          !startDate || !endDate
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

            {/* Payment Status Dropdown - Moved to the right corner */}
            <div className="relative ml-auto">
              <button
                id="payment-status-button"
                onClick={() => setShowPaymentStatusDropdown(!showPaymentStatusDropdown)}
                className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-1 ${
                  paymentStatusFilter === "paid" 
                    ? "bg-green-800 text-white"
                    : paymentStatusFilter === "pending"
                    ? "bg-orange-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {paymentStatusFilter === "paid" ? "Already Paid" : paymentStatusFilter === "pending" ? "Pending Payment" : "All"}
                <FiChevronDown size={16} />
              </button>

              {showPaymentStatusDropdown && (
                <div id="payment-status-dropdown" className="absolute top-full right-0 mt-1 bg-white rounded-md shadow-lg z-50 w-32">
                  <div
                    className={`px-3 py-2 hover:bg-gray-100 cursor-pointer ${
                      paymentStatusFilter === "paid" ? "bg-purple-100" : ""
                    }`}
                    onClick={() => {
                      setPaymentStatusFilter("paid");
                      setShowPaymentStatusDropdown(false);
                    }}
                  >
                    Paid
                  </div>
                  <div
                    className={`px-3 py-2 hover:bg-gray-100 cursor-pointer ${
                      paymentStatusFilter === "pending" ? "bg-purple-100" : ""
                    }`}
                    onClick={() => {
                      setPaymentStatusFilter("pending");
                      setShowPaymentStatusDropdown(false);
                    }}
                  >
                    Pending
                  </div>
                  <div
                    className={`px-3 py-2 hover:bg-gray-100 cursor-pointer ${
                      paymentStatusFilter === "all" ? "bg-purple-100" : ""
                    }`}
                    onClick={() => {
                      setPaymentStatusFilter("all");
                      setShowPaymentStatusDropdown(false);
                    }}
                  >
                    All
                  </div>
                </div>
              )}
            </div>
          </div>

          <Table
            data={getSortedData()}
            columns={columns}
            noDataMessage="No purchase records found"
          />
        </main>
      )}

      {showPurchasEntry && (
        <PurchaseEntry setShowPurchaseEntry={setShowPurchasEntry} />
      )}
    </>
  );
};

export default Page;








// "use client";

// import Input from "@/app/components/common/Input";
// import { Search } from "lucide-react";
// import React, { useEffect, useState } from "react";
// import PurchaseEntry from "@/app/dashboard/entry/components/PurchaseEntry";
// import { PurchaseEntryData } from "@/app/types/PurchaseEntry";
// import Table from "@/app/components/common/Table";
// import { getPurchase } from "@/app/services/PurchaseEntryService";
// import { getSupplierById } from "@/app/services/SupplierService";
// import { BsThreeDotsVertical } from "react-icons/bs";
// import Link from "next/link";
// import {
//   format,
//   subMonths,
//   startOfMonth,
//   endOfMonth,
//   eachQuarterOfInterval,
//   getYear,
//   getMonth,
//   startOfQuarter,
//   endOfQuarter,
// } from "date-fns";
// import { FaArrowDown, FaArrowUp } from "react-icons/fa";
// import { FiPrinter } from "react-icons/fi";
// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";
// import { CiCalendar } from "react-icons/ci";
// import { BiExport } from "react-icons/bi";
// import { FiChevronDown } from "react-icons/fi";

// const getFinancialYearQuarters = (year: number) => {
//   const start = new Date(year, 3, 1); // April 1
//   const end = new Date(year + 1, 2, 31); // March 31 next year
//   return eachQuarterOfInterval({ start, end });
// };

// const getFinancialYearForDate = (date: Date) => {
//   const year = getYear(date);
//   const month = getMonth(date);
//   return month >= 3 ? year : year - 1; // April (3) to March (2)
// };

// const Page = () => {
//   const [showPurchasEntry, setShowPurchasEntry] = useState(false);
//   const [purchaseEntryData, setPurchaseEntryData] = useState<PurchaseEntryData[]>([]);
//   const [, setLoading] = useState<boolean>(true);
//   const [, setError] = useState<string | null>(null);
//   const [searchText, setSearchText] = useState<string>("");
//   const [dateFilter, setDateFilter] = useState<string>("thisMonth");
//   const [startDate, setStartDate] = useState<Date | null>(null);
//   const [endDate, setEndDate] = useState<Date | null>(null);
//   const [showFinancialYearDropdown, setShowFinancialYearDropdown] = useState(false);
//   const [selectedFinancialYear, setSelectedFinancialYear] = useState<number>(getFinancialYearForDate(new Date()));
//   const [selectedQuarter, setSelectedQuarter] = useState<number | null>(null);
//   const [showQuarterDropdown, setShowQuarterDropdown] = useState(false);
//   const [showDatePicker, setShowDatePicker] = useState(false);

//   // Handle click outside to close date picker
//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       const datePickerElement = document.getElementById('custom-date-picker');
//       const datePickerButton = document.getElementById('custom-date-button');
      
//       if (showDatePicker && 
//           datePickerElement && 
//           !datePickerElement.contains(event.target as Node) && 
//           datePickerButton && 
//           !datePickerButton.contains(event.target as Node)) {
//         setShowDatePicker(false);
//         if (!startDate || !endDate) {
//           setDateFilter("thisMonth");
//         }
//       }
//     };

//     document.addEventListener('mousedown', handleClickOutside);
//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside);
//     };
//   }, [showDatePicker, startDate, endDate]);

//   // Update financial year when month filters change
//   useEffect(() => {
//     if (dateFilter === "thisMonth" || dateFilter === "lastMonth") {
//       const today = new Date();
//       const targetDate = dateFilter === "thisMonth" ? today : subMonths(today, 1);
//       const fy = getFinancialYearForDate(targetDate);
//       setSelectedFinancialYear(fy);
//     }
//   }, [dateFilter]);

//   // Automatically show quarter dropdown after selecting financial year
//   useEffect(() => {
//     if (dateFilter === "financialYearQuarter" && showFinancialYearDropdown === false && selectedFinancialYear) {
//       setShowQuarterDropdown(true);
//     }
//   }, [selectedFinancialYear, dateFilter, showFinancialYearDropdown]);

//   // Reset to "This Month" if quarter selection is cancelled
//   useEffect(() => {
//     if (dateFilter === "financialYearQuarter" && selectedQuarter === null && !showQuarterDropdown) {
//       setDateFilter("thisMonth");
//     }
//   }, [selectedQuarter, showQuarterDropdown, dateFilter]);

//   const fetchSupplier = async (supplierId: string): Promise<string> => {
//     try {
//       const supplier = await getSupplierById(supplierId.trim());
//       if (!supplier || !supplier.supplierName) {
//         console.warn(`Supplier not found for ID: ${supplierId} in frontend`);
//         return "Unknown Supplier";
//       }
//       return supplier.supplierName;
//     } catch (error) {
//       console.error(`Error fetching supplier for ID ${supplierId}:`, error);
//       return "Unknown Supplier";
//     }
//   };

//   useEffect(() => {
//     const fetchPurchaseEntry = async () => {
//       try {
//         const response = await getPurchase();
//         if (!response?.data || response.status !== "success") {
//           throw new Error("Failed to fetch purchases");
//         }

//         const purchases: PurchaseEntryData[] = response.data;
//         const purchasesWithSuppliers = await Promise.all(
//           purchases.map(async (purchase) => {
//             const supplierName = await fetchSupplier(purchase.supplierId);
//             return { ...purchase, supplierName };
//           })
//         );

//         setPurchaseEntryData(purchasesWithSuppliers.reverse());
//       } catch (error) {
//         console.error("Error fetching purchases:", error);
//         setError(
//           error instanceof Error ? error.message : "An unknown error occurred"
//         );
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchPurchaseEntry();
//   }, []);

//   const formatDate = (date: string | Date): string => {
//     const parsedDate = typeof date === "string" ? new Date(date) : date;
//     return format(parsedDate, "dd-MM-yyyy");
//   };

//   const [sortConfig, setSortConfig] = useState<{
//     key: keyof PurchaseEntryData | null;
//     direction: "asc" | "desc";
//   }>({ key: null, direction: "asc" });

//   const handleSort = (key: keyof PurchaseEntryData) => {
//     setSortConfig((prev) => {
//       if (prev.key === key) {
//         return {
//           key,
//           direction: prev.direction === "asc" ? "desc" : "asc",
//         };
//       }
//       return { key, direction: "asc" };
//     });
//   };

//   const getSortedData = () => {
//     const sorted = [...filteredData];
//     if (sortConfig.key) {
//       sorted.sort((a, b) => {
//         const aValue = a[sortConfig.key!];
//         const bValue = b[sortConfig.key!];

//         // Special handling for date sorting
//         if (sortConfig.key === "purchaseDate") {
//           const aDate = new Date(aValue as string);
//           const bDate = new Date(bValue as string);
//           return sortConfig.direction === "asc" 
//             ? aDate.getTime() - bDate.getTime() 
//             : bDate.getTime() - aDate.getTime();
//         }

//         if (typeof aValue === "string" && typeof bValue === "string") {
//           return sortConfig.direction === "asc"
//             ? aValue.localeCompare(bValue)
//             : bValue.localeCompare(aValue);
//         }

//         if (typeof aValue === "number" && typeof bValue === "number") {
//           return sortConfig.direction === "asc"
//             ? aValue - bValue
//             : bValue - aValue;
//         }

//         return 0;
//       });
//     }
//     return sorted;
//   };

//   const filterByDateRange = (data: PurchaseEntryData[]) => {
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);

//     switch (dateFilter) {
//       case "thisMonth":
//         const thisMonthStart = startOfMonth(today);
//         const thisMonthEnd = endOfMonth(today);
//         thisMonthEnd.setHours(23, 59, 59, 999);
//         return data.filter((item) => {
//           const purchaseDate = new Date(item.purchaseDate);
//           return purchaseDate >= thisMonthStart && purchaseDate <= thisMonthEnd;
//         });
      
//       case "lastMonth":
//         const lastMonth = subMonths(today, 1);
//         const lastMonthStart = startOfMonth(lastMonth);
//         const lastMonthEnd = endOfMonth(lastMonth);
//         lastMonthEnd.setHours(23, 59, 59, 999);
//         return data.filter((item) => {
//           const purchaseDate = new Date(item.purchaseDate);
//           return purchaseDate >= lastMonthStart && purchaseDate <= lastMonthEnd;
//         });
      
//       case "financialYearQuarter":
//         if (selectedQuarter !== null) {
//           if (selectedQuarter === 4) { // Annual summary
//             const financialYearStart = new Date(selectedFinancialYear, 3, 1);
//             const financialYearEnd = new Date(selectedFinancialYear + 1, 2, 31);
//             financialYearEnd.setHours(23, 59, 59, 999);
//             return data.filter((item) => {
//               const purchaseDate = new Date(item.purchaseDate);
//               return purchaseDate >= financialYearStart && purchaseDate <= financialYearEnd;
//             });
//           } else {
//             const quarters = getFinancialYearQuarters(selectedFinancialYear);
//             if (quarters[selectedQuarter]) {
//               const quarterStart = startOfQuarter(quarters[selectedQuarter]);
//               const quarterEnd = endOfQuarter(quarters[selectedQuarter]);
//               quarterEnd.setHours(23, 59, 59, 999);
//               return data.filter((item) => {
//                 const purchaseDate = new Date(item.purchaseDate);
//                 return purchaseDate >= quarterStart && purchaseDate <= quarterEnd;
//               });
//             }
//           }
//         }
//         return [];
      
//       case "financialYear":
//         const financialYearStart = new Date(selectedFinancialYear, 3, 1); 
//         const financialYearEnd = new Date(selectedFinancialYear + 1, 2, 31);
//         financialYearEnd.setHours(23, 59, 59, 999);
//         return data.filter((item) => {
//           const purchaseDate = new Date(item.purchaseDate);
//           return purchaseDate >= financialYearStart && purchaseDate <= financialYearEnd;
//         });
      
//       case "custom":
//         if (startDate && endDate) {
//           const adjustedStart = new Date(startDate);
//           const adjustedEnd = new Date(endDate);
//           adjustedStart.setHours(0, 0, 0, 0);
//           adjustedEnd.setHours(23, 59, 59, 999);
//           return data.filter((item) => {
//             const purchaseDate = new Date(item.purchaseDate);
//             return purchaseDate >= adjustedStart && purchaseDate <= adjustedEnd;
//           });
//         }
//         return data;
      
//       default:
//         return data;
//     }
//   };

//   const columns = [
//     {
//       header: (
//         <div
//           className="flex items-center gap-2 cursor-pointer"
//           onClick={() => handleSort("purchaseDate")}
//         >
//           <span>Purchase Date</span>
//           {sortConfig.key === "purchaseDate" ? (
//             sortConfig.direction === "asc" ? (
//               <FaArrowUp />
//             ) : (
//               <FaArrowDown />
//             )
//           ) : (
//             <FaArrowDown />
//           )}
//         </div>
//       ),
//       accessor: (row: PurchaseEntryData) => formatDate(row.purchaseDate),
//     },
//     {
//       header: "Bill No",
//       accessor: "purchaseBillNo" as keyof PurchaseEntryData,
//     },
//     {
//       header: "Gross Amount",
//       accessor: "supplierName" as keyof PurchaseEntryData,
//     },
//     {
//       header: "CGST In Rs.",
//       accessor: "supplierName" as keyof PurchaseEntryData,
//     },
//     {
//       header: "SGST In Rs.",
//       accessor: "supplierName" as keyof PurchaseEntryData,
//     },
//     {
//       header: "Net Amount",
//       accessor: "grandTotal" as keyof PurchaseEntryData,
//     },
//     {
//       header: "Payment Status",
//       accessor: (row: PurchaseEntryData) => {
//         const isPending = row.paymentStatus?.toLowerCase() === "pending";
//         const bgClass = isPending ? "bg-warning" : "bg-green";
//         const textClass = isPending ? "text-warning" : "text-green";

//         return (
//           <span
//             className={`px-2 py-1 rounded-xl text-sm font-medium ${bgClass} ${textClass}`}
//           >
//             {row.paymentStatus}
//           </span>
//         );
//       },
//     },
//     {
//       header: <BsThreeDotsVertical size={18} />,
//       accessor: (row: PurchaseEntryData) => (
//         <div className="relative group">
//           <button className="p-2 rounded-full hover:bg-gray-200 cursor-pointer">
//             <BsThreeDotsVertical size={18} />
//           </button>
//           <div className="absolute right-0 mt-2 w-18 bg-white shadow-xl rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
//             <Link
//               href={`/dashboard/orderSummary?id=${row.invId}`}
//               className="block w-full px-4 py-2 text-left text-gray-700 cursor-pointer hover:bg-purple-950 hover:text-white hover:rounded-lg"
//             >
//               View
//             </Link>
//           </div>
//         </div>
//       ),
//     },
//   ];

//   const filteredData = filterByDateRange(
//     purchaseEntryData.filter((item) => {
//       const search = searchText.toLowerCase();
//       const purchaseDateFormatted = format(
//         new Date(item.purchaseDate),
//         "dd-MM-yyyy"
//       );

//       return (
//         item.grnNo?.toLowerCase().includes(search) ||
//         item.supplierName?.toLowerCase().includes(search) ||
//         purchaseDateFormatted.toLowerCase().includes(search) ||
//         item.purchaseBillNo?.toLowerCase().includes(search) ||
//         item.grandTotal?.toString().toLowerCase().includes(search) ||
//         item.paymentStatus?.toString().toLowerCase().includes(search) ||
//         item.goodStatus?.toString().toLowerCase().includes(search)
//       );
//     })
//   );

//   // Always show the latest 5 financial years
//   const financialYears = Array.from({ length: 5 }, (_, i) => {
//     const currentFY = getFinancialYearForDate(new Date());
//     return currentFY - i;
//   });

//   const quarterNames = [
//     "1st Quarter (Apr-Jun)",
//     "2nd Quarter (Jul-Sep)", 
//     "3rd Quarter (Oct-Dec)",
//     "4th Quarter (Jan-Mar)",
//     "Annual Summary"
//   ];

//   return (
//     <>
//       {!showPurchasEntry && (
//         <main className="space-y-10">
//           <div className="flex justify-between">
//             <div className="justify-start text-darkPurple text-3xl font-medium leading-10">
//               Purchase GST Summary
//             </div>
//             <div>
//               <div className="flex space-x-4">
//                 <div>
//                   <Input
//                     type="text"
//                     value={searchText}
//                     onChange={(e) => setSearchText(e.target.value)}
//                     placeholder="Search Table..."
//                     className="w-80 border-gray-300"
//                     icon={<Search size={18} />}
//                   />
//                 </div>
//                 <div className="flex h-[48px] px-[28px] py-[10px] justify-center items-center gap-[14px] rounded-[24px] bg-[#4B0082] text-white cursor-pointer hover:bg-[#4B0082]/90 transition-colors">
//                   <BiExport size={18} />
//                   <span className="text-base font-medium">Export as CSV</span>
//                 </div>
//                 <div className="flex h-[48px] px-[28px] py-[10px] justify-center items-center gap-[6px] rounded-[24px] border border-[#9F9C9C] cursor-pointer hover:bg-gray-50 transition-colors">
//                   <FiPrinter size={18} />
//                   <span className="text-base font-medium">Print</span>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className="flex flex-wrap gap-3 bg-white p-4 rounded-lg shadow relative">
//             {[
//               { value: "thisMonth", label: "This Month" },
//               { value: "lastMonth", label: "Last Month" },
//             ].map((filter) => (
//               <button
//                 key={filter.value}
//                 onClick={() => {
//                   setDateFilter(filter.value);
//                   setSelectedQuarter(null);
//                   setShowQuarterDropdown(false);
//                   setShowFinancialYearDropdown(false);
//                   setShowDatePicker(false);
//                 }}
//                 className={`px-4 py-2 rounded-md text-sm font-medium ${
//                   dateFilter === filter.value && !selectedQuarter
//                     ? "bg-purple-800 text-white"
//                     : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//                 }`}
//               >
//                 {filter.label}
//               </button>
//             ))}

//             {/* Financial Year Dropdown */}
//             <div className="relative">
//               <button
//                 onClick={() => {
//                   setDateFilter("financialYear");
//                   setShowFinancialYearDropdown(!showFinancialYearDropdown);
//                   setShowQuarterDropdown(false);
//                   setShowDatePicker(false);
//                 }}
//                 className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-1 ${
//                   dateFilter === "financialYear"
//                     ? "bg-purple-800 text-white"
//                     : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//                 }`}
//               >
//                 FY {selectedFinancialYear}-{selectedFinancialYear + 1}
//                 <FiChevronDown size={16} />
//               </button>

//               {showFinancialYearDropdown && (
//                 <div className="absolute top-full left-0 mt-1 bg-white rounded-md shadow-lg z-50 w-40">
//                   {financialYears.map((year) => (
//                     <div
//                       key={year}
//                       className={`px-3 py-2 hover:bg-gray-100 cursor-pointer ${
//                         year === selectedFinancialYear && dateFilter === "financialYear"
//                           ? "bg-purple-100"
//                           : ""
//                       }`}
//                       onClick={() => {
//                         setSelectedFinancialYear(year);
//                         setDateFilter("financialYear");
//                         setShowFinancialYearDropdown(false);
//                       }}
//                     >
//                       {year}-{year + 1}
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>

//             {/* Quarter Dropdown */}
//             <div className="relative">
//               <button
//                 onClick={() => {
//                   setDateFilter("financialYearQuarter");
//                   setShowQuarterDropdown(!showQuarterDropdown);
//                   setShowFinancialYearDropdown(false);
//                   setShowDatePicker(false);
//                 }}
//                 className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-1 ${
//                   dateFilter === "financialYearQuarter" && selectedQuarter !== null
//                     ? "bg-purple-800 text-white"
//                     : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//                 }`}
//               >
//                 {selectedQuarter !== null 
//                   ? selectedQuarter === 4 
//                     ? `FY ${selectedFinancialYear}-${selectedFinancialYear + 1}`
//                     : `Q${selectedQuarter + 1} ${selectedFinancialYear}-${selectedFinancialYear + 1}`
//                   : "Select Quarter"}
//                 <FiChevronDown size={16} />
//               </button>

//               {showQuarterDropdown && (
//                 <div className="absolute top-full left-0 mt-1 bg-white rounded-md shadow-lg z-50 w-64">
//                   <div className="p-2 border-b">
//                     <div className="relative">
//                       <button
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           setShowFinancialYearDropdown(!showFinancialYearDropdown);
//                           setShowQuarterDropdown(false);
//                         }}
//                         className="w-full text-left px-3 py-2 bg-gray-100 rounded flex justify-between items-center"
//                       >
//                         {selectedFinancialYear}-{selectedFinancialYear + 1}
//                         <FiChevronDown size={16} />
//                       </button>
                      
//                       {showFinancialYearDropdown && (
//                         <div className="absolute top-full left-0 mt-1 bg-white rounded-md shadow-lg z-50 w-full">
//                           {financialYears.map((year) => (
//                             <div
//                               key={year}
//                               className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
//                               onClick={(e) => {
//                                 e.stopPropagation();
//                                 setSelectedFinancialYear(year);
//                                 setShowFinancialYearDropdown(false);
//                                 setShowQuarterDropdown(true);
//                               }}
//                             >
//                               {year}-{year + 1}
//                             </div>
//                           ))}
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                   <div className="max-h-60 overflow-y-auto">
//                     {quarterNames.map((name, index) => (
//                       <div
//                         key={index}
//                         className={`px-3 py-2 hover:bg-gray-100 cursor-pointer ${
//                           selectedQuarter === index && dateFilter === "financialYearQuarter"
//                             ? "bg-purple-100"
//                             : ""
//                         }`}
//                         onClick={() => {
//                           setSelectedQuarter(index);
//                           setDateFilter("financialYearQuarter");
//                           setShowQuarterDropdown(false);
//                         }}
//                       >
//                         {name}
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}
//             </div>

//             {/* Custom Date Range */}
//             <div className="relative">
//               <button
//                 id="custom-date-button"
//                 onClick={() => {
//                   setDateFilter("custom");
//                   setShowDatePicker(!showDatePicker);
//                   setSelectedQuarter(null);
//                   setShowQuarterDropdown(false);
//                   setShowFinancialYearDropdown(false);
//                 }}
//                 className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-1 ${
//                   dateFilter === "custom" && (startDate || endDate)
//                     ? "bg-purple-800 text-white"
//                     : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//                 }`}
//               >
//                 Custom Range
//                 <CiCalendar size={18} />
//               </button>

//               {showDatePicker && (
//                 <div 
//                   id="custom-date-picker"
//                   className="absolute top-full left-0 mt-2 bg-white p-4 rounded-lg shadow-lg z-50 border border-gray-200 w-[240px]"
//                 >
//                   <div className="space-y-4">
//                     <div>
//                       <label className="block text-sm text-gray-600 mb-1">
//                         From
//                       </label>
//                       <div className="flex items-center border rounded-md p-2">
//                         <DatePicker
//                           selected={startDate}
//                           onChange={(date) => setStartDate(date)}
//                           selectsStart
//                           startDate={startDate}
//                           endDate={endDate}
//                           maxDate={new Date()}
//                           className="w-full focus:outline-none text-gray-900 text-sm"
//                           placeholderText="Select date"
//                           dateFormat="MMM d, yy"
//                         />
//                         <CiCalendar className="w-5 h-5 text-gray-500 ml-2" />
//                       </div>
//                     </div>

//                     <div>
//                       <label className="block text-sm text-gray-600 mb-1">
//                         To
//                       </label>
//                       <div className="flex items-center border rounded-md p-2">
//                         <DatePicker
//                           selected={endDate}
//                           onChange={(date) => setEndDate(date)}
//                           selectsEnd
//                           startDate={startDate}
//                           endDate={endDate}
//                           minDate={startDate || undefined}
//                           maxDate={new Date()}
//                           className="w-full focus:outline-none text-gray-900 text-sm"
//                           placeholderText="Select date"
//                           dateFormat="MMM d, yy"
//                         />
//                         <CiCalendar className="w-5 h-5 text-gray-500 ml-2" />
//                       </div>
//                     </div>

//                     <div className="flex justify-between pt-2">
//                       <button
//                         onClick={() => {
//                           setStartDate(null);
//                           setEndDate(null);
//                           setShowDatePicker(false);
//                           setDateFilter("thisMonth");
//                         }}
//                         className="px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded"
//                       >
//                         Cancel
//                       </button>
//                       <button
//                         onClick={() => {
//                           if (startDate && endDate) {
//                             setDateFilter("custom");
//                             setShowDatePicker(false);
//                           }
//                         }}
//                         disabled={!startDate || !endDate}
//                         className={`px-3 py-1 text-sm rounded ${
//                           !startDate || !endDate
//                             ? "bg-gray-300 text-gray-500 cursor-not-allowed"
//                             : "bg-purple-800 text-white hover:bg-purple-700"
//                         }`}
//                       >
//                         Apply
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>

//           <Table
//             data={getSortedData()}
//             columns={columns}
//             noDataMessage="No purchase records found"
//           />
//         </main>
//       )}

//       {showPurchasEntry && (
//         <PurchaseEntry setShowPurchaseEntry={setShowPurchasEntry} />
//       )}
//     </>
//   );
// };

// export default Page;