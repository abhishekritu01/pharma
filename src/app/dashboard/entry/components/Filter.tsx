// "use client";
// import Button from "@/app/components/common/Button";
// import React, { useState } from "react";
// import { ClipboardList, Plus } from "lucide-react";
// import { RiDeleteBin6Line } from "react-icons/ri";
// import Table from "@/app/components/common/Table";
// import { PurchaseEntryItem } from "@/app/types/PurchaseEntry";
// import Drawer from "@/app/components/common/Drawer";
// import AddItem from "../../item/components/AddItem";
// import AddSupplier from "../../supplier/component/AddSupplier";
// import InputField from "@/app/components/common/InputField";

// interface PurchaseEntryProps {
//   setShowPurchaseEntry: (value: boolean) => void;
// }

// type FormDataType = {
//   [key: string]: string; // ✅ Allows indexing with a string key
// };

// const PurchaseEntry: React.FC<PurchaseEntryProps> = ({
//   setShowPurchaseEntry,
// }) => {
//   const [showDrawer, setShowDrawer] = useState<boolean>(false);
//   const [purchaseRows, setPurchaseRows] = useState<PurchaseEntryItem[]>([
//     {
//       itemId: 0,
//       batchNo: "",
//       packageQuantity: 0,
//       expiryDate: "",
//       purchasePrice: 0,
//       mrpSalePrice: 0,
//       gstPercentage: 0,
//       gstAmount: 0,
//       discount: 0,
//       amount: 0,
//       store: "",
//     },
//   ]);
//   const [formData, setFormData] = useState<FormDataType>({
//     orderId: "",
//     storeId: "",
//     billNo: "",
//     billDate: "",
//     creditPeriod: "",
//     paymentDueDate: "",
//     supplier: "",
//     invoiceAmount: "",
//   });

//   const columns: {
//     header: string;
//     accessor:
//       | keyof PurchaseEntryItem
//       | ((row: PurchaseEntryItem, index: number) => React.ReactNode);
//   }[] = [
//     { header: "Item Name", accessor: "itemId" }, // Assuming 'itemId' represents the item name
//     { header: "Batch No", accessor: "batchNo" },
//     { header: "Package Qty", accessor: "packageQuantity" },
//     { header: "Expiry Date", accessor: "expiryDate" },
//     { header: "Purchase Price", accessor: "purchasePrice" },
//     { header: "MRP", accessor: "mrpSalePrice" },
//     { header: "GST %", accessor: "gstPercentage" },
//     { header: "GST", accessor: "gstAmount" },
//     { header: "Discount", accessor: "discount" },
//     { header: "Amount", accessor: "amount" },
//     {
//       header: "Action",
//       accessor: (row: PurchaseEntryItem, index: number) => (
//         <RiDeleteBin6Line
//           className="text-red-500 hover:text-red-700 cursor-pointer"
//           onClick={() => handleDeleteRow(index)}
//         />
//       ),
//     },
//   ];
//   const [showSupplier, setShowSupplier] = useState(false);
//   const [showItem, setShowItem] = useState(false);

//   // Handle Input Change in Rows
//   const handleChange = (
//     e: React.ChangeEvent<HTMLInputElement>,
//     index: number
//   ) => {
//     const { name, value } = e.target;
//     const updatedRows = [...purchaseRows];
//     updatedRows[index] = { ...updatedRows[index], [name]: value };
//     setPurchaseRows(updatedRows);
//   };

//   // Handle input changes
//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { id, value } = e.target;
//     setFormData((prev) => ({ ...prev, [id]: value }));
//   };

//   // ✅ Corrected Function to Add a New Row
//   const addNewRow = () => {
//     setPurchaseRows([
//       ...purchaseRows,
//       {
//         itemId: 0,
//         store: "",
//         batchNo: "",
//         packageQuantity: 0,
//         expiryDate: "", // Assuming expiry date is a string (ISO format)
//         purchasePrice: 0, // ✅ Ensure number type
//         mrpSalePrice: 0, // ✅ Ensure number type
//         gstPercentage: 0, // ✅ Ensure number type
//         gstAmount: 0, // ✅ Ensure number type
//         discount: 0, // ✅ Ensure number type
//         amount: 0, // ✅ Ensure number type
//       },
//     ]);
//   };

//   const handlePurchaseList = () => {
//     setShowPurchaseEntry(false);
//   };

//   // Delete Row
//   const handleDeleteRow = (index: number) => {
//     setPurchaseRows(purchaseRows.filter((_, i) => i !== index));
//   };

