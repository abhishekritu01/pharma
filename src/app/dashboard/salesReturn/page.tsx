// "use client";

// import Button from "@/app/components/common/Button";
// import Input from "@/app/components/common/Input";
// import Table from "@/app/components/common/Table";
// import { SalesReturnData } from "@/app/types/SalesReturnData";
// import { format } from "date-fns";
// import { Search } from "lucide-react";
// import React, { useEffect, useState } from "react";
// import { BsThreeDotsVertical } from "react-icons/bs";
// import { FaArrowDown, FaArrowUp } from "react-icons/fa";
// import SalesReturn from "./components/SalesReturn";
// import {
//   getSalesReturns,
//   deleteSalesReturn,
// } from "@/app/services/SalesReturnService";
// import { getBilling } from "@/app/services/BillingService";
// import { toast } from "react-toastify";
// import Modal from "@/app/components/common/Modal";
// import Link from "next/link";

// const SalesReturnPage = () => {
//   const [showSalesReturn, setShowSalesReturn] = useState(false);
//   const [salesReturnData, setSalesReturnData] = useState<SalesReturnData[]>([]);
//   const [bills, setBills] = useState<{ billId: string; billNumber: string }[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);
//   const [searchText, setSearchText] = useState<string>("");
//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const [returnToDelete, setReturnToDelete] = useState<string | null>(null);

//   // Date formatting with error handling
//   const formatDate = (date: string | Date | null | undefined): string => {
//     try {
//       if (!date) return "--";
//       const parsedDate = typeof date === 'string' ? new Date(date) : date;
//       return format(parsedDate, "dd-MM-yyyy HH:mm");
//     } catch (error) {
//       console.error("Error formatting date:", error);
//       return "--";
//     }
//   };

//   // Fetch all bills to populate dropdown
//   const fetchBills = async () => {
//     try {
//       const response = await getBilling();
//       if (response.status === "success") {
//         setBills(
//           response.data.map((bill: any) => ({
//             billId: bill.billId,
//             billNumber: bill.billId1 || bill.billId,
//           }))
//         );
//       }
//     } catch (error) {
//       console.error("Failed to fetch bills", error);
//       toast.error("Failed to fetch bills");
//     }
//   };

//   // Fetch sales returns data
//   const fetchSalesReturnData = async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const result = await getSalesReturns();
//       if (result.status === "success") {
//         const processedData = result.data.map((item: any) => ({
//           ...item,
//           returnDate: item.returnDate ? new Date(item.returnDate) : new Date(),
//           originalBillId: item.originalBill?.billId1 || item.originalBillId || "--",
//         }));
//         setSalesReturnData(processedData);
//       } else {
//         throw new Error(result.message || "Failed to fetch data");
//       }
//     } catch (error) {
//       console.error("Error:", error);
//       setError(error instanceof Error ? error.message : "Failed to load data");
//       toast.error("Failed to load return data");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchBills();
//     fetchSalesReturnData();
//   }, []);

//   // Sorting configuration
//   const [sortConfig, setSortConfig] = useState<{
//     key: keyof SalesReturnData | null;
//     direction: "asc" | "desc";
//   }>({ key: null, direction: "asc" });

//   const handleSort = (key: keyof SalesReturnData) => {
//     setSortConfig((prev) => ({
//       key,
//       direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc"
//     }));
//   };

//   const getSortedData = () => {
//     const sorted = [...filteredData];
//     if (sortConfig.key) {
//       sorted.sort((a, b) => {
//         const aValue = a[sortConfig.key!];
//         const bValue = b[sortConfig.key!];

//         if (aValue instanceof Date && bValue instanceof Date) {
//           return sortConfig.direction === "asc"
//             ? aValue.getTime() - bValue.getTime()
//             : bValue.getTime() - aValue.getTime();
//         }
//         if (typeof aValue === "number" && typeof bValue === "number") {
//           return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue;
//         }
//         if (typeof aValue === "string" && typeof bValue === "string") {
//           return sortConfig.direction === "asc"
//             ? aValue.localeCompare(bValue)
//             : bValue.localeCompare(aValue);
//         }
//         return 0;
//       });
//     }
//     return sorted;
//   };

