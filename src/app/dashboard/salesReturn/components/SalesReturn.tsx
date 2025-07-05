// "use client";
// import React, { useState, useEffect, useRef } from "react";
// import { BillingData } from "@/app/types/BillingData";
// import {
//  SalesReturnData,
//   SalesReturnItemData,
// } from "@/app/types/SalesReturnData";
// import { PatientData } from "@/app/types/PatientData";
// import { getBillingById } from "@/app/services/BillingService";
// import { getPatientById } from "@/app/services/PatientService";
// import { createSalesReturn } from "@/app/services/SalesReturnService";
// import Button from "@/app/components/common/Button";
// // import Input from "@/app/components/common/Input";
// import Table from "@/app/components/common/Table";
// import { toast } from "react-toastify";
// // import Modal from "@/app/components/common/Modal";
// // import { Search } from "lucide-react";
// import Select, { SelectInstance } from "react-select";
// import { ItemData } from "@/app/types/ItemData";
// import { getItemById } from "@/app/services/ItemService";

// interface SalesReturnProps {
//   setShowCreateReturn: (value: boolean) => void;
//   onSuccess: () => void;
//   bills: Array<{ billId: string; billNumber: string }>;
// }

// interface OptionType {
//   label: string;
//   value: string;
// }

// const SalesReturn: React.FC<SalesReturnProps> = ({
//   setShowCreateReturn,
//   onSuccess,
//   bills,
// }) => {
//   const [selectedBill, setSelectedBill] = useState<OptionType | null>(null);
//   const [originalBill, setOriginalBill] = useState<BillingData | null>(null);
//   const [patientData, setPatientData] = useState<PatientData | null>(null);
//   const [returnItems, setReturnItems] = useState<SalesReturnItemData[]>([]);
//   // const [returnReason, setReturnReason] = useState("");
//   const [paymentMethod, setPaymentMethod] = useState("");
//   // const [showModal, setShowModal] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [searching, setSearching] = useState(false);
//   const [inputValue, setInputValue] = useState("");
//   const selectRef = useRef<SelectInstance<OptionType>>(null);

//   useEffect(() => {
//     if (selectedBill?.value) {
//       fetchOriginalBill();
//     } else {
//       setOriginalBill(null);
//       setPatientData(null);
//       setReturnItems([]);
//     }
//   }, [selectedBill]);

//   const fetchOriginalBill = async () => {
//     if (!selectedBill?.value) return;

//     try {
//       setSearching(true);
//       const bill = await getBillingById(selectedBill.value);

//       if (!bill) {
//         toast.error("Bill not found");
//         return;
//       }

//       // Fetch item names for each bill item
//       const enrichedItems = await Promise.all(
//         bill.billItemDtos.map(async (item: ItemData) => {
//           try {
//             const itemDetails = await getItemById(item.itemId);
//             return {
//               ...item,
//               itemName: itemDetails.itemName || "N/A",
//             };
//           } catch (err) {
//             console.error("Failed to fetch item name:", err);
//             return {
//               ...item,
//               itemName: "Unknown Item",
//             };
//           }
//         })
//       );

//       // Update the bill with enriched items
//       const updatedBill = {
//         ...bill,
//         billItemDtos: enrichedItems,
//       };

//       setOriginalBill(updatedBill);

//       if (bill.patientId) {
//         try {
//           const patient = await getPatientById(bill.patientId);
//           setPatientData(patient);
//         } catch (patientError) {
//           console.warn("Could not fetch patient details", patientError);
//         }
//       }

//       const initialReturnItems = updatedBill.billItemDtos.map((item) => ({
//         returnItemId: `temp-${Math.random().toString(36).substr(2, 9)}`,
//         billItemId: item.billItemId,
//         itemId: item.itemId,
//         itemName: item.itemName,
//         batchNo: item.batchNo,
//         expiryDate: item.expiryDate,
//         returnedQuantity: 0,
//         originalPrice: item.mrpSalePricePerUnit,
//         billedAmount: item.packageQuantity * item.mrpSalePricePerUnit,
//         refundAmount: 0,
//         maxQuantity: item.packageQuantity,
//       }));

//       setReturnItems(initialReturnItems);
//     } catch (error) {
//       toast.error("Failed to fetch bill details");
//       console.error("Error fetching bill details:", error);
//     } finally {
//       setSearching(false);
//     }
//   };

