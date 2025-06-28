"use client";

import Input from "@/app/components/common/Input";
import { Search } from "lucide-react";
import React, { useEffect, useState } from "react";
import PurchaseEntry from "@/app/dashboard/entry/components/PurchaseEntry";
import { PurchaseEntryData } from "@/app/types/PurchaseEntry";
import Table from "@/app/components/common/Table";
import { confirmPurchasePayment, getPurchase } from "@/app/services/PurchaseEntryService";
import { getSupplierById } from "@/app/services/SupplierService";
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
import { FiDownload, FiPrinter } from "react-icons/fi";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { CiCalendar } from "react-icons/ci";
import { toast } from "react-toastify";

const Page = () => {
  const [showPurchasEntry, setShowPurchasEntry] = useState(false);
  const [purchaseEntryData, setPurchaseEntryData] = useState<PurchaseEntryData[]>([]);
  const [, setLoading] = useState<boolean>(true);
  const [, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<string>("thisMonth");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

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
    if (dateFilter === "custom" && startDate && endDate) {
      setDateFilter("custom");
    }
  }, [startDate, endDate, dateFilter]);

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
            let dueStatus: string = "—";

            if (purchase.paymentStatus === "Paid") {
              dueStatus = "Payment Cleared";
            } else if (purchase.paymentDueDate) {
              const dueDate = new Date(purchase.paymentDueDate);
              const currentDate = new Date();
              dueDate.setHours(0, 0, 0, 0);
              currentDate.setHours(0, 0, 0, 0);

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

  const handleConfirmPayment = async (invId: string) => {
    try {
      await confirmPurchasePayment(invId);
      toast.success("Payment status updated to Paid", {
        position: "top-right",
        autoClose: 3000,
      });
      
      // Update the local state
      setPurchaseEntryData(prevData => 
        prevData.map(item => 
          item.invId === invId 
            ? { 
                ...item, 
                paymentStatus: "Paid",
                dueStatus: "Payment Cleared" 
              } 
            : item
        )
      );
    } catch (error) {
      console.log(error);     
      toast.error("Failed to update payment status", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

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
      case "today":
        return data.filter((item) =>
          isSameDay(new Date(item.purchaseDate), today)
        );
      case "yesterday":
        return data.filter((item) =>
          isSameDay(new Date(item.purchaseDate), subDays(today, 1))
        );
      case "thisWeek":
        return data.filter((item) =>
          isWithinInterval(new Date(item.purchaseDate), {
            start: startOfWeek(today),
            end: endOfWeek(today),
          })
        );
      case "thisMonth":
        return data.filter((item) =>
          isWithinInterval(new Date(item.purchaseDate), {
            start: startOfMonth(today),
            end: endOfMonth(today),
          })
        );
      case "pastDue":
        return data.filter((item) => {
          if (!item.paymentDueDate) return false;
          return new Date(item.paymentDueDate) < today;
        });
      case "custom":
        if (startDate && endDate) {
          return data.filter((item) =>
            isWithinInterval(new Date(item.purchaseDate), {
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
      header: "Supplier Name",
      accessor: "supplierName" as keyof PurchaseEntryData,
    },
    {
      header: "Bill No",
      accessor: "purchaseBillNo" as keyof PurchaseEntryData,
    },
    {
      header: "Purchase Date",
      accessor: (row: PurchaseEntryData) => formatDate(row.purchaseDate),
    },
    {
      header: "Payment Due Date",
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
      header: "Bill Amount",
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
            {row.paymentStatus?.toLowerCase() === "pending" && (
              <button
                onClick={() => handleConfirmPayment(row.invId!)}
                className="block w-full px-4 py-2 text-left text-gray-700 cursor-pointer hover:bg-purple-950 hover:text-white hover:rounded-lg"
              >
                Confirm Payment
              </button>
            )}
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
              { value: "yesterday", label: "Yesterday" },
              { value: "thisWeek", label: "This Week" },
              { value: "thisMonth", label: "This Month" },
              { value: "pastDue", label: "Past Due Date" },
              { value: "custom", label: "Purchase Date Range" },
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
                  className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-1 ${
                    dateFilter === filter.value
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
            ))}
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

// // import Button from "@/app/components/common/Button";
// import Input from "@/app/components/common/Input";
// import { Search } from "lucide-react";
// // import { Plus} from "lucide-react";
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
//   subDays,
//   startOfWeek,
//   endOfWeek,
//   startOfMonth,
//   endOfMonth,
//   //startOfYear,
//   //endOfYear,
//   isWithinInterval,
//   isSameDay,
// } from "date-fns";
// import { FaArrowDown, FaArrowUp } from "react-icons/fa";
// import { FiDownload, FiPrinter } from "react-icons/fi";
// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";
// import { CiCalendar } from "react-icons/ci";

// const Page = () => {
//   const [showPurchasEntry, setShowPurchasEntry] = useState(false);
//   const [purchaseEntryData, setPurchaseEntryData] = useState<
//     PurchaseEntryData[]
//   >([]);
//   const [, setLoading] = useState<boolean>(true);
//   const [, setError] = useState<string | null>(null);
//   const [searchText, setSearchText] = useState<string>("");
//   const [dateFilter, setDateFilter] = useState<string>("thisMonth");
//   const [startDate, setStartDate] = useState<Date | null>(null);
//   const [endDate, setEndDate] = useState<Date | null>(null);
//   const [showDatePicker, setShowDatePicker] = useState(false);

//   const fetchSupplier = async (supplierId: string): Promise<string> => {
//     try {
//       const supplier = await getSupplierById(supplierId.trim());
//       if (!supplier || !supplier.supplierName) {
//         console.warn(`Supplier not found for ID: ${supplierId} in frontend`);
//         return "Unknown Supplier1";
//       }
//       return supplier.supplierName;
//     } catch (error) {
//       console.error(`Error fetching supplier for ID ${supplierId}:`, error);
//       return "Unknown Supplier2";
//     }
//   };
//   useEffect(() => {
//     if (dateFilter === "custom" && startDate && endDate) {
//       // This will trigger a re-render and close the picker
//       setDateFilter("custom");
//     }
//   }, [startDate, endDate, dateFilter]);

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
//             let dueStatus: string = "—";

//             if (purchase.paymentDueDate) {
//               const dueDate = new Date(purchase.paymentDueDate);
//               const currentDate = new Date();
//               dueDate.setHours(0, 0, 0, 0);
//               currentDate.setHours(0, 0, 0, 0);

//               const timeDiff = dueDate.getTime() - currentDate.getTime();
//               const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

//               if (daysLeft < 0) dueStatus = "Overdue";
//               else if (daysLeft === 0) dueStatus = "Due Today";
//               else dueStatus = `${daysLeft} day${daysLeft > 1 ? "s" : ""}`;
//             }

//             return { ...purchase, supplierName, dueStatus };
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

//   // const handlePurchesEntry = () => {
//   //   setShowPurchasEntry(true);
//   // };

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

//         if (sortConfig.key === "dueStatus") {
//           const getDaysValue = (status: string) => {
//             if (status === "Overdue") return -Infinity;
//             if (status === "Due Today") return 0;
//             const daysMatch = status.match(/(\d+)/);
//             return daysMatch ? parseInt(daysMatch[0]) : Infinity;
//           };

//           const aDays = getDaysValue(a.dueStatus || "");
//           const bDays = getDaysValue(b.dueStatus || "");

//           return sortConfig.direction === "asc" ? aDays - bDays : bDays - aDays;
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
//       case "today":
//         return data.filter((item) =>
//           isSameDay(new Date(item.purchaseDate), today)
//         );
//       case "yesterday":
//         return data.filter((item) =>
//           isSameDay(new Date(item.purchaseDate), subDays(today, 1))
//         );
//       case "thisWeek":
//         return data.filter((item) =>
//           isWithinInterval(new Date(item.purchaseDate), {
//             start: startOfWeek(today),
//             end: endOfWeek(today),
//           })
//         );
//       case "thisMonth":
//         return data.filter((item) =>
//           isWithinInterval(new Date(item.purchaseDate), {
//             start: startOfMonth(today),
//             end: endOfMonth(today),
//           })
//         );
//       case "pastDue":
//         return data.filter((item) => {
//           if (!item.paymentDueDate) return false;
//           return new Date(item.paymentDueDate) < today;
//         });
//       case "custom":
//         if (startDate && endDate) {
//           return data.filter((item) =>
//             isWithinInterval(new Date(item.purchaseDate), {
//               start: startDate,
//               end: endDate,
//             })
//           );
//         }
//         return data;
//       default:
//         return data;
//     }
//   };

//   const columns = [
//     {
//       header: "Supplier Name",
//       accessor: "supplierName" as keyof PurchaseEntryData,
//     },
//     {
//       header: "Bill No",
//       accessor: "purchaseBillNo" as keyof PurchaseEntryData,
//     },
//     {
//       header: "Purchase Date",
//       accessor: (row: PurchaseEntryData) => formatDate(row.purchaseDate),
//     },
//     {
//       header: "Payment Due Date",
//       accessor: (row: PurchaseEntryData) => {
//         if (!row.paymentDueDate) return "—";
//         return formatDate(row.paymentDueDate);
//       },
//     },
//     {
//       header: (
//         <div
//           className="flex items-center gap-2 cursor-pointer"
//           onClick={() => handleSort("dueStatus")}
//         >
//           <span>Due In (Days)</span>
//           {sortConfig.key === "dueStatus" ? (
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
//       accessor: (row: PurchaseEntryData) => {
//         const status = row.dueStatus?.toLowerCase();
//         const textClass =
//           status === "due today"
//             ? "text-warning"
//             : status === "overdue"
//             ? "text-danger"
//             : "";
//         const bgClass =
//           status === "due today"
//             ? "bg-warning2"
//             : status === "overdue"
//             ? "bg-danger"
//             : "";

//         return (
//           <>
//             <span
//               className={`inline-block w-2 h-2 rounded-full ${bgClass}`}
//             ></span>
//             <span
//               className={`px-2 py-1 rounded-xl text-sm font-medium ${textClass}`}
//             >
//               {row.dueStatus}
//             </span>
//           </>
//         );
//       },
//     },
//     {
//       header: "Bill Amount",
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

//   return (
//     <>
//       {!showPurchasEntry && (
//         <main className="space-y-10">
//           <div className="flex justify-between">
//             <div className="justify-start text-darkPurple text-3xl font-medium leading-10">
//               Supplier&apos;s Payment Summary
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
//                   <FiDownload size={18} />
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
//               { value: "today", label: "Today" },
//               { value: "yesterday", label: "Yesterday" },
//               { value: "thisWeek", label: "This Week" },
//               { value: "thisMonth", label: "This Month" },
//               { value: "pastDue", label: "Past Due Date" },
//               { value: "custom", label: "Purchase Date Range" },
//             ].map((filter) => (
//               <div key={filter.value} className="relative">
//                 <button
//                   onClick={() => {
//                     const newFilter = filter.value;
//                     setDateFilter(newFilter);
//                     // Only show picker when clicking custom range
//                     setShowDatePicker(newFilter === "custom");
//                     // Reset dates when clicking custom range
//                     if (newFilter === "custom") {
//                       setStartDate(null);
//                       setEndDate(null);
//                     }
//                   }}
//                   className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-1 ${
//                     dateFilter === filter.value
//                       ? "bg-purple-800 text-white"
//                       : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//                   }`}
//                 >
//                   {filter.label}
//                   {filter.value === "custom" && <CiCalendar size={18} />}
//                 </button>

//                 {dateFilter === "custom" &&
//                   filter.value === "custom" &&
//                   showDatePicker && (
//                     <div className="absolute top-full left-0 mt-2 bg-white p-4 rounded-lg shadow-lg z-50 border border-gray-200 w-[240px]">
//                       <div className="space-y-4">
//                         <div>
//                           <label className="block text-sm text-gray-600 mb-1">
//                             From
//                           </label>
//                           <div className="flex items-center border rounded-md p-2">
//                             <DatePicker
//                               selected={startDate}
//                               onChange={(date) => setStartDate(date)}
//                               selectsStart
//                               startDate={startDate}
//                               endDate={endDate}
//                               maxDate={new Date()}
//                               className="w-full focus:outline-none text-gray-900 text-sm"
//                               placeholderText="Select date"
//                               dateFormat="MMM d, yy"
//                             />
//                             <CiCalendar className="w-5 h-5 text-gray-500 ml-2" />
//                           </div>
//                         </div>

//                         <div>
//                           <label className="block text-sm text-gray-600 mb-1">
//                             To
//                           </label>
//                           <div className="flex items-center border rounded-md p-2">
//                             <DatePicker
//                               selected={endDate}
//                               onChange={(date) => setEndDate(date)}
//                               selectsEnd
//                               startDate={startDate}
//                               endDate={endDate}
//                               minDate={startDate || undefined}
//                               maxDate={new Date()}
//                               className="w-full focus:outline-none text-gray-900 text-sm"
//                               placeholderText="Select date"
//                               dateFormat="MMM d, yy"
//                             />
//                             <CiCalendar className="w-5 h-5 text-gray-500 ml-2" />
//                           </div>
//                         </div>

//                         <div className="flex justify-between pt-2">
//                           <button
//                             onClick={() => {
//                               setStartDate(null);
//                               setEndDate(null);
//                               setShowDatePicker(false);
//                             }}
//                             className="px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded"
//                           >
//                             Cancel
//                           </button>
//                           <button
//                             onClick={() => {
//                               if (startDate && endDate) {
//                                 setShowDatePicker(false);
//                               }
//                             }}
//                             disabled={!startDate || !endDate}
//                             className={`px-3 py-1 text-sm rounded ${
//                               !startDate || !endDate
//                                 ? "bg-gray-300 text-gray-500 cursor-not-allowed"
//                                 : "bg-purple-800 text-white hover:bg-purple-700"
//                             }`}
//                           >
//                             Apply
//                           </button>
//                         </div>
//                       </div>
//                     </div>
//                   )}
//               </div>
//             ))}
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