//   // Table columns
//   const columns = [
//     {
//       header: (
//         <div
//           className="flex items-center gap-2 cursor-pointer"
//           onClick={() => handleSort("returnId1")}
//         >
//           <span>Return ID</span>
//           {sortConfig.key === "returnId1" ? (
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
//       accessor: (row: SalesReturnData) => row.returnId1 || row.returnId,
//     },
//     {
//       header: "Original Bill",
//       accessor: (row: SalesReturnData) => row.originalBill?.billId1 || row.originalBillId || "--",
//     },
//     {
//       header: "Patient Name",
//       accessor: (row: SalesReturnData) => row.patientName || "--",
//     },
//     {
//       header: (
//         <div
//           className="flex items-center gap-2 cursor-pointer"
//           onClick={() => handleSort("returnDate")}
//         >
//           <span>Return Date</span>
//           {sortConfig.key === "returnDate" ? (
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
//       accessor: (row: SalesReturnData) => formatDate(row.returnDate),
//     },
//     {
//       header: "Return Reason",
//       accessor: (row: SalesReturnData) => row.returnReason || "--",
//     },
//     {
//       header: (
//         <div
//           className="flex items-center gap-2 cursor-pointer"
//           onClick={() => handleSort("totalRefundAmount")}
//         >
//           <span>Refund Amount</span>
//           {sortConfig.key === "totalRefundAmount" ? (
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
//       accessor: (row: SalesReturnData) => `₹${row.totalRefundAmount?.toFixed(2) || "0.00"}`,
//     },
//     {
//       header: "Status",
//       accessor: (row: SalesReturnData) => (
//         <span className={`px-2 py-1 rounded-xl text-xs ${
//           row.paymentStatus === "processed"
//             ? "bg-green-100 text-green-800"
//             : "bg-yellow-100 text-yellow-800"
//         }`}>
//           {row.paymentStatus?.charAt(0).toUpperCase() + row.paymentStatus?.slice(1)}
//         </span>
//       ),
//     },
//     {
//       header: <BsThreeDotsVertical size={18} />,
//       accessor: (row: SalesReturnData) => (
//         <div className="relative group">
//           <button className="p-2 rounded-full hover:bg-gray-200 cursor-pointer">
//             <BsThreeDotsVertical size={18} />
//           </button>
//           <div className="absolute right-0 mt-2 w-36 bg-white shadow-xl rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
//             <Link
//               href={`/dashboard/sales-return/${row.returnId}`}
//               className="block w-full px-4 py-2 text-left text-gray-700 hover:bg-purple-950 hover:text-white hover:rounded-lg"
//             >
//               View Details
//             </Link>
//             <button
//               onClick={() => handleDeleteClick(row.returnId)}
//               className="block w-full px-4 py-2 text-left text-gray-700 hover:bg-purple-950 hover:text-white hover:rounded-lg"
//             >
//               Delete
//             </button>
//           </div>
//         </div>
//       ),
//     },
//   ];

//   // Filter data
//   const filteredData = salesReturnData.filter((item) => {
//     const search = searchText.toLowerCase();
//     return (
//       (item.returnId1 || item.returnId)?.toLowerCase().includes(search) ||
//       (item.originalBill?.billId1 || item.originalBillId)?.toLowerCase().includes(search) ||
//       item.patientName?.toLowerCase().includes(search) ||
//       formatDate(item.returnDate).toLowerCase().includes(search) ||
//       item.returnReason?.toLowerCase().includes(search) ||
//       item.totalRefundAmount?.toString().includes(search) ||
//       item.paymentStatus?.toLowerCase().includes(search)
//     );
//   });

//   const handleCreateReturn = () => setShowSalesReturn(true);

//   const handleDeleteClick = (returnId: string) => {
//     setReturnToDelete(returnId);
//     setShowDeleteModal(true);
//   };

//   const handleDeleteReturn = async () => {
//     if (!returnToDelete) return;
//     try {
//       await deleteSalesReturn(returnToDelete);
//       toast.success("Return deleted successfully");
//       fetchSalesReturnData();
//     } catch (err) {
//       toast.error("Failed to delete return");
//     } finally {
//       setShowDeleteModal(false);
//     }
//   };

//   return (
//     <>
//       {!showSalesReturn ? (
//         <main className="space-y-10">
//           <div className="flex justify-between">
//             <div className="justify-start text-darkPurple text-3xl font-medium leading-10">
//               Sales Return List
//             </div>
//             <div>
//               <div className="flex space-x-4">
//                 <div>
//                   <Input
//                     type="text"
//                     value={searchText}
//                     onChange={(e) => setSearchText(e.target.value)}
//                     placeholder="Search Returns..."
//                     className="w-80 border-gray-300"
//                     icon={<Search size={18} />}
//                   />
//                 </div>
//                 <div>
//                   <Button
//                     onClick={handleCreateReturn}
//                     label="New Return"
//                     className="w-40 bg-darkPurple text-white h-11"
//                   />
//                 </div>
//               </div>
//             </div>
//           </div>

