// "use client";

// import Button from "@/app/components/common/Button";
// import Input from "@/app/components/common/Input";
// import Table from "@/app/components/common/Table";
// import { BillingData } from "@/app/types/BillingData";
// import { format } from "date-fns";
// import { Plus, Search } from "lucide-react";
// import Link from "next/link";
// import React, { useEffect, useState } from "react";
// import { BsThreeDotsVertical } from "react-icons/bs";
// import { FaArrowDown, FaArrowUp } from "react-icons/fa";
// import Billing from "./components/Billing";

// const Page = () => {
//   const [showBilling, setShowBilling] = useState(false);
//   const [billingData, setBillingData] = useState<BillingData[]>([]);
//   const [, setLoading] = useState<boolean>(true);
//   const [, setError] = useState<string | null>(null);
//   const [searchText, setSearchText] = useState<string>("");
//   const [currentBillId, setCurrentBillId] = useState<string | null>(null);

//   const formatDate = (date: string | Date): string => {
//     const parsedDate = typeof date === "string" ? new Date(date) : date;
//     return format(parsedDate, "dd-MM-yyyy");
//   };

//   const [sortConfig, setSortConfig] = useState<{
//     key: keyof BillingData | null;
//     direction: "asc" | "desc";
//   }>({ key: null, direction: "asc" });

//   const handleSort = (key: keyof BillingData) => {
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

//         return 0;
//       });
//     }

//     return sorted;
//   };

//   const columns = [
//     {
//       header: (
//         <div
//           className="flex items-center gap-2 cursor-pointer"
//           onClick={() => handleSort("billId1")}
//         >
//           <span>Bill ID</span>
//           {sortConfig.key === "billId1" ? (
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
//       accessor: "billId1" as keyof BillingData,
//     },
//     {
//       header: "Patient Name",
//       accessor: "patientName" as keyof BillingData,
//     },

//     {
//       header: "Mobile No.",
//       accessor: "supplierName" as keyof BillingData,
//     },
//     {
//       header: "Patient Type",
//       accessor: "patientName" as keyof BillingData,
//     },
//     {
//       header: "Bill Date",
//       accessor: (row: BillingData) =>
//         formatDate(row.billDate),
//     },
//     {
//       header: "Patient ID",
//       accessor: "patientId" as keyof BillingData,
//     },
//     {
//       header: "Payment Status",
//       accessor: "billStatus" as keyof BillingData,
//     },
//     {
//       header: "Payment Mode",
//       accessor: "paymentType" as keyof BillingData,
//     },
//     {
//       header: "Bill Amount",
//       accessor: "grandTotal" as keyof BillingData,
//     },
//     {
//       header: <BsThreeDotsVertical size={18} />,
//       accessor: (row: BillingData, index: number) => (
//         <div className="relative group">
//           <button className="p-2 rounded-full hover:bg-gray-200 cursor-pointer">
//             <BsThreeDotsVertical size={18} />
//           </button>

//           {/* <div className="absolute right-0 mt-2 w-18 bg-white shadow-xl rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
//             <Link
//               href={`/dashboard/purchaseOrderDetails?id=${row.billId}`}
//               className="block w-full px-4 py-2 text-left text-gray-700 cursor-pointer hover:bg-purple-950 hover:text-white hover:rounded-lg"
//             >
//               View
//             </Link>
//             <button
//               onClick={() => handlePurchesOrder(row.billId)}
//               className="block w-full px-4 py-2 text-left text-gray-700 cursor-pointer hover:bg-purple-950 hover:text-white hover:rounded-lg"
//             >
//               Delete
//             </button>
//           </div> */}
//         </div>
//       ),
//     },
//   ];

//   // const handlePurchesOrder = (orderId?: string) => {
//   //   if (orderId) {
//   //     setCurrentOrderId(orderId);
//   //   }
//   //   setShowPurchasOrder(true);
//   // };

//   // const fetchSupplier = async (supplierId: string): Promise<string> => {
//   //   try {
//   //     const supplier = await getSupplierById(supplierId.trim());

//   //     if (!supplier || !supplier.supplierName) {
//   //       return "Unknown Supplier1";
//   //     }

//   //     return supplier.supplierName;
//   //   } catch {
//   //     return "Unknown Supplier2";
//   //   }
//   // };

//   // useEffect(() => {
//   //   const fetchBilling = async () => {
//   //     try {
//   //       const response = await getPurchaseOrder();

//   //       if (!response?.data || response.status !== "success") {
//   //         throw new Error(
//   //           response?.message || "Failed to fetch purchase order"
//   //         );
//   //       }

//   //       const purchaseOrder: PurchaseOrderData[] = response.data;

//   //       const purchaseOrderWithDetails = await Promise.all(
//   //         purchaseOrder.map(async (purchase) => {
//   //           const supplierName = await fetchSupplier(purchase.supplierId);
//   //           const pharmacyData = await getPharmacyById(purchase.pharmacyId);
//   //           const pharmacyName =
//   //             pharmacyData?.pharmacyName || "Unknown Pharmacy";

//   //           return {
//   //             ...purchase,
//   //             supplierName,
//   //             pharmacyName,
//   //           };
//   //         })
//   //       );

//   //       setPurchaseOrderData(purchaseOrderWithDetails.reverse());
//   //     } catch (error) {
//   //       console.error("Error fetching purchase orders:", error);
//   //       setError(
//   //         error instanceof Error ? error.message : "An unknown error occurred"
//   //       );
//   //     } finally {
//   //       setLoading(false);
//   //     }
//   //   };

//   //   fetchPurchaseOrder();
//   // }, []);

//   const filteredData = billingData
//     .filter((item) => {
//       const oneMonthAgo = new Date();
//       oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

//       const billDate = new Date(item.billDate);
//       return billDate >= oneMonthAgo; // Only include if within last 1 month
//     })
//     .filter((item) => {
//       const search = searchText.toLowerCase();

//        const billDateFormatted = format(new Date(item.billDate), "dd-MM-yyyy");

//       return (
//         item.billId1?.toLowerCase().includes(search) ||
//         item.patientName?.toLowerCase().includes(search) ||
//         item.patientType?.toLowerCase().includes(search) ||
//         billDateFormatted.toLowerCase().includes(search) ||
//         item.patientId?.toLowerCase().includes(search) ||
//         item.billStatus?.toLowerCase().includes(search) ||
//         item.paymentType?.toLowerCase().includes(search) ||
//         item.grandTotal?.toString().toLowerCase().includes(search)
//       );
//     });

//   return (
//     <>
//       {!showBilling && (
//         <main className="space-y-10">
//           <div className="flex justify-between">
//             <div className="justify-start text-darkPurple text-3xl font-medium leading-10">
//               Billing Logs
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
//                 {/* <div>
//                   <Button
//                     label="Filter"
//                     value=""
//                     className="w-24 text-black h-11"
//                     icon={<Filter size={15} />}
//                   ></Button>
//                 </div> */}
//                 <div>
//                   <Button
//                     // onClick={() => handlePurchesOrder()}
//                     label="Generate Bill"
//                     value=""
//                     className="w-40 bg-darkPurple text-white h-11 "
//                     icon={<Plus size={15} />}
//                   ></Button>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <Table
//             data={getSortedData()}
//             columns={columns}
//             noDataMessage="No purchase records found"
//           />
//         </main>
//       )}

//       {showBilling && (
//         <Billing
//           // setShowPurchasOrder={setShowBilling}
//           // billIdNew={currentBillId}
//         />
//       )}
//     </>
//   );
// };

// export default Page;


import React from 'react'

const Page = () => {
  return (
    <div>Page</div>
  )
}

export default Page