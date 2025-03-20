"use client";
import Button from "@/app/components/common/Button";
import React, { useEffect, useState } from "react";
import { ClipboardList, Plus } from "lucide-react";
import { RiDeleteBin6Line } from "react-icons/ri";
import Table from "@/app/components/common/Table";
import { PurchaseEntryItem } from "@/app/types/PurchaseEntry";
import Drawer from "@/app/components/common/Drawer";
import AddItem from "../../item/components/AddItem";
import AddSupplier from "../../supplier/component/AddSupplier";
import InputField from "@/app/components/common/InputField";
import { ItemData } from "@/app/types/ItemData";
import { getItem } from "@/app/services/ItemService";

interface PurchaseEntryProps {
  setShowPurchaseEntry: (value: boolean) => void;
}

type FormDataType = {
  [key: string]: string; // ✅ Allows indexing with a string key
};

const PurchaseEntry: React.FC<PurchaseEntryProps> = ({
  setShowPurchaseEntry,
}) => {
  const [showDrawer, setShowDrawer] = useState<boolean>(false);
  const [purchaseRows, setPurchaseRows] = useState<PurchaseEntryItem[]>([
    {
      itemId: 0,
      batchNo: "",
      packageQuantity: 0,
      expiryDate: "",
      purchasePrice: 0,
      mrpSalePrice: 0,
      cgstPercentage: 0,
      sgstPercentage: 0,
      cgstAmount: 0,
      sgstAmount: 0,
      discount: 0,
      amount: 0,
      store: "",
    },
  ]);
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

  const [items, setItems] = useState<ItemData[]>([]);

useEffect(() => {
  const fetchItems = async () => {
    try {
      const data = await getItem();
      setItems(data); // Store fetched items in state
    } catch (error) {
      console.error("Failed to fetch items", error);
    }
  };

  fetchItems();
}, []);



const handleItemSelect = (e: React.ChangeEvent<HTMLSelectElement>, index: number) => {
  const selectedItem = items.find(item => item.itemId === Number(e.target.value));

  if (selectedItem) {
    const updatedRows = [...purchaseRows];
    updatedRows[index] = {
      ...updatedRows[index],
      itemId: selectedItem.itemId ?? 0,
      itemName: selectedItem.itemName, // ✅ Store itemName in state
    };
    setPurchaseRows(updatedRows);
  }
};


  const columns: {
    header: string;
    accessor:
      | keyof PurchaseEntryItem
      | ((row: PurchaseEntryItem, index: number) => React.ReactNode);
    className?: string;
  }[] = [
    {
      header: "Item Name",
      accessor: (row: PurchaseEntryItem, index: number) => (
        <select
          value={row.itemId}
          onChange={(e) => handleItemSelect(e, index)}
          className="border border-gray-300 p-2 rounded w-full text-left"
        >
          <option value="">Select Item</option>
          {items.map((item) => (
            <option key={item.itemId} value={item.itemId}>
              {item.itemName} 
          </option>
          ))}
        </select>
      ),
      className: "text-left",
    },
  
    {
      header: "Batch No",
      accessor: (row: PurchaseEntryItem, index: number) => (
        <div className="flex items-center gap-x-2">
          <input
            type="text"
            name="batchNo"
            value={row.batchNo}
            onChange={(e) => handleChange(e, index)}
            className="border border-Gray p-2 rounded w-28 text-left outline-none focus:ring-0 focus:outline-none"
          />
        </div>
      ),
      className: "text-left",
    },
    {
      header: "Package Qty",
      accessor: (row: PurchaseEntryItem, index: number) => (
        <div className="flex items-center gap-x-2">
          <input
            type="number"
            name="packageQuantity"
            value={row.packageQuantity}
            onChange={(e) => handleChange(e, index)}
            className="border border-Gray p-2 rounded w-24 text-left outline-none focus:ring-0 focus:outline-none"
          />
        </div>
      ),
      className: "text-left",
    },
    {
      header: "Expiry Date",
      accessor: (row: PurchaseEntryItem, index: number) => (
        <div className="flex items-center gap-x-2">
          <input
            type="date"
            name="expiryDate"
            value={row.expiryDate}
            onChange={(e) => handleChange(e, index)}
            className="border border-Gray p-2 rounded w-32 text-left outline-none focus:ring-0 focus:outline-none"
          />
        </div>
      ),
      className: "text-left",
    },
    { header: "Purchase Price", accessor: "purchasePrice", className: "text-left" },
    { header: "MRP", accessor: "mrpSalePrice", className: "text-left" },
    { header: "GST %", accessor: "cgstPercentage", className: "text-left" },
    { header: "GST", accessor: "cgstAmount", className: "text-left" },
    { header: "Discount", accessor: "discount", className: "text-left" },
    { header: "Amount", accessor: "amount", className: "text-left" },
    {
      header: "Action",
      accessor: (row: PurchaseEntryItem, index: number) => (
        <RiDeleteBin6Line
          className="text-red-500 hover:text-red-700 cursor-pointer"
          onClick={() => handleDeleteRow(index)}
        />
      ),
      className: "text-left",
    },
  ];
  

  const [showSupplier, setShowSupplier] = useState(false);
  const [showItem, setShowItem] = useState(false);

  // Handle Input Change in Rows
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const { name, value } = e.target;
    const updatedRows = [...purchaseRows];
  
    // Convert numbers properly
    updatedRows[index] = {
      ...updatedRows[index],
      [name]: name === "packageQuantity" ? Number(value) : value,
    };
  
    setPurchaseRows(updatedRows);
  };
  

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
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
        cgstPercentage: 0,
        sgstPercentage: 0,
        cgstAmount: 0, 
        sgstAmount: 0, 
        discount: 0, // ✅ Ensure number type
        amount: 0, // ✅ Ensure number type
      },
    ]);
  };

  const handlePurchaseList = () => {
    setShowPurchaseEntry(false);
  };

  // Delete Row
  const handleDeleteRow = (index: number) => {
    setPurchaseRows(purchaseRows.filter((_, i) => i !== index));
  };

  const handleSupplierDrawer = () => {
    setShowItem(false);  // ✅ Close Item Drawer
    setShowSupplier(true);
    setShowDrawer(true);
  };
  
  const handleItemDrawer = () => {
    setShowSupplier(false);  // ✅ Close Supplier Drawer
    setShowItem(true);
    setShowDrawer(true);
  };
  

  const handleCloseDrawer = () => {
    setShowDrawer(false);
    setShowItem(false);  // ✅ Ensures the drawer unmounts
    setShowSupplier(false);  // ✅ Ensures the drawer unmounts
  };
  

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      billDate: new Date().toISOString().split("T")[0], // Set today's date
    }));
  }, []);
  

  useEffect(() => {
    if (formData.creditPeriod && formData.billDate) {
      const billDate = new Date(formData.billDate);
      billDate.setDate(billDate.getDate() + parseInt(formData.creditPeriod, 10) || 0);
      setFormData((prev) => ({
        ...prev,
        paymentDueDate: billDate.toISOString().split("T")[0],
      }));
    }
  }, [formData.creditPeriod, formData.billDate]);

  return (
    <>
      {showItem && (
        <Drawer setShowDrawer={handleCloseDrawer} title={"Add Item"}>
          <AddItem setShowDrawer={handleCloseDrawer}/>
        </Drawer>
      )}

      {showSupplier && (
        <Drawer setShowDrawer={handleCloseDrawer} title={"Add Supplier"}>
          <AddSupplier setShowDrawer={handleCloseDrawer}/>
        </Drawer>
      )}


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
              { id: "billDate", label: "Bill Date", type: "date" },
            ].map(({ id, label,type }) => (
              <InputField
                key={id}
                id={id}
                label={label}
                type={type}
                value={formData[id]}
                onChange={handleInputChange}
              />
            ))}
          </div>

          <div className="relative mt-8 grid grid-cols-4 gap-4">
  {[
    { id: "creditPeriod", label: "Credit Period", type: "number" },
    { id: "paymentDueDate", label: "Payment Due Date", type: "date" },
    { id: "supplier", label: "Supplier", type: "text" },
    { id: "invoiceAmount", label: "Invoice Amount", type: "number" },
  ].map(({ id, label, type }) => (
    <InputField
      key={id}
      id={id}
      label={label}
      type={type}
      value={
        id === "paymentDueDate"
          ? formData.billDate && formData.creditPeriod
            ? new Date(
                new Date(formData.billDate).setDate(
                  new Date(formData.billDate).getDate() + parseInt(formData.creditPeriod, 10) || 0
                )
              )
                .toISOString()
                .split("T")[0]
            : ""
          : formData[id] ?? "" 
      }
      onChange={id === "paymentDueDate" ? () => {} : handleInputChange} // No onChange for paymentDueDate
      readOnly={id === "paymentDueDate"} 
    />
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
                isTotal
                  ? "font-semibold text-base bg-gray h-8 p-1 items-center rounded-lg"
                  : ""
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