//           {loading ? (
//             <div className="flex justify-center items-center h-64">
//               <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-darkPurple"></div>
//             </div>
//           ) : error ? (
//             <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
//               <strong className="font-bold">Error!</strong>
//               <span className="block sm:inline"> {error}</span>
//             </div>
//           ) : (
//             <Table
//               data={getSortedData()}
//               columns={columns}
//               noDataMessage="No sales return records found"
//             />
//           )}
//         </main>
//       ) : (
//         <SalesReturn 
//           setShowCreateReturn={setShowSalesReturn}
//           onSuccess={fetchSalesReturnData}
//           bills={bills}
//         />
//       )}

//       {/* <Modal
//         show={showDeleteModal}
//         message="Are you sure you want to delete this return?"
//         secondaryMessage="This action cannot be undone."
//         bgClassName="bg-red-500"
//         onConfirm={handleDeleteReturn}
//         onCancel={() => setShowDeleteModal(false)}
//       /> */}
//     </>
//   );
// };

// export default SalesReturnPage;






import React from 'react'

const page = () => {
  return (
    <div>page</div>
  )
}

export default page

















// "use client";

// import Button from "@/app/components/common/Button";
// import Input from "@/app/components/common/Input";
// import Table from "@/app/components/common/Table";
// import { SalesReturnData } from "@/app/types/SalesReturnData";
// import { format } from "date-fns";
// import { Search } from "lucide-react";
// import React, { useEffect, useState } from "react";
// import { BsThreeDotsVertical } from "react-icons/bs";
// import { FaArrowDown, FaArrowUp } from "react-icons/fa";
// import SalesReturn from "./components/SalesReturn";
// import {
//   getSalesReturns,
//   deleteSalesReturn,
// } from "@/app/services/SalesReturnService";
// import SalesReturnSummary from "./components/SalesReturnSummary";
// import { getBilling } from "@/app/services/BillingService";
// import { toast } from "react-toastify";
// import Modal from "@/app/components/common/Modal";



// const SalesReturnPage = () => {
//   const [showSalesReturn, setShowSalesReturn] = useState(false);
//   const [salesReturnData, setSalesReturnData] = useState<SalesReturnData[]>([]);
//   const [bills, setBills] = useState<{ billId: string; billNumber: string }[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);
//   const [searchText, setSearchText] = useState<string>("");
//   const [currentReturnId, setCurrentReturnId] = useState<string | null>(null);
//   const [showReturnSummary, setShowReturnSummary] = useState(false);
//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const [returnToDelete, setReturnToDelete] = useState<string | null>(null);

//   // Add these utility functions right after your imports
// const isValidDate = (date: unknown): date is Date => {
//   return date instanceof Date && !isNaN(date.getTime());
// };

// const safeFormatDate = (
//   date: string | Date | null | undefined,
//   formatString = 'dd-MM-yyyy HH:mm'
// ): string => {
//   if (!date) {
//     console.warn("Undefined or null date provided");
//     return "--";
//   }
  
//   try {
//     const parsedDate = typeof date === 'string' ? new Date(date) : date;
    
//     if (!isValidDate(parsedDate)) {
//       console.warn("Invalid date provided:", date);
//       return "--";
//     }
    
//     return format(parsedDate, formatString);
//   } catch (error) {
//     console.error("Error formatting date:", error, date);
//     return "--";
//   }
// };

//  const formatDate = (date: string | Date | null | undefined): string => {
//   return safeFormatDate(date);
// };

//   const [sortConfig, setSortConfig] = useState<{
//     key: keyof SalesReturnData | null;
//     direction: "asc" | "desc";
//   }>({ key: null, direction: "asc" });

//   const handleSort = (key: keyof SalesReturnData) => {
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

//         if (aValue instanceof Date && bValue instanceof Date) {
//           return sortConfig.direction === "asc"
//             ? aValue.getTime() - bValue.getTime()
//             : bValue.getTime() - aValue.getTime();
//         }

//         return 0;
//       });
//     } else {
//       sorted.sort(
//         (a, b) =>
//           new Date(b.returnDate).getTime() - new Date(a.returnDate).getTime()
//       );
//     }

//     return sorted;
//   };

//   const displayValue = (
//     value: string | number | null | undefined
//   ): string | number => {
//     return value !== undefined && value !== null && value !== "" ? value : "--";
//   };

