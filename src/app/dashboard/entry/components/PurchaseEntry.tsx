"use client";
import Button from "@/app/components/common/Button";
import React, { useState } from "react";
import { ClipboardList, Plus } from "lucide-react";
import { RiDeleteBin6Line } from "react-icons/ri";
import Table from "@/app/components/common/Table";
import { PurchaseEntryItem } from "@/app/types/PurchaseEntry";
import Drawer from "@/app/components/common/Drawer"
import AddItem from "../../item/components/AddItem";
import AddSupplier from "../../supplier/component/AddSupplier";

interface PurchaseEntryProps {
  setShowPurchaseEntry: (value: boolean) => void;
}

const InputField: React.FC<{
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ id, label, value, onChange }) => (
  <div className="relative">
    <input
      type="text"
      id={id}
      value={value}
      onChange={onChange}
      required
      placeholder=" "
      className="peer w-72 px-3 py-3 border border-gray-400 rounded-md bg-transparent text-black outline-none focus:border-purple-900 focus:ring-0"
      data-has-value={value ? "true" : "false"}
    />
    <label
      htmlFor={id}
      className="absolute left-3 top-0 -translate-y-1/2 bg-white px-1 text-gray-500 text-xs transition-all 
        peer-placeholder-shown:top-0 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-xs 
        peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-xs peer-focus:text-purple-950 peer-focus:px-1
        peer-[data-has-value=true]:top-0 peer-[data-has-value=true]:-translate-y-1/2 peer-[data-has-value=true]:text-xs"
    >
      {label}
    </label>
  </div>
);



const PurchaseEntry: React.FC<PurchaseEntryProps> = ({setShowPurchaseEntry}) => {
  
  const [showDrawer,setShowDrawer] = useState<boolean>(false);
  const [drawerContent, setDrawerContent] = useState<React.ReactNode>(null);
 
 
  const handlePurchaseList = () => {
    setShowPurchaseEntry(false);
  };

 

  const [purchaseRows, setPurchaseRows] = useState<PurchaseEntryItem[]>([
    {
      itemId: 0,
      batchNo: "",
      packageQuantity: 0,
      expiryDate: "",
      purchasePrice: 0,
      mrpSalePrice: 0,
      gstPercentage: 0,
      gstAmount: 0,
      discount: 0,
      amount: 0,
      store: "",
    },
  ]);

  // Handle Input Change in Rows
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const { name, value } = e.target;
    const updatedRows = [...purchaseRows];
    updatedRows[index] = { ...updatedRows[index], [name]: value };
    setPurchaseRows(updatedRows);
  };

  // ✅ Corrected Function to Add a New Row
  const addNewRow = () => {
    setPurchaseRows([
      ...purchaseRows,
      {
        itemId: 0, 
        store: "",
        batchNo: "",
        packageQuantity: 0, 
        expiryDate: "", // Assuming expiry date is a string (ISO format)
        purchasePrice: 0, // ✅ Ensure number type
        mrpSalePrice: 0, // ✅ Ensure number type
        gstPercentage: 0, // ✅ Ensure number type
        gstAmount: 0, // ✅ Ensure number type
        discount: 0, // ✅ Ensure number type
        amount: 0, // ✅ Ensure number type
      },
    ]);
  };

  // Delete Row
  const handleDeleteRow = (index: number) => {
    setPurchaseRows(purchaseRows.filter((_, i) => i !== index));
  };

  const columns: {
    header: string;
    accessor:
      | keyof PurchaseEntryItem
      | ((row: PurchaseEntryItem, index: number) => React.ReactNode);
  }[] = [
    { header: "Item Name", accessor: "itemId" }, // Assuming 'itemId' represents the item name
    { header: "Batch No", accessor: "batchNo" },
    { header: "Package Qty", accessor: "packageQuantity" },
    { header: "Expiry Date", accessor: "expiryDate" },
    { header: "Purchase Price", accessor: "purchasePrice" },
    { header: "MRP", accessor: "mrpSalePrice" },
    { header: "GST %", accessor: "gstPercentage" },
    { header: "GST", accessor: "gstAmount" },
    { header: "Discount", accessor: "discount" },
    { header: "Amount", accessor: "amount" },
    {
      header: "Action",
      accessor: (row: PurchaseEntryItem, index: number) => (
        <RiDeleteBin6Line
          className="text-red-500 hover:text-red-700 cursor-pointer"
          onClick={() => handleDeleteRow(index)}
        />
      ),
    },
  ];

