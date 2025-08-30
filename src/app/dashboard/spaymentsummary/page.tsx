"use client";

import Input from "@/app/components/common/Input";
import { Search } from "lucide-react";
import React, { useEffect, useState } from "react";
import PurchaseEntry from "@/app/dashboard/entry/components/PurchaseEntry";
import { PurchaseEntryData } from "@/app/types/PurchaseEntry";
import PaginationTable from "@/app/components/common/PaginationTable";
import {getPurchase} from "@/app/services/PurchaseEntryService";
import { getSupplierById } from "@/app/services/SupplierService";
import Button from "@/app/components/common/Button";
import { BsThreeDotsVertical } from "react-icons/bs";
import Link from "next/link";
import {
  format,
  subDays,
  startOfWeek,
  endOfWeek,
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
import { exportAsCSVService } from "@/app/services/ExportAsCSVService";
import Loader from "@/app/components/common/Loader";

const Page = () => {
  const [showPurchasEntry, setShowPurchasEntry] = useState(false);
  const [purchaseEntryData, setPurchaseEntryData] = useState<PurchaseEntryData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<string>("thisMonth");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Dropdown menu state and functions
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const toggleMenu = (invId?: string) => {
    setOpenMenuId((prev) => (prev === invId ? null : invId || null));
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".menu-container")) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchSupplier = async (
    supplierId: string | null | undefined
  ): Promise<string> => {
    try {
      if (!supplierId || typeof supplierId !== "string") {
        console.warn(`Invalid supplier ID: ${supplierId}`);
        return "Unknown Supplier";
      }

      const trimmedId = supplierId.trim();
      if (!trimmedId) {
        console.warn(`Empty supplier ID after trimming`);
        return "Unknown Supplier";
      }

      const supplier = await getSupplierById(trimmedId);

      if (!supplier || !supplier.supplierName) {
        console.warn(`Supplier not found for ID: ${supplierId}`);
        return "Unknown Supplier";
      }

      return supplier.supplierName;
    } catch (error) {
      console.error(`Error fetching supplier for ID ${supplierId}:`, error);
      return "Unknown Supplier";
    }
  };

  const normalizeDate = (date: Date) => {
    const newDate = new Date(date);
    newDate.setHours(0, 0, 0, 0);
    return newDate;
  };

  const filterByDateRange = (data: PurchaseEntryData[]) => {
    const today = normalizeDate(new Date());

    switch (dateFilter) {
      case "today":
        return data.filter((item) =>
          isSameDay(normalizeDate(new Date(item.purchaseDate)), today)
        );
      case "yesterday":
        return data.filter((item) =>
          isSameDay(normalizeDate(new Date(item.purchaseDate)), subDays(today, 1))
        );
      case "thisWeek":
        return data.filter((item) =>
          isWithinInterval(normalizeDate(new Date(item.purchaseDate)), {
            start: startOfWeek(today),
            end: endOfWeek(today),
          })
        );
      case "thisMonth":
        return data.filter((item) =>
          isWithinInterval(normalizeDate(new Date(item.purchaseDate)), {
            start: startOfMonth(today),
            end: endOfMonth(today),
          })
        );
      case "pastDue":
        return data.filter((item) => {
          if (!item.paymentDueDate) return false;
          return normalizeDate(new Date(item.paymentDueDate)) < today;
        });
      case "custom":
        if (startDate && endDate) {
          const adjustedEndDate = new Date(endDate);
          adjustedEndDate.setHours(23, 59, 59, 999);

          return data.filter((item) =>
            isWithinInterval(normalizeDate(new Date(item.purchaseDate)), {
              start: normalizeDate(startDate),
              end: adjustedEndDate,
            })
          );
        }
        return data;
      default:
        return data;
    }
  };

  useEffect(() => {
    if (dateFilter === "custom" && startDate && endDate) {
      setDateFilter("custom");
    }
  }, [startDate, endDate, dateFilter]);

  useEffect(() => {
    const fetchPurchaseEntry = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getPurchase();
        if (!response?.data || response.status !== "success") {
          throw new Error("Failed to fetch purchases");
        }

        const purchases: PurchaseEntryData[] = response.data;
        const purchasesWithSuppliers = await Promise.all(
          purchases.map(async (purchase) => {
            if (!purchase.supplierId || typeof purchase.supplierId !== "string") {
              return {
                ...purchase,
                supplierName: "Unknown Supplier",
                dueStatus: "—",
              };
            }

            const supplierName = await fetchSupplier(purchase.supplierId);
            let dueStatus: string = "—";

            if (purchase.paymentStatus === "Paid") {
              dueStatus = "Payment Cleared";
            } else if (purchase.paymentDueDate) {
              const dueDate = normalizeDate(new Date(purchase.paymentDueDate));
              const currentDate = normalizeDate(new Date());

              const timeDiff = dueDate.getTime() - currentDate.getTime();
              const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

              if (daysLeft < 0) dueStatus = "Overdue";
              else if (daysLeft === 0) dueStatus = "Due Today";
              else dueStatus = `${daysLeft} day${daysLeft > 1 ? "s" : ""}`;
            }

            return { ...purchase, supplierName, dueStatus };
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

  // const handleConfirmPayment = async (invId: string) => {
  //   try {
  //     await confirmPurchasePayment(invId);
  //     toast.success("Payment status updated to Paid", {
  //       position: "top-right",
  //       autoClose: 3000,
  //     });

  //     setPurchaseEntryData((prevData) =>
  //       prevData.map((item) =>
  //         item.invId === invId
  //           ? {
  //             ...item,
  //             paymentStatus: "Paid",
  //             dueStatus: "Payment Cleared",
  //           }
  //           : item
  //       )
  //     );
  //   } catch (error) {
  //     console.log(error);
  //     toast.error("Failed to update payment status", {
  //       position: "top-right",
  //       autoClose: 3000,
  //     });
  //   }
  // };

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

        if (sortConfig.key === "dueStatus") {
          const getDaysValue = (status: string) => {
            if (status === "Payment Cleared") return Infinity;
            if (status === "Overdue") return -Infinity;
            if (status === "Due Today") return 0;
            const daysMatch = status.match(/(\d+)/);
            return daysMatch ? parseInt(daysMatch[0]) : Infinity;
          };

          const aDays = getDaysValue(a.dueStatus || "");
          const bDays = getDaysValue(b.dueStatus || "");

          return sortConfig.direction === "asc" ? aDays - bDays : bDays - aDays;
        }

        if (
          sortConfig.key === "purchaseDate" ||
          sortConfig.key === "paymentDueDate"
        ) {
          const aDate = aValue ? new Date(aValue as string).getTime() : 0;
          const bDate = bValue ? new Date(bValue as string).getTime() : 0;
          return sortConfig.direction === "asc" ? aDate - bDate : bDate - aDate;
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

  const filteredData = filterByDateRange(
    purchaseEntryData.filter((item) => {
      const search = searchText.toLowerCase();
      const purchaseDateFormatted = format(
        new Date(item.purchaseDate),
        "dd-MM-yyyy"
      );

      return (
        item.grnNo?.toLowerCase().includes(search) ||
        item.supplierName?.toLowerCase().includes(search) ||
        purchaseDateFormatted.toLowerCase().includes(search) ||
        item.purchaseBillNo?.toLowerCase().includes(search) ||
        item.grandTotal?.toString().toLowerCase().includes(search) ||
        item.paymentStatus?.toString().toLowerCase().includes(search) ||
        item.goodStatus?.toString().toLowerCase().includes(search)
      );
    })
  );

  const columns = [
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
      accessor: "supplierName" as keyof PurchaseEntryData,
    },
    {
      header: (
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => handleSort("purchaseBillNo")}
        >
          <span>Bill No</span>
          {sortConfig.key === "purchaseBillNo" ? (
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
      accessor: "purchaseBillNo" as keyof PurchaseEntryData,
    },
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
      header: (
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => handleSort("paymentDueDate")}
        >
          <span>Payment Due Date</span>
          {sortConfig.key === "paymentDueDate" ? (
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
      accessor: (row: PurchaseEntryData) => {
        if (!row.paymentDueDate) return "—";
        return formatDate(row.paymentDueDate);
      },
    },
    {
      header: (
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => handleSort("dueStatus")}
        >
          <span>Due In (Days)</span>
          {sortConfig.key === "dueStatus" ? (
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
      accessor: (row: PurchaseEntryData) => {
        const status = row.dueStatus?.toLowerCase();
        const textClass =
          status === "due today"
            ? "text-warning"
            : status === "overdue"
              ? "text-danger"
              : status === "payment cleared"
                ? "text-green"
                : "";
        const bgClass =
          status === "due today"
            ? "bg-warning2"
            : status === "overdue"
              ? "bg-danger"
              : status === "payment cleared"
                ? "bg-green2"
                : "";

        return (
          <>
            <span
              className={`inline-block w-2 h-2 rounded-full ${bgClass}`}
            ></span>
            <span
              className={`px-2 py-1 rounded-xl text-sm font-medium ${textClass}`}
            >
              {row.dueStatus}
            </span>
          </>
        );
      },
    },
    {
      header: (
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => handleSort("grandTotal")}
        >
          <span>Bill Amount</span>
          {sortConfig.key === "grandTotal" ? (
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
      accessor: "grandTotal" as keyof PurchaseEntryData,
    },
    {
      header: (
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => handleSort("paymentStatus")}
        >
          <span>Payment Status</span>
          {sortConfig.key === "paymentStatus" ? (
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
        <div className="relative menu-container">
          <button
            className="p-2 rounded-full hover:bg-gray-200 cursor-pointer"
            onClick={() => toggleMenu(row.invId)}
          >
            <BsThreeDotsVertical size={18} />
          </button>

          {openMenuId === row.invId && (
            <div className="absolute right-0 mt-2 w-48 bg-white shadow-xl rounded-lg z-10 border border-gray-200">
              <Link
                href={`/dashboard/orderSummary?id=${row.invId}`}
                className="block w-full px-4 py-3 text-left text-gray-700 cursor-pointer hover:bg-purple-950 hover:text-white hover:rounded-lg transition-colors duration-150"
              >
                View
              </Link>
            </div>
          )}
        </div>
      ),
    },
  ];

  const prepareExportData = () => {
    return getSortedData().map(item => ({
      "Supplier Name": item.supplierName,
      "Bill No": item.purchaseBillNo,
      "Purchase Date": formatDate(item.purchaseDate),
      "Payment Due Date": item.paymentDueDate ? formatDate(item.paymentDueDate) : "—",
      "Due Status": item.dueStatus,
      "Bill Amount": item.grandTotal || 0,
      "Payment Status": item.paymentStatus
    }));
  };

  const handleExport = async () => {
    try {
      const dataToExport = prepareExportData();
      let filenameSuffix;
      const today = new Date();

      switch (dateFilter) {
        case "today":
          filenameSuffix = format(today, 'dd_MM_yyyy');
          break;
        case "yesterday":
          filenameSuffix = format(subDays(today, 1), 'dd_MM_yyyy');
          break;
        case "thisWeek":
          filenameSuffix = `week_${format(startOfWeek(today), 'dd_MM_yyyy')}_to_${format(endOfWeek(today), 'dd_MM_yyyy')}`;
          break;
        case "thisMonth":
          filenameSuffix = format(today, 'MM_yyyy');
          break;
        case "pastDue":
          filenameSuffix = "past_due";
          break;
        case "custom":
          if (startDate && endDate) {
            filenameSuffix = `${format(startDate, 'dd_MM_yyyy')}_to_${format(endDate, 'dd_MM_yyyy')}`;
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
          filename: `supplier_payments_${filenameSuffix}`,
          headers: {
            "Supplier Name": "Supplier Name",
            "Bill No": "Bill Number",
            "Purchase Date": "Purchase Date",
            "Payment Due Date": "Payment Due Date",
            "Due Status": "Due Status",
            "Bill Amount": "Bill Amount (Rs.)",
            "Payment Status": "Payment Status"
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
    <>
      {!showPurchasEntry && (
        <main className="space-y-10">
          <div className="flex justify-between">
            <div className="justify-start text-darkPurple text-3xl font-medium leading-10">
              Supplier&apos;s Payment Summary
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

          {/* Date range selector with new styling */}
          <div className="text-sm font-normal text-[#726C6C] flex space-x-7 cursor-pointer ml-3">
            {[
              { value: "today", label: "Today" },
              { value: "yesterday", label: "Yesterday" },
              { value: "thisWeek", label: "This Week" },
              { value: "thisMonth", label: "This Month" },
              { value: "pastDue", label: "Past Due Date" },
              { value: "custom", label: "Purchase Date Range",icon: <CiCalendar size={18} /> },
            ].map((filter) => (
              <div key={filter.value} className="relative">
                <div
                  onClick={() => {
                    const newFilter = filter.value;
                    setDateFilter(newFilter);
                    setShowDatePicker(newFilter === "custom");
                    if (newFilter === "custom") {
                      setStartDate(null);
                      setEndDate(null);
                    }
                  }}
                  className={`hover:text-[#4B0082] transition-colors flex items-center gap-1 ${
                    dateFilter === filter.value ? "text-[#4B0082]" : ""
                  }`}
                >
                  {filter.label}
                  {filter.icon}
                </div>

                {dateFilter === "custom" &&
                  filter.value === "custom" &&
                  showDatePicker && (
                    <div className="absolute top-full left-0 mt-2 bg-white p-4 rounded-lg shadow-lg z-50 border border-gray-200 w-[240px]">
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
              noDataMessage="No purchase records found"
            />
          )}
        </main>
      )}

      {showPurchasEntry && (
        <PurchaseEntry setShowPurchaseEntry={setShowPurchasEntry} />
      )}
    </>
  );
};

export default Page;