//   const handleSupplierDrawer = () => {
//     setShowItem(false);  // ✅ Close Item Drawer
//     setShowSupplier(true);
//     setShowDrawer(true);
//   };
  
//   const handleItemDrawer = () => {
//     setShowSupplier(false);  // ✅ Close Supplier Drawer
//     setShowItem(true);
//     setShowDrawer(true);
//   };
  

//   // const handleCloseDrawer = () => {
//   //   setShowDrawer(false);
//   //   setShowItem(false);  // ✅ Ensures the drawer unmounts
//   //   setShowSupplier(false);  // ✅ Ensures the drawer unmounts
//   // };
  

//   return (
//     <>
//       {showItem && (
//         <Drawer setShowDrawer={handleItemDrawer} title={"Add Item"}>
//           <AddItem />
//         </Drawer>
//       )}

//       {showSupplier && (
//         <Drawer setShowDrawer={handleSupplierDrawer} title={"Add Supplier"}>
//           <AddSupplier />
//         </Drawer>
//       )}


//       <main className="space-y-6">
//         <div className="flex justify-between">
//           <div className="justify-start text-darkPurple text-3xl font-medium leading-10 ">
//             Purchase Entry
//           </div>

//           <div>
//             <Button
//               onClick={() => handlePurchaseList()}
//               label="Purchase List"
//               value=""
//               className="w-48 bg-darkPurple text-white"
//               icon={<ClipboardList size={15} />}
//             ></Button>
//           </div>
//         </div>

//         <div className="flex">
//           <div>
//             <Button
//               onClick={() => handleSupplierDrawer()}
//               label="Add Supplier"
//               value=""
//               className="w-48 bg-darkPurple text-white"
//               icon={<ClipboardList size={15} />}
//             ></Button>
//           </div>

//           <div>
//             <Button
//               onClick={() => handleItemDrawer()}
//               label="Add Item"
//               value=""
//               className="w-48 bg-darkPurple text-white"
//               icon={<ClipboardList size={15} />}
//             ></Button>
//           </div>
//         </div>
//         <div className="border border-Gray max-w-7xl h-64 rounded-lg p-5">
//           <div className="justify-start text-black text-lg font-normal leading-7">
//             Basic Details
//           </div>

//           <div className="relative mt-8 grid grid-cols-4 gap-4">
//             {[
//               { id: "orderId", label: "Order ID " },
//               { id: "storeId", label: "Store" },
//               { id: "billNo", label: "Bill No" },
//               { id: "billDate", label: "Bill Date" },
//             ].map(({ id, label }) => (
//               <InputField
//                 key={id}
//                 id={id}
//                 label={label}
//                 value={formData[id]}
//                 onChange={handleInputChange}
//               />
//             ))}
//           </div>

//           <div className="relative mt-8 grid grid-cols-4 gap-4">
//             {[
//               { id: "creditPeriod", label: "Credit Period" },
//               { id: "paymentDueDate", label: "Payment Due Date" },
//               { id: "supplier", label: "Supplier" },
//               { id: "invoiceAmount", label: "Invoice Amount" },
//             ].map(({ id, label }) => (
//               <InputField
//                 key={id}
//                 id={id}
//                 label={label}
//                 value={formData[id]}
//                 onChange={handleInputChange}
//               />
//             ))}
//           </div>
//         </div>

//         <Table
//           data={purchaseRows}
//           columns={columns}
//           noDataMessage="No purchase items found"
//         />

//         <div>
//           <Button
//             onClick={() => addNewRow()}
//             label="Add New Item"
//             value=""
//             className="w-44 bg-gray"
//             icon={<Plus size={15} />}
//           ></Button>
//         </div>

//         <div className="border h-56 w-lg border-Gray rounded-xl p-6 space-y-6 ml-auto font-normal text-sm">
//           {[
//             { label: "SUB TOTAL", value: 1111 },
//             { label: "GST", value: 1111 },
//             { label: "DISCOUNT", value: 1111 },
//             { label: "GRAND TOTAL", value: 1111, isTotal: true },
//           ].map(({ label, value, isTotal }, index) => (
//             <div
//               key={index}
//               className={`flex justify-between ${
//                 isTotal
//                   ? "font-semibold text-base bg-gray h-8 p-1 items-center rounded-lg"
//                   : ""
//               }`}
//             >
//               <div>{label}</div>
//               <div>{value}</div>
//             </div>
//           ))}
//         </div>
//       </main>
//     </>
//   );
// };

// export default PurchaseEntry;


import React from 'react'

const Filter = () => {
  return (
    <div>Filter</div>
  )
}

export default Filter