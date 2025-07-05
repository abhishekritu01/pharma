// "use client";

// import React, { useEffect, useState } from "react";
// import { SalesReturnData } from "@/app/types/SalesReturnData";
// import { getSalesReturnById } from "@/app/services/SalesReturnService";
// import { format } from "date-fns";
// import Button from "@/app/components/common/Button";
// import Footer from "@/app/components/common/Footer";
// import { useParams } from "next/navigation";
// import { toast } from "react-toastify";
// import Image from "next/image";

// interface SalesReturnSummaryProps {
//   returnId?: string;
//   onClose?: () => void;
// }

// const SalesReturnSummary: React.FC<SalesReturnSummaryProps> = ({
//   onClose
// }) => {
//   const params = useParams();
//   const returnId = params?.id as string;
  
//   const [returnData, setReturnData] = useState<SalesReturnData | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   const formatDate = (date: Date | string) => {
//     try {
//       return format(new Date(date), "dd MMM yyyy HH:mm");
//     } catch (err) {
//       console.error("Error formatting date:", err);
//       return "Invalid Date";
//     }
//   };

//   const fetchReturnDetails = async () => {
//     if (!returnId) return;
    
//     setLoading(true);
//     setError(null);
    
//     try {
//       const data = await getSalesReturnById(returnId);
//       setReturnData({
//         ...data,
//         returnDate: data.returnDate ? new Date(data.returnDate) : new Date(),
//       });
//     } catch (err) {
//       console.error("Error fetching return details:", err);
//       setError("Failed to load return details");
//       toast.error("Failed to load return details");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchReturnDetails();
//   }, [returnId]);

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-darkPurple"></div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
//         <strong className="font-bold">Error!</strong>
//         <span className="block sm:inline"> {error}</span>
//       </div>
//     );
//   }

//   if (!returnData) {
//     return (
//       <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative">
//         Return data not found
//       </div>
//     );
//   }

//   return (
//     <>
//       <main className="space-y-10">
//         <div className="justify-start text-darkPurple text-3xl font-medium leading-10">
//           Sales Return Details
//         </div>

//         {/* Summary Cards */}
//         <div className="flex space-x-4">
//           <div className="w-full h-24 border border-Gray rounded-lg flex items-center px-6 space-x-4">
//             <div>
//               <Image
//                 src="/OrderId.svg"
//                 alt="Return ID"
//                 width={45}
//                 height={32}
//               />
//             </div>
//             <div className="grid">
//               <span className="font-normal text-sm text-gray">Return ID</span>
//               <span className="font-normal text-base">
//                 {returnData.returnId1 || returnData.returnId}
//               </span>
//             </div>
//           </div>

//           <div className="w-full h-24 border border-Gray rounded-lg flex items-center px-6 space-x-4">
//             <div>
//               <Image
//                 src="/Date.svg"
//                 alt="Return Date"
//                 width={45}
//                 height={32}
//               />
//             </div>
//             <div className="grid">
//               <span className="font-normal text-sm text-gray">Return Date</span>
//               <span className="font-normal text-base">
//                 {formatDate(returnData.returnDate)}
//               </span>
//             </div>
//           </div>

//           <div className="w-full h-24 border border-Gray rounded-lg flex items-center px-6 space-x-4">
//             <div>
//               <Image
//                 src="/Patient.svg"
//                 alt="Patient"
//                 width={45}
//                 height={32}
//               />
//             </div>
//             <div className="grid">
//               <span className="font-normal text-sm text-gray">Patient Name</span>
//               <span className="font-normal text-base">
//                 {returnData.patientName || "--"}
//               </span>
//             </div>
//           </div>

//           <div className="w-full h-24 border border-Gray rounded-lg flex items-center px-6 space-x-4">
//             <div>
//               <Image
//                 src="/OrderId.svg"
//                 alt="Bill Number"
//                 width={45}
//                 height={32}
//               />
//             </div>
//             <div className="grid">
//               <span className="font-normal text-sm text-gray">Bill Number</span>
//               <span className="font-normal text-base">
//                 {returnData.originalBill?.billId1 || returnData.originalBillId || "--"}
//               </span>
//             </div>
//           </div>
//         </div>

//         {/* Return Items */}
//         {returnData.returnItems?.map((item, index) => (
//           <div
//             key={index}
//             className="border border-gray-300 w-full rounded-lg p-5 flex flex-col lg:flex-row gap-8"
//           >
//             {/* Left Column - Item Details */}
//             <div className="space-y-5 w-full lg:w-1/2">
//               <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-4">
//                 <div className="grid">
//                   <div className="font-normal text-sm text-gray">Item Name</div>
//                   <div className="font-normal text-base">{item.itemName}</div>
//                 </div>

//                 <div className="grid">
//                   <div className="font-normal text-sm text-gray">Batch No.</div>
//                   <div className="font-normal text-base">{item.batchNo}</div>
//                 </div>

//                 <div className="grid">
//                   <div className="font-normal text-sm text-gray">Return Qty.</div>
//                   <div className="font-normal text-base">{item.returnedQuantity}</div>
//                 </div>

//                 <div className="grid">
//                   <div className="font-normal text-sm text-gray">Refund Amount</div>
//                   <div className="font-normal text-base">
//                     ₹{item.refundAmount.toFixed(2)}
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Right Column - Discrepancy Info */}
//             <div className="w-full lg:flex-1">
//               <div className="border border-gray-200 rounded-lg p-4">
//                 <h3 className="font-medium text-gray-700 mb-3">Return Reason</h3>
//                 <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
//                   {item.returnReason || "Not specified"}
//                 </p>
//               </div>
//             </div>
//           </div>
//         ))}