//   // const fetchOriginalBill = async () => {
//   //   if (!selectedBill?.value) return;

//   //   try {
//   //     setSearching(true);
//   //     const bill = await getBillingById(selectedBill.value);

//   //     if (!bill) {
//   //       toast.error("Bill not found");
//   //       return;
//   //     }

//   //     setOriginalBill(bill);

//   //     if (bill.patientId) {
//   //       try {
//   //         const patient = await getPatientById(bill.patientId);
//   //         setPatientData(patient);
//   //       } catch (patientError) {
//   //         console.warn("Could not fetch patient details", patientError);
//   //       }
//   //     }

//   //     const initialReturnItems = bill.billItemDtos.map((item) => ({
//   //       returnItemId: `temp-${Math.random().toString(36).substr(2, 9)}`,
//   //       billItemId: item.billItemId,
//   //       itemId: item.itemId,
//   //       itemName: item.itemName,
//   //       batchNo: item.batchNo,
//   //       expiryDate: item.expiryDate,
//   //       returnedQuantity: 0,
//   //       originalPrice: item.mrpSalePricePerUnit,
//   //       billedAmount: item.packageQuantity * item.mrpSalePricePerUnit,
//   //       refundAmount: 0,
//   //       maxQuantity: item.packageQuantity,
//   //     }));

//   //     setReturnItems(initialReturnItems);
//   //   } catch (error) {
//   //     toast.error("Failed to fetch bill details");
//   //     console.error("Error fetching bill details:", error);
//   //   } finally {
//   //     setSearching(false);
//   //   }
//   // };

//   const handleManualBillEntry = (e: React.KeyboardEvent) => {
//     if (e.key === "Enter") {
//       const matchedBill = bills.find(
//         (bill) => bill.billNumber.toLowerCase() === inputValue.toLowerCase()
//       );

//       if (matchedBill) {
//         setSelectedBill({
//           label: matchedBill.billNumber,
//           value: matchedBill.billId,
//         });
//       } else {
//         toast.error("No matching bill found");
//         setSelectedBill(null);
//       }
//     }
//   };

//   const handleInputChange = (newValue: string) => {
//     setInputValue(newValue);
//   };

//   const handleBillChange = (selected: OptionType | null) => {
//     setSelectedBill(selected);
//     if (!selected) {
//       setInputValue("");
//     }
//   };

//   const handleReturnItemChange = (
//     index: number,
//     field: keyof SalesReturnItemData,
//     value: string | number
//   ) => {
//     const updatedItems = [...returnItems];
//     const item = { ...updatedItems[index], [field]: value };
//     if (field === "returnedQuantity") {
//       item.refundAmount = item.returnedQuantity * item.originalPrice;
//     }
//     updatedItems[index] = item;
//     setReturnItems(updatedItems);
//   };

//   const calculateTotalRefund = () => {
//     return returnItems.reduce((sum, item) => sum + item.refundAmount, 0);
//   };

//   const validateForm = () => {
//     if (!originalBill) {
//       toast.error("Please select a valid bill first");
//       return false;
//     }
//     const hasReturnItems = returnItems.some(
//       (item) => item.returnedQuantity > 0
//     );
//     if (!hasReturnItems) {
//       toast.error("Please specify return quantities for at least one item");
//       return false;
//     }
//     if (!paymentMethod) {
//       toast.error("Please select a payment method");
//       return false;
//     }
//     return true;
//   };

