"use client";
import Button from "@/app/components/common/Button";
import React, { useEffect, useState } from "react";
import { ClipboardList, Plus } from "lucide-react";
import { RiDeleteBin6Line } from "react-icons/ri";
import Table from "@/app/components/common/Table";
import {
  PurchaseEntryData,
  PurchaseEntryItem,
} from "@/app/types/PurchaseEntry";
import Drawer from "@/app/components/common/Drawer";
import AddItem from "../../item/components/AddItem";
import AddSupplier from "../../supplier/component/AddSupplier";
import InputField from "@/app/components/common/InputField";
import { ItemData } from "@/app/types/ItemData";
import { getItem, getItemById } from "@/app/services/ItemService";
import {
  getPurchaseOrder,
  getPurchaseOrderById,
} from "@/app/services/PurchaseOrder";
import { PurchaseOrderData } from "@/app/types/PurchaseOrderData";
import { createPurchase } from "@/app/services/PurchaseEntryService";
import { getPharmacyById } from "@/app/services/PharmacyService";
import { PharmacyData } from "@/app/types/PharmacyData";
import { getSupplierById } from "@/app/services/SupplierService";

interface PurchaseEntryProps {
  setShowPurchaseEntry: (value: boolean) => void;
}

type FormDataType = {
  [key: string]: string; // ✅ Allows indexing with a string key
};