//   const getPaymentStatusBadge = (status: string) => {
//     const statusMap = {
//       pending: { bgColor: "bg-yellow-100", textColor: "text-yellow-800" },
//       processed: { bgColor: "bg-green-100", textColor: "text-green-800" },
//     };

//     const { bgColor, textColor } = statusMap[status.toLowerCase() as keyof typeof statusMap] || {
//       bgColor: "bg-gray-100",
//       textColor: "text-gray-800",
//     };

//     return (
//       <span className={`px-2 py-1 rounded-xl text-sm font-medium ${bgColor} ${textColor}`}>
//         {status.charAt(0).toUpperCase() + status.slice(1)}
//       </span>
//     );
//   };

//   const columns = [
//     {
//       header: (
//         <div
//           className="flex items-center gap-2 cursor-pointer"
//           onClick={() => handleSort("returnId")}
//         >
//           <span>Return ID</span>
//           {sortConfig.key === "returnId" ? (
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
//       accessor: (row: SalesReturnData) => displayValue(row.returnId1 || row.returnId),
//     },
//     {
//       header: "Original Bill ID",
//       accessor: (row: SalesReturnData) => row.originalBill?.billId1 || row.originalBillId || "--",
//     },
//     {
//       header: "Patient Name",
//       accessor: (row: SalesReturnData) => row.patientName || "--",
//     },
//     {
//   header: (
//     <div
//       className="flex items-center gap-2 cursor-pointer"
//       onClick={() => handleSort("returnDate")}
//     >
//       <span>Return Date</span>
//       {sortConfig.key === "returnDate" ? (
//         sortConfig.direction === "asc" ? (
//           <FaArrowUp />
//         ) : (
//           <FaArrowDown />
//         )
//       ) : (
//         <FaArrowDown />
//       )}
//     </div>
//   ),
//   accessor: (row: SalesReturnData) => formatDate(row.returnDate),
// },
//     {
//       header: "Return Reason",
//       accessor: (row: SalesReturnData) => displayValue(row.returnReason),
//     },
//     {
//       header: (
//         <div
//           className="flex items-center gap-2 cursor-pointer"
//           onClick={() => handleSort("totalRefundAmount")}
//         >
//           <span>Refund Amount</span>
//           {sortConfig.key === "totalRefundAmount" ? (
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
//       accessor: (row: SalesReturnData) => `₹${row.totalRefundAmount.toFixed(2)}`,
//     },
//     {
//       header: (
//         <div
//           className="flex items-center gap-2 cursor-pointer"
//           onClick={() => handleSort("paymentStatus")}
//         >
//           <span>Payment Status</span>
//           {sortConfig.key === "paymentStatus" ? (
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
//       accessor: (row: SalesReturnData) => getPaymentStatusBadge(row.paymentStatus),
//     },
//     {
//       header: "Actions",
//       accessor: (row: SalesReturnData) => (
//         <div className="relative group">
//           <button className="p-2 rounded-full hover:bg-gray-200 cursor-pointer">
//             <BsThreeDotsVertical size={18} />
//           </button>

//           <div className="absolute right-0 mt-2 w-36 bg-white shadow-xl rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
//             <button
//               onClick={() => handleReturnSummary(row.returnId)}
//               className="block w-full px-4 py-2 text-left text-gray-700 cursor-pointer hover:bg-purple-950 hover:text-white hover:rounded-lg"
//             >
//               View
//             </button>
//             <button
//               onClick={() => handleDeleteClick(row.returnId)}
//               className="block w-full px-4 py-2 text-left text-gray-700 cursor-pointer hover:bg-purple-950 hover:text-white hover:rounded-lg"
//             >
//               Delete
//             </button>
//           </div>
//         </div>
//       ),
//     },
//   ];

//   const handleReturnSummary = (returnId: string) => {
//     setCurrentReturnId(returnId);
//     setShowReturnSummary(true);
//   };

//   const handleCreateReturn = () => {
//     setShowSalesReturn(true);
//   };

//   const handleDeleteClick = (returnId: string) => {
//     setReturnToDelete(returnId);
//     setShowDeleteModal(true);
//   };

//   const handleDeleteReturn = async () => {
//     if (!returnToDelete) return;

//     try {
//       await deleteSalesReturn(returnToDelete);
//       toast.success("Return deleted successfully");
//       setShowDeleteModal(false);
//       fetchSalesReturnData();
//     } catch (err) {
//       console.error("Error deleting bill return:", err);
//       toast.error("Failed to delete return");
//     }
//   };

