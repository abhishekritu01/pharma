"use client";

import Input from "@/app/components/common/Input";
import { Search } from "lucide-react";
import React, { useEffect, useState } from "react";
import PaginationTable from "@/app/components/common/PaginationTable";
import Button from "@/app/components/common/Button";
import {
  format,
  
  startOfMonth,
  endOfMonth,
  isWithinInterval,
  isSameDay,
} from "date-fns";
import { FaArrowDown, FaArrowUp } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { CiCalendar } from "react-icons/ci";
import { toast } from "react-toastify";
import { BiExport } from "react-icons/bi";
import Loader from "@/app/components/common/Loader";


interface StockValuationData {
  id: string;
  itemName: string;
  openingQty: number;
  openingValue: number;
  purchaseQty: number;
  purchaseValue: number;
  saleQty: number;
  saleValue: number;
  closingQty: number;
  closingValue: number;
  valuationDate: Date;
}

const Page = () => {
  const [stockValuationData, setStockValuationData] = useState<StockValuationData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<string>("today");
  const [startDate, setStartDate] = useState<Date | null>(null);
//   const [endDate, setEndDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isCustomRangeApplied, setIsCustomRangeApplied] = useState(false);

  const normalizeDate = (date: Date) => {
    const newDate = new Date(date);
    newDate.setHours(0, 0, 0, 0);
    return newDate;
  };

  // Mock data generation function (replace with actual API call)
  const generateMockData = () => {
    const mockData: StockValuationData[] = [];
    const items = [
      "Pantop",
      "Sucral",
      "Ondem",
      "Norflex",
      "Happy dent",
      "Colgium",
      "Kodium",
      "UltraSet",
      "Elitin",
      "Neumora"
    ];

    for (let i = 0; i < 50; i++) {
      mockData.push({
        id: `item-${i}`,
        itemName: items[i % items.length],
        openingQty: Math.floor(Math.random() * 100),
        openingValue: Math.floor(Math.random() * 10000),
        purchaseQty: Math.floor(Math.random() * 50),
        purchaseValue: Math.floor(Math.random() * 5000),
        saleQty: Math.floor(Math.random() * 40),
        saleValue: Math.floor(Math.random() * 8000),
        closingQty: Math.floor(Math.random() * 110),
        closingValue: Math.floor(Math.random() * 12000),
        valuationDate: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000)
      });
    }

    return mockData;
  };

  useEffect(() => {
    // Simulate API call
    const fetchStockValuation = async () => {
      setLoading(true);
      setError(null);
      try {
        // In a real application, you would fetch from your API
        // const response = await getStockValuation();
        const mockData = generateMockData();
        setStockValuationData(mockData);
      } catch (error) {
        console.error("Error fetching stock valuation:", error);
        setError(
          error instanceof Error ? error.message : "An unknown error occurred"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStockValuation();
  }, []);

  const filterByDateRange = (data: StockValuationData[]) => {
    const today = normalizeDate(new Date());

    switch (dateFilter) {
      case "today":
        return data.filter((item) =>
          isSameDay(normalizeDate(new Date(item.valuationDate)), today)
        );
      case "customDate":
        if (isCustomRangeApplied && startDate) {
          return data.filter((item) =>
            isSameDay(normalizeDate(new Date(item.valuationDate)), normalizeDate(startDate))
          );
        }
        return [];
      case "customMonth":
        if (isCustomRangeApplied && startDate) {
          const monthStart = startOfMonth(startDate);
          const monthEnd = endOfMonth(startDate);
          
          return data.filter((item) =>
            isWithinInterval(normalizeDate(new Date(item.valuationDate)), {
              start: monthStart,
              end: monthEnd,
            })
          );
        }
        return [];
      default:
        return data;
    }
  };

  const formatDate = (date: string | Date): string => {
    const parsedDate = typeof date === "string" ? new Date(date) : date;
    return format(parsedDate, "dd-MM-yyyy");
  };

  const [sortConfig, setSortConfig] = useState<{
    key: keyof StockValuationData | null;
    direction: "asc" | "desc";
  }>({ key: null, direction: "asc" });

  const handleSort = (key: keyof StockValuationData) => {
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

        if (aValue instanceof Date && bValue instanceof Date) {
          return sortConfig.direction === "asc"
            ? aValue.getTime() - bValue.getTime()
            : bValue.getTime() - aValue.getTime();
        }

        return 0;
      });
    }
    return sorted;
  };

  const filteredData = filterByDateRange(
    stockValuationData.filter((item) => {
      const search = searchText.toLowerCase();
      return (
        item.itemName?.toLowerCase().includes(search) ||
        item.openingQty?.toString().toLowerCase().includes(search) ||
        item.openingValue?.toString().toLowerCase().includes(search) ||
        item.purchaseQty?.toString().toLowerCase().includes(search) ||
        item.purchaseValue?.toString().toLowerCase().includes(search) ||
        item.saleQty?.toString().toLowerCase().includes(search) ||
        item.saleValue?.toString().toLowerCase().includes(search) ||
        item.closingQty?.toString().toLowerCase().includes(search) ||
        item.closingValue?.toString().toLowerCase().includes(search)
      );
    })
  );

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
      accessor: "itemName" as keyof StockValuationData,
    },
    {
      header: (
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => handleSort("openingQty")}
        >
          <span>Opening Qty.</span>
          {sortConfig.key === "openingQty" ? (
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
      accessor: "openingQty" as keyof StockValuationData,
    },
    {
      header: (
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => handleSort("openingValue")}
        >
          <span>Opening Value</span>
          {sortConfig.key === "openingValue" ? (
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
      accessor: "openingValue" as keyof StockValuationData,
    },
    {
      header: (
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => handleSort("purchaseQty")}
        >
          <span>Purchase Qty.</span>
          {sortConfig.key === "purchaseQty" ? (
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
      accessor: "purchaseQty" as keyof StockValuationData,
    },
    {
      header: (
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => handleSort("purchaseValue")}
        >
          <span>Purchase Value</span>
          {sortConfig.key === "purchaseValue" ? (
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
      accessor: "purchaseValue" as keyof StockValuationData,
    },
    {
      header: (
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => handleSort("saleQty")}
        >
          <span>Sale Qty.</span>
          {sortConfig.key === "saleQty" ? (
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
      accessor: "saleQty" as keyof StockValuationData,
    },
    {
      header: (
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => handleSort("saleValue")}
        >
          <span>Sale Value</span>
          {sortConfig.key === "saleValue" ? (
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
      accessor: "saleValue" as keyof StockValuationData,
    },
    {
      header: (
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => handleSort("closingQty")}
        >
          <span>Closing Qty.</span>
          {sortConfig.key === "closingQty" ? (
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
      accessor: "closingQty" as keyof StockValuationData,
    },
    {
      header: (
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => handleSort("closingValue")}
        >
          <span>Closing Value</span>
          {sortConfig.key === "closingValue" ? (
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
      accessor: "closingValue" as keyof StockValuationData,
    },
  ];

  const prepareExportData = () => {
    return getSortedData().map(item => ({
      "Item Name": item.itemName,
      "Opening Qty": item.openingQty,
      "Opening Value": item.openingValue,
      "Purchase Qty": item.purchaseQty,
      "Purchase Value": item.purchaseValue,
      "Sale Qty": item.saleQty,
      "Sale Value": item.saleValue,
      "Closing Qty": item.closingQty,
      "Closing Value": item.closingValue,
      "Date": formatDate(item.valuationDate)
    }));
  };

  const handleExport = async () => {
    try {
      const dataToExport = prepareExportData();

      const csvContent = [
        Object.keys(dataToExport[0]).join(','),
        ...dataToExport.map(item => Object.values(item).join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', 'stock_valuation.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("CSV exported successfully!");
    } catch (error) {
      console.error("Export failed:", error);
      toast.error(error instanceof Error ? error.message : "Failed to export CSV");
    }
  };

  return (
    <main className="space-y-10">
      <div className="flex justify-between">
        <div className="justify-start text-darkPurple text-3xl font-medium leading-10">
          Stock Valuation
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

      {/* Date range selector */}
      <div className="text-sm font-normal text-[#726C6C] flex space-x-7 cursor-pointer ml-3">
        {[
          { value: "today", label: "Today" },
          { value: "customDate", label: "Custom Date", icon: <CiCalendar size={18} /> },
          { value: "customMonth", label: "Custom Month", icon: <CiCalendar size={18} /> },
        ].map((filter) => (
          <div key={filter.value} className="relative">
            <div
              onClick={() => {
                const newFilter = filter.value;
                setDateFilter(newFilter);
                setIsCustomRangeApplied(false);
                if (newFilter === "customDate" || newFilter === "customMonth") {
                  setStartDate(null);
                  setShowDatePicker(true);
                } else {
                  setShowDatePicker(false);
                }
              }}
              className={`hover:text-[#4B0082] transition-colors flex items-center gap-1 ${dateFilter === filter.value ? "text-[#4B0082]" : ""
                }`}
            >
              {filter.label}
              {filter.icon}
            </div>

            {(dateFilter === "customDate" || dateFilter === "customMonth") &&
              filter.value === dateFilter &&
              showDatePicker && (
                <div className="absolute top-full left-0 mt-2 bg-white p-4 rounded-lg shadow-lg z-50 border border-gray-200 w-[240px]">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">
                        {dateFilter === "customDate" ? "Select Date" : "Select Month"}
                      </label>
                      <div className="flex items-center border rounded-md p-2">
                        <DatePicker
                          selected={startDate}
                          onChange={(date) => setStartDate(date)}
                          maxDate={new Date()}
                          className="w-full focus:outline-none text-gray-900 text-sm"
                          placeholderText="Select date"
                          dateFormat={dateFilter === "customDate" ? "MMM d, yy" : "MMM yyyy"}
                          showMonthYearPicker={dateFilter === "customMonth"}
                        />
                        <div
                          className="w-5 h-5 text-gray-500 ml-2 cursor-pointer"
                          onClick={() => {
                            const datePickerInput = document.querySelector('.react-datepicker-wrapper input');
                            if (datePickerInput) {
                              (datePickerInput as HTMLElement).focus();
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
                          setIsCustomRangeApplied(false);
                          setShowDatePicker(false);
                        }}
                        className="px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          if (startDate) {
                            setIsCustomRangeApplied(true);
                            setShowDatePicker(false);
                          }
                        }}
                        disabled={!startDate}
                        className={`px-3 py-1 text-sm rounded ${!startDate
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
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader type="spinner" size="md" text="Loading ..." fullScreen={false} />
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Error!</strong> {error}
        </div>
      ) : (
        <PaginationTable
          data={getSortedData()}
          columns={columns}
          noDataMessage="No stock valuation records found"
        />
      )}
    </main>
  );
};

export default Page;