// Define a type with an index signature
type FormDataType = {
  [key: string]: string; // ✅ Allows indexing with a string key
};

// State for input fields
const [formData, setFormData] = useState<FormDataType>({
  orderId: "",
  storeId: "",
  billNo: "",
  billDate: "",
  creditPeriod: "",
  paymentDueDate: "",
  supplier: "",
  invoiceAmount: "",
});

// Handle input changes
const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { id, value } = e.target;
  setFormData((prev) => ({ ...prev, [id]: value }));
};

const handleSupplierDrawer =() =>{
  setDrawerContent(<AddSupplier />);
  setShowDrawer(true)
 }

 const handleItemDrawer =() =>{
  setDrawerContent(<AddItem />);
  setShowDrawer(true)
 }

  return (
    <> 

     {
      showDrawer && 
      <Drawer setShowDrawer={setShowDrawer}>{drawerContent}</Drawer>

     }
      <main className="space-y-6">
        <div className="flex justify-between">
          <div className="justify-start text-darkPurple text-3xl font-medium leading-10 ">
            Purchase Entry
          </div>

          <div>
            <Button
              onClick={() => handlePurchaseList()}
              label="Purchase List"
              value=""
              className="w-48 bg-darkPurple text-white"
              icon={<ClipboardList size={15} />}
            ></Button>
          </div>
        </div>

<div className="flex">
        <div>
            <Button
              onClick={() => handleSupplierDrawer()}
              label="Add Supplier"
              value=""
              className="w-48 bg-darkPurple text-white"
              icon={<ClipboardList size={15} />}
            ></Button>
          </div>

        <div>
            <Button
              onClick={() => handleItemDrawer()}
              label="Add Item"
              value=""
              className="w-48 bg-darkPurple text-white"
              icon={<ClipboardList size={15} />}
            ></Button>
          </div>
          </div>
        <div className="border border-Gray max-w-7xl h-64 rounded-lg p-5">
          <div className="justify-start text-black text-lg font-normal leading-7">
            Basic Details
          </div>


          <div className="relative mt-8 grid grid-cols-4 gap-4">
          {[
            { id: "orderId", label: "Order ID " },
            { id: "storeId", label: "Store" },
            { id: "billNo", label: "Bill No" },
            { id: "billDate", label: "Bill Date" },
          ].map(({ id, label }) => (
            <InputField key={id} id={id} label={label} value={formData[id]} onChange={handleInputChange} />
          ))}
        </div>


        <div className="relative mt-8 grid grid-cols-4 gap-4">
          {[
            { id: "creditPeriod", label: "Credit Period" },
            { id: "paymentDueDate", label: "Payment Due Date" },
            { id: "supplier", label: "Supplier" },
            { id: "invoiceAmount", label: "Invoice Amount" },
          ].map(({ id, label }) => (
            <InputField key={id} id={id} label={label} value={formData[id]} onChange={handleInputChange} />
          ))}
        </div>
        </div>

        <Table
          data={purchaseRows}
          columns={columns}
          noDataMessage="No purchase items found"
        />

     
        <div>
          <Button
            onClick={() => addNewRow()}
            label="Add New Item"
            value=""
            className="w-44 bg-gray"
            icon={<Plus size={15} />}
          ></Button>
        </div>

        <div className="border h-56 w-lg border-Gray rounded-xl p-6 space-y-6 ml-auto font-normal text-sm">
          {[
            { label: "SUB TOTAL", value: 1111 },
            { label: "GST", value: 1111 },
            { label: "DISCOUNT", value: 1111 },
            { label: "GRAND TOTAL", value: 1111, isTotal: true },
          ].map(({ label, value, isTotal }, index) => (
            <div
              key={index}
              className={`flex justify-between ${
                isTotal ? "font-semibold text-base bg-gray h-8 p-1 items-center rounded-lg" : ""
              }`}
            >
              <div>{label}</div>
              <div>{value}</div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
};

export default PurchaseEntry;