//   const fetchBills = async () => {
//     try {
//       const response = await getBilling();
//       if (response.status === "success") {
//         setBills(
//           response.data.map((bill: any) => ({
//             billId: bill.billId,
//             billNumber: bill.billId1 || bill.billId,
//           }))
//         );
//       }
//     } catch (error) {
//       console.error("Failed to fetch bills", error);
//       toast.error("Failed to fetch bills");
//     }
//   };

//  const fetchSalesReturnData = async () => {
//   setLoading(true);
//   setError(null);

//   try {
//     const result = await getSalesReturns();
//     if (result.status === "success") {
//       const processedData = result.data.map((item: any) => ({
//         ...item,
//         returnDate: item.returnDate ? new Date(item.returnDate) : new Date(),
//         originalBillId: item.originalBill?.billId1 || item.originalBillId || "--",
//         returnItems: item.returnItems || [],
//       }));
//       setSalesReturnData(processedData);
//     } else {
//       setError(result.message || "Failed to fetch data");
//       toast.error(result.message || "Failed to fetch data");
//     }
//   } catch (error) {
//     console.error("Error in fetchSalesReturnData:", error);
//     setError("Failed to load return data");
//     toast.error("Failed to load return data");
//   } finally {
//     setLoading(false);
//   }
// };

//   useEffect(() => {
//     fetchBills();
//     fetchSalesReturnData();
//   }, []);

//   const filteredData = salesReturnData.filter((item) => {
//     const search = searchText.toLowerCase();
//     const returnDateFormatted = formatDate(item.returnDate);

//     return (
//       (item.returnId1 || item.returnId)?.toString().toLowerCase().includes(search) ||
//       (item.originalBill?.billId1 || item.originalBillId)?.toString().toLowerCase().includes(search) ||
//       item.patientName?.toLowerCase().includes(search) ||
//       returnDateFormatted.toLowerCase().includes(search) ||
//       item.returnReason?.toLowerCase().includes(search) ||
//       item.totalRefundAmount?.toString().toLowerCase().includes(search) ||
//       item.paymentStatus?.toLowerCase().includes(search)
//     );
//   });

//   return (
//     <>
//       {showReturnSummary && currentReturnId ? (
//         <SalesReturnSummary
//           returnId={currentReturnId}
//           onClose={() => {
//             setShowReturnSummary(false);
//             setCurrentReturnId(null);
//           }}
//         />
//       ) : showSalesReturn ? (
//         <SalesReturn
//           setShowCreateReturn={setShowSalesReturn}
//           onSuccess={fetchSalesReturnData}
//           bills={bills}
//         />
//       ) : (
//         <div className="container mx-auto px-4 py-8">
//           <div className="flex flex-col md:flex-row justify-between items-center mb-8">
//             <h1 className="text-3xl font-medium text-darkPurple mb-4 md:mb-0">Bill Returns</h1>

//             <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 w-full md:w-auto">
//               <div className="w-full sm:w-auto">
//                 <Input
//                   type="text"
//                   value={searchText}
//                   onChange={(e) => setSearchText(e.target.value)}
//                   placeholder="Search Returns..."
//                   className="w-full sm:w-80 border-gray-300"
//                   icon={<Search size={18} />}
//                 />
//               </div>
//               <div>
//                 <Button
//                   onClick={handleCreateReturn}
//                   label="Create Return"
//                   className="w-full sm:w-40 bg-darkPurple text-white h-11"
//                 />
//               </div>
//             </div>
//           </div>

//           {loading ? (
//             <div className="flex justify-center items-center h-64">
//               <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-darkPurple"></div>
//             </div>
//           ) : error ? (
//             <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
//               <strong className="font-bold">Error!</strong>
//               <span className="block sm:inline"> {error}</span>
//             </div>
//           ) : (
//             <div className="bg-white rounded-lg shadow overflow-hidden">
//               <Table
//                 data={getSortedData()}
//                 columns={columns}
//                 noDataMessage="No return records found"
//               />
//             </div>
//           )}
//         </div>
//       )}

      {/* <Modal
        show={showDeleteModal}
        message="Are you sure you want to delete this return?"
        secondaryMessage="This action cannot be undone."
        bgClassName="bg-red-500"
        onConfirm={handleDeleteReturn}
        onCancel={() => setShowDeleteModal(false)}
      />  */}
     {/* </>
  );
};

export default SalesReturnPage;
  */}






{/* 
      <Modal
        show={showDeleteModal}
        message="Are you sure you want to delete this return?"
        secondaryMessage="This action cannot be undone."
        bgClassName="bg-red-500"
        onConfirm={handleDeleteReturn}
        onCancel={() => setShowDeleteModal(false)}
      /> */}