//         {/* Summary Section */}
//         <div className="border h-auto w-lg border-Gray rounded-xl p-6 space-y-6 ml-auto font-normal text-sm">
//           <div className="flex justify-between">
//             <div>Subtotal</div>
//             <div>₹{returnData.totalRefundAmount.toFixed(2)}</div>
//           </div>
//           <div className="flex justify-between font-semibold text-base bg-gray h-8 p-1 items-center rounded-lg">
//             <div>TOTAL REFUND AMOUNT</div>
//             <div>₹{returnData.totalRefundAmount.toFixed(2)}</div>
//           </div>
//         </div>

//         {/* Payment Status */}
//         <div className="border border-Gray rounded-lg p-5">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Payment Status
//               </label>
//               <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
//                 returnData.paymentStatus === 'processed' 
//                   ? 'bg-green-100 text-green-800' 
//                   : 'bg-yellow-100 text-yellow-800'
//               }`}>
//                 {returnData.paymentStatus.charAt(0).toUpperCase() + returnData.paymentStatus.slice(1)}
//               </div>
//             </div>
//             {returnData.paymentMethod && (
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Payment Method
//                 </label>
//                 <div className="text-sm text-gray-900">
//                   {returnData.paymentMethod.split('_').map(word => 
//                     word.charAt(0).toUpperCase() + word.slice(1)
//                   ).join(' ')}
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Back Button */}
//         {onClose && (
//           <div className="flex justify-end">
//             <Button
//               onClick={onClose}
//               label="Back to Returns"
//               className="w-48 bg-gray-200 text-black h-11"
//             />
//           </div>
//         )}
//       </main>
      
//       <Footer />
//     </>
//   );
// };

// export default SalesReturnSummary;



import React from 'react'

const SalesReturnSummary = () => {
  return (
    <div>SalesReturnSummary</div>
  )
}

export default SalesReturnSummary





















// "use client";

// import React, { useState, useEffect } from "react";
// import { SalesReturnData } from "@/app/types/SalesReturnData";
// import { getSalesReturnById } from "@/app/services/SalesReturnService";
// import { format } from "date-fns";
// import Button from "@/app/components/common/Button";
// import { toast } from "react-toastify";

// interface SalesReturnSummaryProps {
//   returnId: string;
//   onClose: () => void;
// }

// const SalesReturnSummary: React.FC<SalesReturnSummaryProps> = ({
//   returnId,
//   onClose,
// }) => {
//   const [returnData, setReturnData] = useState<SalesReturnData | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchReturnDetails = async () => {
//       try {
//         const data = await getSalesReturnById(returnId);
//         setReturnData({
//           ...data,
//           returnDate: new Date(data.returnDate),
//         });
//       } catch (error) {
//         toast.error("Failed to fetch return details");
//         console.error("Error fetching return details:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchReturnDetails();
//   }, [returnId]);

//   const formatDate = (date: Date | string) => {
//     return format(new Date(date), "dd MMM yyyy HH:mm");
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-darkPurple"></div>
//       </div>
//     );
//   }

//   if (!returnData) {
//     return (
//       <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
//         Failed to load return details
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <div className="bg-white rounded-lg shadow p-6">
//         <div className="flex justify-between items-center mb-6">
//           <h1 className="text-2xl font-bold text-darkPurple">
//             Return Summary - {returnData.returnId1 || returnData.returnId}
//           </h1>
//           <Button
//             label="Close"
//             onClick={onClose}
//             className="bg-gray-200 text-black"
//           />
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
//           <div className="space-y-2">
//             <div>
//               <span className="font-medium">Original Bill ID: </span>
//               <span>{returnData.originalBill?.billId1 || returnData.originalBillId}</span>
//             </div>
//             <div>
//               <span className="font-medium">Patient Name: </span>
//               <span>{returnData.patientName || "--"}</span>
//             </div>
//             <div>
//               <span className="font-medium">Return Date: </span>
//               <span>{formatDate(returnData.returnDate)}</span>
//             </div>
//           </div>

//           <div className="space-y-2">
//             <div>
//               <span className="font-medium">Return Reason: </span>
//               <span>{returnData.returnReason || "--"}</span>
//             </div>
//             <div>
//               <span className="font-medium">Payment Status: </span>
//               <span className={`px-2 py-1 rounded-xl text-sm font-medium ${
//                 returnData.paymentStatus === "processed"
//                   ? "bg-green-100 text-green-800"
//                   : "bg-yellow-100 text-yellow-800"
//               }`}>
//                 {returnData.paymentStatus.charAt(0).toUpperCase() +
//                   returnData.paymentStatus.slice(1)}
//               </span>
//             </div>
//             {returnData.paymentMethod && (
//               <div>
//                 <span className="font-medium">Payment Method: </span>
//                 <span>
//                   {returnData.paymentMethod
//                     .split("_")
//                     .map(word => word.charAt(0).toUpperCase() + word.slice(1))
//                     .join(" ")}
//                 </span>
//               </div>
//             )}
//           </div>
//         </div>

//         <h2 className="text-xl font-semibold mb-4">Returned Items</h2>
//         <div className="overflow-x-auto">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Item Name
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Batch No.
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Return Qty.
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Return Reason
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Refund Amount
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {returnData.returnItems.map((item, index) => (
//                 <tr key={index}>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     {item.itemName}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     {item.batchNo}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     {item.returnedQuantity}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     {item.returnReason}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     ₹{item.refundAmount.toFixed(2)}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>

//         <div className="mt-6 p-4 bg-gray-50 rounded-lg">
//           <div className="flex justify-between items-center">
//             <h3 className="text-lg font-semibold">Total Refund Amount</h3>
//             <span className="text-2xl font-bold">
//               ₹{returnData.totalRefundAmount.toFixed(2)}
//             </span>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SalesReturnSummary;
