"use client";
import Button from "@/app/components/common/Button";
import React, { useState } from "react";
import { ClipboardList, Plus } from "lucide-react";
import { RiDeleteBin6Line } from "react-icons/ri";
import Table from "@/app/components/common/Table";
import { PurchaseEntryItem } from "@/app/types/PurchaseEntry";

interface PurchaseEntryProps {
  setShowPurchaseEntry: (value: boolean) => void;
}

const PurchaseEntry: React.FC<PurchaseEntryProps> = ({
  setShowPurchaseEntry,
}) => {
  const handlePurchaseList = () => {
    setShowPurchaseEntry(false);
  };

  const [isFocused, setIsFocused] = useState(false);
  const [value, setValue] = useState("");

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
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
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
      itemId: 0, // ✅ Use itemId instead of itemName
      store: "",
      batchNo: "",
      packageQuantity: 0, // ✅ Ensure number type
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
    accessor: keyof PurchaseEntryItem | ((row: PurchaseEntryItem, index: number) => React.ReactNode);
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
  
  return (
    <>
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
              icon={<ClipboardList  size={15} />}
            ></Button>
          </div>
        </div>

        <div className="border border-Gray max-w-7xl h-64 rounded-lg p-5">
          <div className="justify-start text-black text-lg font-normal leading-7">
            Basic Details
          </div>

          <div className="relative mt-8 grid grid-cols-4 gap-4">
            {/* Order ID Input */}
            <div className="relative">
              <input
                type="text"
                id="orderId"
                required
                className="peer w-72 px-3 py-3 border border-gray-400 rounded-md bg-transparent text-black outline-none focus:border-purple-900 focus:ring-0"
              />
              <label
                htmlFor="orderId"
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-white px-1 text-gray-500 text-sm transition-all 
        peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm
        peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-xs peer-focus:text-purple-950 peer-focus:px-1"
              >
                Order ID
              </label>
            </div>

            <div className="relative">
              <input
                type="text"
                id="storeId"
                required
                className="peer w-72 px-3 py-3 border border-gray-400 rounded-md bg-transparent text-black outline-none focus:border-purple-900 focus:ring-0"
              />
              <label
                htmlFor="storeId"
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-white px-1 text-gray-500 text-sm transition-all 
        peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm
        peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-xs peer-focus:text-purple-950 peer-focus:px-1"
              >
                Store
              </label>
            </div>


            <div className="relative">
              <input
                type="text"
                id="billNo"
                required
                className="peer w-72 px-3 py-3 border border-gray-400 rounded-md bg-transparent text-black outline-none focus:border-purple-900 focus:ring-0"
              />
              <label
                htmlFor="billNo"
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-white px-1 text-gray-500 text-sm transition-all 
        peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm
        peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-xs peer-focus:text-purple-950 peer-focus:px-1"
              >
                Bill No
              </label>
            </div>



            <div className="relative">
              <input
                type="text"
                id="billDate"
                required
                className="peer w-72 px-3 py-3 border border-gray-400 rounded-md bg-transparent text-black outline-none focus:border-purple-900 focus:ring-0"
              />
              <label
                htmlFor="billDate"
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-white px-1 text-gray-500 text-sm transition-all 
        peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm
        peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-xs peer-focus:text-purple-950 peer-focus:px-1"
              >
                Bill Date
              </label>
            </div>



          </div>


          <div className="relative mt-8 grid grid-cols-4 gap-4">
 
            <div className="relative">
              <input
                type="text"
                id="creditPeriod"
                required
                className="peer w-72 px-3 py-3 border border-gray-400 rounded-md bg-transparent text-black outline-none focus:border-purple-900 focus:ring-0"
              />
              <label
                htmlFor="creditPeriod"
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-white px-1 text-gray-500 text-sm transition-all 
        peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm
        peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-xs peer-focus:text-purple-950 peer-focus:px-1"
              >
               Credit Period
              </label>
            </div>

            <div className="relative">
              <input
                type="text"
                id="paymentDueDate"
                required
                className="peer w-72 px-3 py-3 border border-gray-400 rounded-md bg-transparent text-black outline-none focus:border-purple-900 focus:ring-0"
              />
              <label
                htmlFor="paymentDueDate"
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-white px-1 text-gray-500 text-sm transition-all 
        peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm
        peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-xs peer-focus:text-purple-950 peer-focus:px-1"
              >
                Payment Due Date
              </label>
            </div>


            <div className="relative">
              <input
                type="text"
                id="supplier"
                required
                className="peer w-72 px-3 py-3 border border-gray-400 rounded-md bg-transparent text-black outline-none focus:border-purple-900 focus:ring-0"
              />
              <label
                htmlFor="supplier"
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-white px-1 text-gray-500 text-sm transition-all 
        peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm
        peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-xs peer-focus:text-purple-950 peer-focus:px-1"
              >
               Supplier
              </label>
            </div>



            <div className="relative">
              <input
                type="text"
                id="invoiceAmount"
                required
                className="peer w-72 px-3 py-3 border border-gray-400 rounded-md bg-transparent text-black outline-none focus:border-purple-900 focus:ring-0"
              />
              <label
                htmlFor="invoiceAmount"
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-white px-1 text-gray-500 text-sm transition-all 
        peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm
        peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-xs peer-focus:text-purple-950 peer-focus:px-1"
              >
                Invoice Amount
              </label>
            </div>



          </div>
        </div>



        <Table
          data={purchaseRows}
          columns={columns}
          noDataMessage="No purchase items found"
        />

        {/* ✅ Add New Row Button */}
        <div>
                  <Button
                    onClick={() => addNewRow()}
                    label="Add New Item"
                    value=""
                    className="w-44 bg-gray"
                    icon={<Plus size={15} />}
                  ></Button>
                </div>

       <div className="border h-64 w-lg border-Gray rounded-xl bg-gray p-6 space-y-8">
        <div>SUB TOTAL</div>
        <div>GST</div>
        <div>DISCOUNT</div>
        <div>GRAND TOTAL</div>

       </div>
      </main>
    </>
  );
};

export default PurchaseEntry;