const PurchaseEntry: React.FC<PurchaseEntryProps> = ({
  setShowPurchaseEntry,
}) => {
  const [orderPurchase, setOrderPurchase] = useState<PurchaseOrderData[]>([]);
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
      purchasePricePerUnit: 0,
      mrpSalePricePerUnit: 0,
      sgstPercentage: 0,
      gstPercentage: 0,
      cgstAmount: 0,
      sgstAmount: 0,
      gstAmount: 0,
      discount: 0,
      amount: 0,
      pharmacyId: "",
    },
  ]);

  const [formData, setFormData] = useState<PurchaseEntryData>({
    orderId: "",
    purchaseDate: new Date(), // Default to current date
    purchaseBillNo: "",
    creditPeriod: 0,
    paymentDueDate: new Date(), // Default to current date
    supplierId: "",
    invoiceAmount: 0,
    paymentStatus: "",
    goodStatus: "",
    totalAmount: 0,
    totalCgst: 0,
    totalSgst: 0,
    totalDiscount: 0,
    grandTotal: 0,
    stockItemDtos: [], // Initially empty array for stock items
  });

  const [items, setItems] = useState<ItemData[]>([]);
  const [subTotal, setSubTotal] = useState(0);
  const [gstTotal, setGstTotal] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);

  const [purchaseOrderData, setPurchaseOrderData] = useState<PurchaseOrderData>(
    {
      orderId: "",
      orderId1: "",
      pharmacyId: "",
      pharmacistId: 0,
      supplierId: 0,
      orderedDate: new Date(),
      intendedDeliveryDate: new Date(),
      totalAmount: 0,
      totalGst: 0,
      grandTotal: 0,
      purchaseOrderItemDtos: [],
    }
  );

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

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await getPurchaseOrder(); // Fetch data from API
        setOrderPurchase(data); // Assume API returns an array of objects [{ orderId, orderId1 }]
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchOrders();
  }, []);

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
          onChange={(e) => handleChange(e, index)}
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
    {
      header: "Purchase Price",
      accessor: "purchasePrice",
      className: "text-left",
    },
    { header: "MRP", accessor: "mrpSalePrice", className: "text-left" },
    { header: "GST %", accessor: "gstPercentage", className: "text-left" },
    { header: "GST", accessor: "gstAmount", className: "text-left" },
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    index: number
  ) => {
    const { name, value } = e.target;
    const updatedRows = [...purchaseRows];

    let updatedValue: number | string = value;
    if (name === "packageQuantity") {
      updatedValue = Number(value) || 0; // Ensure it's a number
    }

    // Update the row with the new value
    updatedRows[index] = {
      ...updatedRows[index],
      [name]: updatedValue,
    };

    // If package quantity is changed, recalculate amount and GST
    if (name === "packageQuantity") {
      const packageQuantity = Number(value) || 0;
      const purchasePrice = updatedRows[index].purchasePrice || 0;

      // ✅ Correct Amount Calculation
      const amount = packageQuantity * purchasePrice;

      // ✅ Correct GST Calculation
      const gstPercentage = updatedRows[index].gstPercentage || 0;
      const gstAmount = (amount * gstPercentage) / 100;

      // ✅ Correct CGST & SGST Calculation
      const cgstAmount = gstAmount / 2; // Assuming CGST and SGST are equal
      const sgstAmount = gstAmount / 2;

      // Update the row with new calculated values
      updatedRows[index] = {
        ...updatedRows[index],
        amount,
        gstAmount,
        cgstAmount,
        sgstAmount,
      };
    }

    setPurchaseRows(updatedRows);
  };

  // Handle input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  // ✅ Corrected Function to Add a New Row
  const addNewRow = () => {
    setPurchaseRows([
      ...purchaseRows,
      {
        itemId: 0,
        pharmacyId: "",
        batchNo: "",
        packageQuantity: 0,
        expiryDate: "",
        purchasePrice: 0,
        mrpSalePrice: 0,
        purchasePricePerUnit: 0,
        mrpSalePricePerUnit: 0,
        cgstPercentage: 0,
        sgstPercentage: 0,
        gstPercentage: 0,
        cgstAmount: 0,
        sgstAmount: 0,
        gstAmount: 0,
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
    setShowItem(false); // ✅ Close Item Drawer
    setShowSupplier(true);
    setShowDrawer(true);
  };

  const handleItemDrawer = () => {
    setShowSupplier(false); // ✅ Close Supplier Drawer
    setShowItem(true);
    setShowDrawer(true);
  };

  const handleCloseDrawer = () => {
    setShowDrawer(false);
    setShowItem(false); // ✅ Ensures the drawer unmounts
    setShowSupplier(false); // ✅ Ensures the drawer unmounts
  };

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      billDate: new Date().toISOString().split("T")[0], // Set today's date
    }));
  }, []);

  useEffect(() => {
    if (formData.creditPeriod && formData.purchaseDate) {
      const purchaseDate = new Date(formData.purchaseDate); // ✅ Use correct field
      const creditPeriod = Number(formData.creditPeriod); // ✅ Ensure it's a number

      if (!isNaN(creditPeriod) && !isNaN(purchaseDate.getTime())) {
        // ✅ Ensure valid inputs
        const paymentDueDate = new Date(purchaseDate);
        paymentDueDate.setDate(paymentDueDate.getDate() + creditPeriod); // ✅ Correct calculation

        setFormData((prev) => ({
          ...prev,
          paymentDueDate, // ✅ Store as a Date object
        }));
      }
    }
  }, [formData.creditPeriod, formData.purchaseDate]); // ✅ Ensure useEffect runs when creditPeriod or purchaseDate changes

  // const handleOrderSelect = async (e: React.ChangeEvent<HTMLSelectElement>) => {
  //   console.log("Order selection triggered!");

  //   const selectedOrderId = e.target.value.trim(); // Keep it as a string (UUID)

  //   if (!selectedOrderId) {
  //     console.warn("Order ID is empty or invalid!");
  //     return;
  //   }

  //   // Store orderId as a string (UUID)
  //   setFormData((prev) => ({ ...prev, orderId: selectedOrderId }));

  //   try {
  //     const purchaseOrder = await getPurchaseOrderById(selectedOrderId); // Fetch using UUID

  //     if (purchaseOrder?.purchaseOrderItemDtos) {
  //       // Step 1: Prepare the rows with basic order data
  //       let updatedRows: PurchaseEntryItem[] =
  //         purchaseOrder.purchaseOrderItemDtos.map(
  //           (item: any): PurchaseEntryItem => ({
  //             itemId: item.itemId,
  //             itemName: item.itemName,
  //             batchNo: item.batchNo || "",
  //             packageQuantity: item.packageQuantity || 0,
  //             expiryDate: item.expiryDate || "",
  //             purchasePrice: item.purchasePrice || 0,
  //             mrpSalePrice: item.mrpSalePrice || 0,
  //             cgstPercentage: item.cgstPercentage || 0,
  //             sgstPercentage: item.sgstPercentage || 0,
  //             cgstAmount: item.cgstAmount || 0,
  //             sgstAmount: item.sgstAmount || 0,
  //             gstAmount: item.gstAmount || 0,
  //             discount: item.discount || 0,
  //             amount: item.amount || 0,
  //             pharmacyId: item.pharmacyId || "",
  //             gstPercentage:
  //               (item.cgstPercentage || 0) + (item.sgstPercentage || 0),
  //           })
  //         );

  //       setPurchaseRows(updatedRows);

  //       // Step 2: Fetch additional item details for each row
  //       updatedRows = await Promise.all(
  //         updatedRows.map(
  //           async (row: PurchaseEntryItem): Promise<PurchaseEntryItem> => {
  //             try {
  //               const itemDetails = await getItemById(row.itemId.toString());

  //               return {
  //                 ...row,
  //                 purchasePrice: itemDetails.purchasePrice ?? row.purchasePrice,
  //                 mrpSalePrice: itemDetails.mrpSalePrice ?? row.mrpSalePrice,
  //                 cgstPercentage:
  //                   itemDetails.cgstPercentage ?? row.cgstPercentage,
  //                 sgstPercentage:
  //                   itemDetails.sgstPercentage ?? row.sgstPercentage,
  //                 gstPercentage:
  //                   (itemDetails.cgstPercentage ?? 0) +
  //                   (itemDetails.sgstPercentage ?? 0), // ✅ Update GST Percentage
  //               };
  //             } catch (error) {
  //               console.error(
  //                 "Error fetching item details for itemId:",
  //                 row.itemId,
  //                 error
  //               );
  //               return row; // Keep the original row if fetching fails
  //             }
  //           }
  //         )
  //       );

  //       setPurchaseRows(updatedRows); // Update the state with complete data

  //     } else {
  //       setPurchaseRows([]);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching purchase order items:", error);
  //   }
  // };

  const handleOrderSelect = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    console.log("Order selection triggered!");

    const selectedOrderId = e.target.value.trim(); // Keep it as a string (UUID)

    if (!selectedOrderId) {
      console.warn("Order ID is empty or invalid!");
      return;
    }

    // Store orderId as a string (UUID)
    setFormData((prev) => ({ ...prev, orderId: selectedOrderId }));

    try {
      const purchaseOrder = await getPurchaseOrderById(selectedOrderId); // Fetch using UUID

      if (purchaseOrder?.purchaseOrderItemDtos) {
        // ✅ Fetch pharmacyId from purchase order
        const pharmacyId = purchaseOrder.pharmacyId || ""; // ✅ Fix: Define pharmacyId properly
        const supplierId = purchaseOrder.supplierId || "";

        // Step 1: Prepare the rows with basic order data
        let updatedRows: PurchaseEntryItem[] =
          purchaseOrder.purchaseOrderItemDtos.map(
            (item: any): PurchaseEntryItem => ({
              itemId: item.itemId,
              itemName: item.itemName,
              batchNo: item.batchNo || "",
              packageQuantity: item.packageQuantity || 0,
              expiryDate: item.expiryDate || "",
              purchasePrice: item.purchasePrice || 0,
              mrpSalePrice: item.mrpSalePrice || 0,
              purchasePricePerUnit: item.purchasePricePerUnit || 0,
              mrpSalePricePerUnit: item.mrpSalePricePerUnit || 0,
              cgstPercentage: item.cgstPercentage || 0,
              sgstPercentage: item.sgstPercentage || 0,
              cgstAmount: item.cgstAmount || 0,
              sgstAmount: item.sgstAmount || 0,
              gstAmount: item.gstAmount || 0,
              discount: item.discount || 0,
              amount: item.amount || 0,
              pharmacyId,
              gstPercentage:
                (item.cgstPercentage || 0) + (item.sgstPercentage || 0),
            })
          );

        setPurchaseRows(updatedRows);

        // Step 2: Fetch additional item details for each row
        updatedRows = await Promise.all(
          updatedRows.map(
            async (row: PurchaseEntryItem): Promise<PurchaseEntryItem> => {
              try {
                const itemDetails = await getItemById(row.itemId.toString());

                return {
                  ...row,
                  purchasePrice: itemDetails.purchasePrice ?? row.purchasePrice,
                  mrpSalePrice: itemDetails.mrpSalePrice ?? row.mrpSalePrice,
                  cgstPercentage:
                    itemDetails.cgstPercentage ?? row.cgstPercentage,
                  sgstPercentage:
                    itemDetails.sgstPercentage ?? row.sgstPercentage,
                  gstPercentage:
                    (itemDetails.cgstPercentage ?? 0) +
                    (itemDetails.sgstPercentage ?? 0), // ✅ Update GST Percentage
                };
              } catch (error) {
                console.error(
                  "Error fetching item details for itemId:",
                  row.itemId,
                  error
                );
                return row; // Keep the original row if fetching fails
              }
            }
          )
        );

        setPurchaseRows(updatedRows); // Update the state with complete data

        // ✅ Step 3: Fetch Pharmacy Name using pharmacyId
        if (pharmacyId) {
          try {
            console.log(
              "Fetching pharmacy details for pharmacyId:",
              pharmacyId
            );

            const response = await getPharmacyById(pharmacyId);
            console.log("Pharmacy API Response:", response); // ✅ Debugging Output

            // ✅ Extract the pharmacy data correctly
            const pharmacy = response?.data; // Extract the `data` object

            setFormData((prev) => ({
              ...prev,
              pharmacyId, // ✅ Store pharmacyId
              pharmacyName: pharmacy?.pharmacyName || "N/A", // ✅ Store pharmacyName correctly
            }));
          } catch (error) {
            console.error(
              "Error fetching pharmacy details for pharmacyId:",
              pharmacyId,
              error
            );
            setFormData((prev) => ({
              ...prev,
              pharmacyId,
              pharmacyName: "N/A",
            }));
          }
        }

        if (supplierId) {
          try {
            console.log(
              "Fetching supplier details for supplierId:",
              supplierId
            );

            const supplier = await getSupplierById(supplierId); // ✅ No `.data` needed
            console.log("Supplier API Response:", supplier); // ✅ Debugging Output

            setFormData((prev) => ({
              ...prev,
              supplierId, // ✅ Store supplierId
              supplierName: supplier?.supplierName || "N/A", // ✅ Store supplierName correctly
            }));
          } catch (error) {
            console.error(
              "Error fetching supplier details for supplierId:",
              supplierId,
              error
            );
            setFormData((prev) => ({
              ...prev,
              supplierId,
              supplierName: "N/A",
            }));
          }
        }
      } else {
        setPurchaseRows([]);
      }
    } catch (error) {
      console.error("Error fetching purchase order items:", error);
    }
  };

  useEffect(() => {
    const newSubTotal = purchaseRows.reduce(
      (sum, row) => sum + (row.amount || 0),
      0
    );

    // ✅ Fix GST Total Calculation
    const newGstTotal = purchaseRows.reduce(
      (sum, row) => sum + (row.gstAmount || 0),
      0
    );

    const newGrandTotal = newSubTotal + newGstTotal;

    setSubTotal(newSubTotal);
    setGstTotal(newGstTotal);
    setGrandTotal(newGrandTotal);
  }, [purchaseRows]);

  useEffect(() => {
    const newSubTotal = purchaseRows.reduce(
      (sum, row) => sum + (row.amount || 0),
      0
    );

    // ✅ Fix GST Total Calculation
    const newGstTotal = purchaseRows.reduce(
      (sum, row) => sum + (row.gstAmount || 0),
      0
    );

    const newGrandTotal = newSubTotal + newGstTotal;

    setSubTotal(newSubTotal);
    setGstTotal(newGstTotal);
    setGrandTotal(newGrandTotal);
  }, [purchaseRows]);

  const addPurchase = async () => {
    // Ensure there is at least one item to save
    if (purchaseRows.length === 0) {
      alert("Please add at least one purchase item before submitting.");
      return;
    }

    // Constructing the payload
    const purchaseData: PurchaseEntryData = {
      orderId: formData.orderId,
      purchaseBillNo: formData.purchaseBillNo,
      purchaseDate: new Date(formData.purchaseDate),
      creditPeriod: formData.creditPeriod
        ? Number(formData.creditPeriod)
        : undefined,
      paymentDueDate: formData.paymentDueDate
        ? new Date(formData.paymentDueDate)
        : undefined,
      supplierId: formData.supplierId,
      invoiceAmount: formData.invoiceAmount
        ? Number(formData.invoiceAmount)
        : undefined,
      totalAmount: subTotal,
      totalCgst: gstTotal,
      totalSgst: gstTotal,
      grandTotal: grandTotal,
      stockItemDtos: purchaseRows.map((row) => ({
        itemId: row.itemId,
        batchNo: row.batchNo,
        packageQuantity: row.packageQuantity,
        expiryDate: row.expiryDate,
        purchasePrice: row.purchasePrice,
        mrpSalePrice: row.mrpSalePrice,
        purchasePricePerUnit: row.purchasePricePerUnit,
        mrpSalePricePerUnit: row.mrpSalePricePerUnit,
        cgstPercentage: row.cgstPercentage,
        sgstPercentage: row.sgstPercentage,
        gstPercentage: row.gstPercentage,
        cgstAmount: row.cgstAmount,
        sgstAmount: row.sgstAmount,
        gstAmount: row.gstAmount,
        discount: row.discount,
        amount: row.amount,
        pharmacyId: row.pharmacyId,
      })),
      paymentStatus: "",
      goodStatus: "",
    };

    try {
      const response = await createPurchase(purchaseData);
      alert("Purchase entry added successfully!");
      console.log("Purchase Saved:", response);

      // Reset Form & Table after successful submission
      setFormData({
        orderId: "",
        purchaseDate: new Date(), // Default to current date
        purchaseBillNo: "",
        creditPeriod: 0,
        paymentDueDate: new Date(), // Default to current date
        supplierId: "",
        invoiceAmount: 0,
        paymentStatus: "",
        goodStatus: "",
        totalAmount: 0,
        totalCgst: 0,
        totalSgst: 0,
        totalDiscount: 0,
        grandTotal: 0,
        stockItemDtos: [],
      });
      setPurchaseRows([]); // Clear purchase rows after saving
    } catch (error) {
      console.error("Error adding purchase:", error);
      alert("Failed to add purchase. Please try again.");
    }
  };

  return (
    <>
      {showItem && (
        <Drawer setShowDrawer={handleCloseDrawer} title={"Add New Item"}>
          <AddItem setShowDrawer={handleCloseDrawer} />
        </Drawer>
      )}

      {showSupplier && (
        <Drawer setShowDrawer={handleCloseDrawer} title={"Add New Supplier"}>
          <AddSupplier setShowDrawer={handleCloseDrawer} />
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
              { id: "orderId", label: "Order ID", type: "select" },
              { id: "pharmacyName", label: "Pharmacy" },
              { id: "purchaseBillNo", label: "Bill No" },
              { id: "billDate", label: "Bill Date", type: "date" },
            ].map(({ id, label, type }) => (
              <div key={id} className="relative w-72">
                {id === "orderId" ? (
                  <>
                    {/* Floating Label Stays on Top */}
                    <label
                      htmlFor={id}
                      className="absolute left-3 top-0 -translate-y-1/2 bg-white px-1 text-gray-500 text-xs transition-all"
                    >
                      {label}
                    </label>

                    <select
                      id="orderId"
                      value={formData.orderId || ""}
                      onChange={handleOrderSelect}
                      className="peer w-full px-3 py-3 border border-gray-400 rounded-md bg-transparent text-black outline-none focus:border-purple-900 focus:ring-0"
                    >
                      <option value="" disabled>
                        Select Order
                      </option>
                      {orderPurchase.map((order) => (
                        <option
                          key={order.orderId ?? "unknown"}
                          value={order.orderId?.toString() || ""}
                        >
                          {order.orderId1 || "Unknown Order"}
                        </option>
                      ))}
                    </select>
                  </>
                ) : (
                  <InputField
                    id={id}
                    label={label}
                    type={type}
                    value={
                      formData[id as keyof PurchaseEntryData]?.toString() ?? ""
                    }
                    onChange={handleInputChange}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="relative mt-8 grid grid-cols-4 gap-4">
            {[
              { id: "creditPeriod", label: "Credit Period", type: "number" },
              { id: "paymentDueDate", label: "Payment Due Date", type: "date" },
              { id: "supplierName", label: "Supplier", type: "text" },
              { id: "invoiceAmount", label: "Invoice Amount", type: "number" },
            ].map(({ id, label, type }) => (
              <InputField
                key={id}
                id={id}
                label={label}
                type={type}
                value={
                  id === "paymentDueDate" && formData.paymentDueDate
                    ? new Date(formData.paymentDueDate)
                        .toISOString()
                        .split("T")[0] // ✅ Convert Date to YYYY-MM-DD
                    : formData[id as keyof PurchaseEntryData]?.toString() ?? ""
                }
                onChange={
                  id === "paymentDueDate" ? () => {} : handleInputChange
                } // Prevents editing Payment Due Date
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
            { label: "SUB TOTAL", value: subTotal.toFixed(2) },
            { label: "GST TOTAL", value: gstTotal.toFixed(2) }, // ✅ Fix GST Total Display
            { label: "DISCOUNT", value: 0 },
            {
              label: "GRAND TOTAL",
              value: grandTotal.toFixed(2),
              isTotal: true,
            },
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
              <div>₹{value}</div>
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <Button
            onClick={addPurchase}
            label="Save"
            value=""
            className="w-28 bg-darkPurple text-white"
          ></Button>
        </div>
      </main>
    </>
  );
};

export default PurchaseEntry;