//   const handleSubmit = async () => {
//     if (!validateForm()) return;
//     const salesReturnData: SalesReturnData = {
//       returnId: "",
//       originalBillId: originalBill.billId,
//       returnDate: new Date(),
//       patientId: originalBill.patientId,
//       patientName: originalBill.patientName || "",
//       returnReason: returnReason || "Customer Return",
//       totalRefundAmount: calculateTotalRefund(),
//       paymentStatus: "processed",
//       paymentMethod: paymentMethod,
//       returnItems: returnItems.filter((item) => item.returnedQuantity > 0),
//     };
//     try {
//       setLoading(true);
//       await createSalesReturn(salesReturnData);
//       toast.success("Return created successfully");
//       onSuccess();
//       setShowCreateReturn(false);
//     } catch (error: unknown) {
//       console.error("Error creating return:", error);
//       toast.error(
//         error instanceof Error ? error.message : "Failed to create return"
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   const columns = [
//     {
//       header: "Item Name",
//       accessor: (row: SalesReturnItemData) => row.itemName,
//     },
//     {
//       header: "Batch No.",
//       accessor: (row: SalesReturnItemData) => row.batchNo,
//     },
//     {
//       header: "Expiry Date",
//       accessor: (row: SalesReturnItemData) =>
//         row.expiryDate
//           ? new Date(row.expiryDate).toLocaleDateString("en-GB")
//           : "N/A",
//     },
//     {
//       header: "Original Qty.",
//       accessor: (row: SalesReturnItemData) => row.maxQuantity,
//     },
//     {
//       header: "Return Qty.",
//       accessor: (row: SalesReturnItemData, index: number) => (
//         <input
//           type="number"
//           min="0"
//           max={row.maxQuantity}
//           value={row.returnedQuantity}
//           onChange={(e) =>
//             handleReturnItemChange(
//               index,
//               "returnedQuantity",
//               Math.min(Number(e.target.value), row.maxQuantity)
//             )
//           }
//           className="w-20 border border-gray-300 rounded px-2 py-1"
//         />
//       ),
//     },
//     {
//       header: "Billed Amount",
//       accessor: (row: SalesReturnItemData) => `₹${row.billedAmount.toFixed(2)}`,
//     },
//     {
//       header: "Refund Amount",
//       accessor: (row: SalesReturnItemData) => `₹${row.refundAmount.toFixed(2)}`,
//     },
//   ];

//   const formatPatientId = (id: string, id1?: string) => {
//     return id1 ? id1 : id ? `PID-${id.slice(0, 8).toUpperCase()}` : "N/A";
//   };

//   const formatPaymentStatus = (status: string) => {
//     return status
//       ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
//       : "N/A";
//   };

//   const formatPatientType = (type: string) => {
//     return type === "IP"
//       ? "In-Patient"
//       : type === "OP"
//       ? "Out-Patient"
//       : type || "N/A";
//   };

//   function setShowModal(arg0: boolean): void {
//     throw new Error("Function not implemented.");
//   }

//   return (
//     <main className="space-y-6 p-4">
//       {/* Header Section */}
//       <div className="flex justify-between items-center">
//         <h1 className="justify-start text-darkPurple text-3xl font-medium leading-10">
//           Sales Return
//         </h1>
//         <Button
//           onClick={() => setShowModal(true)}
//           label="Back to List"
//           className="bg-gray-200 text-gray-800 hover:bg-gray-300"
//         />
//       </div>
//       <div className="bg-white rounded-lg shadow p-6">
//         <div className="flex w-[351.67px] h-[96px] py-6 flex-col justify-center items-start relative">
//           <label className="block text-sm font-medium text-gray-700 mb-1">
//             Bill Number *
//           </label>
//           <Select
//             ref={selectRef}
//             options={bills.map((bill) => ({
//               label: bill.billNumber,
//               value: bill.billId,
//             }))}
//             value={selectedBill}
//             onChange={handleBillChange}
//             onInputChange={handleInputChange}
//             inputValue={inputValue}
//             className="w-full"
//             placeholder="Enter Bill Number "
//             isLoading={searching}
//             isClearable={true}
//             onKeyDown={handleManualBillEntry}
//             filterOption={(option, rawInput) => {
//               return option.label
//                 .toLowerCase()
//                 .includes(rawInput.toLowerCase());
//             }}
//           />
//         </div>

//         {/* Patient Information */}
//         {originalBill && (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Patient Name
//               </label>
//               <div className="p-2 bg-gray-50 rounded border border-gray-200">
//                 {patientData?.firstName
//                   ? `${patientData.firstName} ${
//                       patientData.lastName || ""
//                     }`.trim()
//                   : originalBill.patientName || "N/A"}
//               </div>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Gender
//               </label>
//               <div className="p-2 bg-gray-50 rounded border border-gray-200">
//                 {patientData?.gender || "N/A"}
//               </div>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Mobile Number
//               </label>
//               <div className="p-2 bg-gray-50 rounded border border-gray-200">
//                 {patientData?.phone || originalBill.phone || "N/A"}
//               </div>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Patient ID
//               </label>
//               <div className="p-2 bg-gray-50 rounded border border-gray-200">
//                 {patientData?.patientId1 || originalBill?.patientId1 || "N/A"}
//               </div>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Patient Type
//               </label>
//               <div className="p-2 bg-gray-50 rounded border border-gray-200">
//                 {formatPatientType(originalBill.patientType)}
//               </div>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Payment Status
//               </label>
//               <div className="p-2 bg-gray-50 rounded border border-gray-200">
//                 {formatPaymentStatus(originalBill.paymentStatus)}
//               </div>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Bill Date
//               </label>
//               <div className="p-2 bg-gray-50 rounded border border-gray-200">
//                 {originalBill?.billDateTime
//                   ? new Date(originalBill.billDateTime).toLocaleDateString(
//                       "en-GB",
//                       {
//                         day: "2-digit",
//                         month: "2-digit",
//                         year: "numeric",
//                       }
//                     )
//                   : "N/A"}
//               </div>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Return Items Section */}
//       {originalBill && (
//         <>
//           <div className="bg-white rounded-lg shadow p-6">
//             <h2 className="text-lg font-medium text-gray-800 mb-4">
//               Billed Items
//             </h2>
//             <Table
//               data={returnItems}
//               columns={columns}
//               noDataMessage="No items available for return"
//             />
//           </div>

//           {/* Payment Method Section */}
//           <div className="bg-white rounded-lg shadow p-6">
//             <div className="grid grid-cols-1 gap-6">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Payment Method *
//                 </label>
//                 <select
//                   value={paymentMethod}
//                   onChange={(e) => setPaymentMethod(e.target.value)}
//                   className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-50"
//                   required
//                 >
//                   <option value="">Select Method</option>
//                   <option value="cash">Cash</option>
//                   <option value="credit_card">Credit Card</option>
//                   <option value="debit_card">Debit Card</option>
//                   <option value="bank_transfer">Bank Transfer</option>
//                   <option value="upi">UPI</option>
//                 </select>
//               </div>
//             </div>
//           </div>

//           {/* Total Refund Section */}
//           <div className="bg-white rounded-lg shadow p-6">
//             <div className="flex justify-between items-center p-4 bg-gray-100 rounded-lg">
//               <div className="font-semibold text-gray-800">
//                 TOTAL REFUND AMOUNT
//               </div>
//               <div className="font-bold text-lg">
//                 ₹{calculateTotalRefund().toFixed(2)}
//               </div>
//             </div>
//           </div>

//           {/* Submit Button */}
//           <div className="flex justify-end">
//             <Button
//               onClick={handleSubmit}
//               label={loading ? "Processing..." : "Confirm Return"}
//               disabled={loading}
//               className="bg-blue-600 text-white hover:bg-blue-700 px-6 py-2 rounded-lg"
//             />
//           </div>
//         </>
//       )}
//       {/* <Modal
//         show={showModal}
//         message="Are you sure you want to cancel this return?"
//         secondaryMessage="All entered data will be lost."
//         bgClassName="bg-red-500"
//         onConfirm={() => setShowCreateReturn(false)}
//         onCancel={() => setShowModal(false)}
//       /> */}
//     </main>
//   );
// };

// export default SalesReturn;
import React from 'react'

const SalesReturn = () => {
  return (
    <div>SalesReturn</div>
  )
}

export default SalesReturn








// "use client";
// import React, { useState, useEffect, useRef } from "react";
// import { BillingData, BillingItemData } from "@/app/types/BillingData";
// import {
//   SalesReturnData,
//   SalesReturnItemData,
// } from "@/app/types/SalesReturnData";
// import { PatientData } from "@/app/types/PatientData";
// import { getBillingById } from "@/app/services/BillingService";
// import { getPatientById, createPatient } from "@/app/services/PatientService";
// import { createSalesReturn } from "@/app/services/SalesReturnService";
// import Button from "@/app/components/common/Button";
// import Input from "@/app/components/common/Input";
// import Table from "@/app/components/common/Table";
// import { toast } from "react-toastify";
// import Modal from "@/app/components/common/Modal";
// import { Search } from "lucide-react";
// import Select from "react-select";

// interface SalesReturnProps {
//   setShowCreateReturn: (value: boolean) => void;
//   onSuccess: () => void;
//   bills: Array<{ billId: string; billNumber: string }>;
// }

// interface OptionType {
//   label: string;
//   value: string;
// }

// const SalesReturn: React.FC<SalesReturnProps> = ({
//   setShowCreateReturn,
//   onSuccess,
//   bills,
// }) => {
//   const [selectedBill, setSelectedBill] = useState<OptionType | null>(null);
//   const [originalBill, setOriginalBill] = useState<BillingData | null>(null);
//   const [patientData, setPatientData] = useState<PatientData | null>(null);
//   const [returnItems, setReturnItems] = useState<SalesReturnItemData[]>([]);
//   const [returnReason, setReturnReason] = useState("");
//   const [paymentMethod, setPaymentMethod] = useState("");
//   const [showModal, setShowModal] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [searching, setSearching] = useState(false);
//   const [inputValue, setInputValue] = useState("");
//   const selectRef = useRef<any>(null);

//   useEffect(() => {
//     if (selectedBill?.value) {
//       fetchOriginalBill();
//     } else {
//       setOriginalBill(null);
//       setPatientData(null);
//       setReturnItems([]);
//     }
//   }, [selectedBill]);

//   const fetchOriginalBill = async () => {
//     if (!selectedBill?.value) return;

//     try {
//       setSearching(true);
//       const bill = await getBillingById(selectedBill.value);

//       if (!bill) {
//         toast.error("Bill not found");
//         return;
//       }

//       setOriginalBill(bill);

//       if (bill.patientId) {
//         try {
//           const patient = await getPatientById(bill.patientId);
//           setPatientData(patient);
//         } catch (patientError) {
//           console.warn("Could not fetch patient details", patientError);
//         }
//       }

//       const initialReturnItems = bill.billItemDtos.map((item) => ({
//         returnItemId: `temp-${Math.random().toString(36).substr(2, 9)}`,
//         billItemId: item.billItemId,
//         itemId: item.itemId,
//         itemName: item.itemName,
//         batchNo: item.batchNo,
//         returnedQuantity: 0,
//         returnReason: "",
//         originalPrice: item.mrpSalePricePerUnit,
//         refundAmount: 0,
//         maxQuantity: item.packageQuantity,
//       }));

//       setReturnItems(initialReturnItems);
//     } catch (error) {
//       toast.error("Failed to fetch bill details");
//       console.error("Error fetching bill details:", error);
//     } finally {
//       setSearching(false);
//     }
//   };

//   const handleManualBillEntry = (e: React.KeyboardEvent) => {
//     if (e.key === "Enter") {
//       const matchedBill = bills.find(
//         (bill) => bill.billNumber.toLowerCase() === inputValue.toLowerCase()
//       );

//       if (matchedBill) {
//         setSelectedBill({
//           label: matchedBill.billNumber,
//           value: matchedBill.billId,
//         });
//       } else {
//         toast.error("No matching bill found");
//         setSelectedBill(null);
//       }
//     }
//   };

//   const handleInputChange = (newValue: string) => {
//     setInputValue(newValue);
//   };

//   const handleBillChange = (selected: OptionType | null) => {
//     setSelectedBill(selected);
//     if (!selected) {
//       setInputValue("");
//     }
//   };

//   const handleReturnItemChange = (
//     index: number,
//     field: keyof SalesReturnItemData,
//     value: any
//   ) => {
//     const updatedItems = [...returnItems];
//     const item = { ...updatedItems[index], [field]: value };
//     if (field === "returnedQuantity" || field === "returnReason") {
//       if (item.returnedQuantity > 0 && item.returnReason) {
//         item.refundAmount = item.returnedQuantity * item.originalPrice;
//       } else {
//         item.refundAmount = 0;
//       }
//     }
//     updatedItems[index] = item;
//     setReturnItems(updatedItems);
//   };

//   const calculateTotalRefund = () => {
//     return returnItems.reduce((sum, item) => sum + item.refundAmount, 0);
//   };

//   const validateForm = () => {
//     if (!originalBill) {
//       toast.error("Please select a valid bill first");
//       return false;
//     }
//     const hasReturnItems = returnItems.some(
//       (item) => item.returnedQuantity > 0
//     );
//     if (!hasReturnItems) {
//       toast.error("Please specify return quantities for at least one item");
//       return false;
//     }
//     const hasMissingReasons = returnItems.some(
//       (item) => item.returnedQuantity > 0 && !item.returnReason
//     );
//     if (hasMissingReasons) {
//       toast.error("Please specify a reason for all returned items");
//       return false;
//     }
//     return true;
//   };

//   const handleSubmit = async () => {
//     if (!validateForm()) return;
//     const salesReturnData: SalesReturnData = {
//       returnId: "",
//       originalBillId: originalBill.billId,
//       returnDate: new Date(),
//       patientId: originalBill.patientId,
//       patientName: originalBill.patientName || "",
//       returnReason: returnReason || "Customer Return",
//       totalRefundAmount: calculateTotalRefund(),
//       paymentStatus: paymentMethod ? "processed" : "pending",
//       paymentMethod: paymentMethod || undefined,
//       returnItems: returnItems.filter((item) => item.returnedQuantity > 0),
//     };
//     try {
//       setLoading(true);
//       await createSalesReturn(salesReturnData);
//       toast.success("Return created successfully");
//       onSuccess();
//       setShowCreateReturn(false);
//     } catch (error: unknown) {
//       console.error("Error creating return:", error);
//       toast.error(
//         error instanceof Error ? error.message : "Failed to create return"
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   const columns = [
//     {
//       header: "Item Name",
//       accessor: (row: SalesReturnItemData) => row.itemName,
//     },
//     {
//       header: "Batch No.",
//       accessor: (row: SalesReturnItemData) => row.batchNo,
//     },
//     {
//       header: "Original Qty.",
//       accessor: (row: SalesReturnItemData) => row.maxQuantity,
//     },
//     {
//       header: "Return Qty.",
//       accessor: (row: SalesReturnItemData, index: number) => (
//         <input
//           type="number"
//           min="0"
//           max={row.maxQuantity}
//           value={row.returnedQuantity}
//           onChange={(e) =>
//             handleReturnItemChange(
//               index,
//               "returnedQuantity",
//               Math.min(Number(e.target.value), row.maxQuantity)
//             )
//           }
//           className="w-20 border border-gray-300 rounded px-2 py-1"
//         />
//       ),
//     },
//     {
//       header: "Return Reason",
//       accessor: (row: SalesReturnItemData, index: number) => (
//         <select
//           value={row.returnReason}
//           onChange={(e) =>
//             handleReturnItemChange(index, "returnReason", e.target.value)
//           }
//           className="border border-gray-300 rounded px-2 py-1 w-full"
//           required={row.returnedQuantity > 0}
//         >
//           <option value="">Select Reason</option>
//           <option value="Damaged">Damaged</option>
//           <option value="Wrong Item">Wrong Item</option>
//           <option value="Expired">Expired</option>
//           <option value="Customer Changed Mind">Customer Changed Mind</option>
//           <option value="Other">Other</option>
//         </select>
//       ),
//     },
//     {
//       header: "Refund Amount",
//       accessor: (row: SalesReturnItemData) => `₹${row.refundAmount.toFixed(2)}`,
//     },
//   ];

//   const formatPatientId = (id: string, id1?: string) => {
//     return id1 ? id1 : id ? `PID-${id.slice(0, 8).toUpperCase()}` : "N/A";
//   };

//   const formatPaymentStatus = (status: string) => {
//     return status
//       ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
//       : "N/A";
//   };

//   const formatPatientType = (type: string) => {
//     return type === "IP"
//       ? "In-Patient"
//       : type === "OP"
//       ? "Out-Patient"
//       : type || "N/A";
//   };

//   return (
//     <main className="space-y-6 p-4">
//       {/* Header Section */}
//       <div className="flex justify-between items-center">
//         <h1 className="justify-start text-darkPurple text-3xl font-medium leading-10">
//           Sales Return
//         </h1>
//         <Button
//           onClick={() => setShowModal(true)}
//           label="Back to List"
//           className="bg-gray-200 text-gray-800 hover:bg-gray-300"
//         />
//       </div>
//       <div className="bg-white rounded-lg shadow p-6">
//         <div className="flex w-[351.67px] h-[96px] py-6 flex-col justify-center items-start relative">
//           <label className="block text-sm font-medium text-gray-700 mb-1">
//             Bill Number *
//           </label>
//           <Select
//             ref={selectRef}
//             options={bills.map((bill) => ({
//               label: bill.billNumber,
//               value: bill.billId,
//             }))}
//             value={selectedBill}
//             onChange={handleBillChange}
//             onInputChange={handleInputChange}
//             inputValue={inputValue}
//             className="w-full"
//             placeholder="Enter Bill Number "
//             isLoading={searching}
//             isClearable={true}
//             onKeyDown={handleManualBillEntry}
//             filterOption={(option, rawInput) => {
//               return option.label
//                 .toLowerCase()
//                 .includes(rawInput.toLowerCase());
//             }}
//           />
//         </div>

//         {/* Patient Information */}
//         {originalBill && (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Patient Name
//               </label>
//               <div className="p-2 bg-gray-50 rounded border border-gray-200">
//                 {patientData?.firstName
//                   ? `${patientData.firstName} ${
//                       patientData.lastName || ""
//                     }`.trim()
//                   : originalBill.patientName || "N/A"}
//               </div>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Gender
//               </label>
//               <div className="p-2 bg-gray-50 rounded border border-gray-200">
//                 {patientData?.gender || "N/A"}
//               </div>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Mobile Number
//               </label>
//               <div className="p-2 bg-gray-50 rounded border border-gray-200">
//                 {patientData?.phone || originalBill.phone || "N/A"}
//               </div>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Patient ID
//               </label>
//               <div className="p-2 bg-gray-50 rounded border border-gray-200">
//                 {patientData?.patientId1 || originalBill?.patientId1 || "N/A"}
//               </div>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Patient Type
//               </label>
//               <div className="p-2 bg-gray-50 rounded border border-gray-200">
//                 {formatPatientType(originalBill.patientType)}
//               </div>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Payment Status
//               </label>
//               <div className="p-2 bg-gray-50 rounded border border-gray-200">
//                 {formatPaymentStatus(originalBill.paymentStatus)}
//               </div>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Bill Date
//               </label>
//               <div className="p-2 bg-gray-50 rounded border border-gray-200">
//                 {originalBill?.billDateTime
//                   ? new Date(originalBill.billDateTime).toLocaleDateString(
//                       "en-GB",
//                       {
//                         day: "2-digit",
//                         month: "2-digit",
//                         year: "numeric",
//                       }
//                     )
//                   : "N/A"}
//               </div>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Return Items Section */}
//       {originalBill && (
//         <>
//           <div className="bg-white rounded-lg shadow p-6">
//             <h2 className="text-lg font-medium text-gray-800 mb-4">
//               Billed Items
//             </h2>
//             <Table
//               data={returnItems}
//               columns={columns}
//               noDataMessage="No items available for return"
//             />
//           </div>

//           {/* Return Details Section */}
//           <div className="bg-white rounded-lg shadow p-6">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Return Reason
//                 </label>
//                 <select
//                   value={returnReason}
//                   onChange={(e) => setReturnReason(e.target.value)}
//                   className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-50"
//                 >
//                   <option value="">Select Reason</option>
//                   <option value="Customer Return">Customer Return</option>
//                   <option value="Damaged Goods">Damaged Goods</option>
//                   <option value="Wrong Items">Wrong Items</option>
//                   <option value="Other">Other</option>
//                 </select>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Payment Method
//                 </label>
//                 <select
//                   value={paymentMethod}
//                   onChange={(e) => setPaymentMethod(e.target.value)}
//                   className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-50"
//                 >
//                   <option value="">Select Method</option>
//                   <option value="cash">Cash</option>
//                   <option value="credit_card">Credit Card</option>
//                   <option value="bank_transfer">Bank Transfer</option>
//                   <option value="store_credit">Store Credit</option>
//                 </select>
//               </div>
//             </div>
//           </div>

//           {/* Total Refund Section */}
//           <div className="bg-white rounded-lg shadow p-6">
//             <div className="flex justify-between items-center p-4 bg-gray-100 rounded-lg">
//               <div className="font-semibold text-gray-800">
//                 TOTAL REFUND AMOUNT
//               </div>
//               <div className="font-bold text-lg">
//                 ₹{calculateTotalRefund().toFixed(2)}
//               </div>
//             </div>
//           </div>

//           {/* Submit Button */}
//           <div className="flex justify-end">
//             <Button
//               onClick={handleSubmit}
//               label={loading ? "Processing..." : "Confirm Return"}
//               disabled={loading}
//               className="bg-blue-600 text-white hover:bg-blue-700 px-6 py-2 rounded-lg"
//             />
//           </div>
//         </>
//       )}

//       {/* Modal for confirmation - commented out but preserved */}
//       {/* <Modal
//         show={showModal}
//         message="Are you sure you want to cancel this return?"
//         secondaryMessage="All entered data will be lost."
//         bgClassName="bg-red-500"
//         onConfirm={() => setShowCreateReturn(false)}
//         onCancel={() => setShowModal(false)}
//       /> */}
//     </main>
//   );
// };

// export default SalesReturn;
