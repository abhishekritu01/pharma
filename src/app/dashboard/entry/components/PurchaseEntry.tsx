"use client";
import Button from "@/app/components/common/Button";
import React, { useEffect, useState } from "react";
import { ClipboardList, Plus } from "lucide-react";
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
} from "@/app/services/PurchaseOrderService";
import { PurchaseOrderData } from "@/app/types/PurchaseOrderData";
import { createPurchase } from "@/app/services/PurchaseEntryService";
import { getPharmacyById } from "@/app/services/PharmacyService";
import { getSupplier, getSupplierById } from "@/app/services/SupplierService";
import { toast } from "react-toastify";
import Modal from "@/app/components/common/Modal";
import { BsThreeDotsVertical } from "react-icons/bs";
import {
  handleNumericChange,
  restrictInvalidNumberKeys,
} from "@/app/components/common/RestrictedVal";
import { SupplierData } from "@/app/types/SupplierData";
import AsyncSelect from "react-select/async";
import { customSelectStyles } from "@/app/components/common/DropdownStyle";

interface PurchaseEntryProps {
  setShowPurchaseEntry: (value: boolean) => void;
}

type OrderSuggestion = {
  orderId: string;
  orderId1: string;
};

type OptionType = {
  label: string;
  value: string;
};

const PurchaseEntry: React.FC<PurchaseEntryProps> = ({
  setShowPurchaseEntry,
}) => {
  const [modalConfirmCallback, setModalConfirmCallback] = useState<
    () => Promise<void> | void
  >(() => {});
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalSecondaryMessage, setModalSecondaryMessage] = useState("");
  const [modalBgClass, setModalBgClass] = useState("");
  const [modalCancelCallback, setModalCancelCallback] = useState<() => void>(
    () => {}
  );
  const [currentItemId, setCurrentItemId] = useState<string | null>(null);
  const [orderSuggestions, setOrderSuggestions] = useState<OrderSuggestion[]>(
    []
  );
  const [filteredSuggestions, setFilteredSuggestions] = useState<
    OrderSuggestion[]
  >([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  interface ModalOptions {
    message: string;
    secondaryMessage?: string;
    bgClassName?: string;
    onConfirmCallback: () => Promise<void> | void;
    onCancelCallback?: () => void;
  }

  const [suppliers, setSuppliers] = useState<SupplierData[]>([]);

  const [, setShowDrawer] = useState<boolean>(false);
  const [purchaseRows, setPurchaseRows] = useState<PurchaseEntryItem[]>([
    {
      itemId: "",
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
    orderId1: "",
    purchaseDate: new Date(),
    purchaseBillNo: "",
    creditPeriod: 0,
    paymentDueDate: new Date(),
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

  const [items, setItems] = useState<ItemData[]>([]);
  const [subTotal, setSubTotal] = useState(0);
  const [gstTotal, setGstTotal] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);
  const [showSupplier, setShowSupplier] = useState(false);
  const [showItem, setShowItem] = useState(false);

  // const [supplierSuggestions, setSupplierSuggestions] = useState<
  //   SupplierData[]
  // >([]);
  // const [filteredSupplierSuggestions, setFilteredSupplierSuggestions] =
  //   useState<SupplierData[]>([]);
  // const [, setShowSupplierSuggestions] = useState(false);
  const defaultItemOptions = [{ label: "+ Add New Item", value: "newItem" }];

  const fetchSuppliers = async () => {
    try {
      const supplierList = await getSupplier();
      setSuppliers(supplierList);
    } catch (error) {
      console.error("Failed to fetch suppliers:", error);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchItems = async () => {
    try {
      const data = await getItem();
      setItems(data);
    } catch (error) {
      console.error("Failed to fetch items", error);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    const fetchOrders = async () => {
      const res = await getPurchaseOrder();
      if (res.status === "success") {
        const orderIds = res.data.map((item: PurchaseOrderData) => ({
          orderId: item.orderId,
          orderId1: item.orderId1?.toString() || "",
        }));
        setOrderSuggestions(orderIds);
      }
    };

    fetchOrders();
  }, []);

  const loadItemOptions = async (inputValue: string) => {
    try {
      if (!inputValue.trim()) {
        return defaultItemOptions;
      }

      const allItems = await getItem();

      const filteredItems = allItems.filter((item: { itemName: string }) =>
        item.itemName.toLowerCase().includes(inputValue.toLowerCase())
      );

      const mappedItems = filteredItems.map(
        (item: { itemName: string; itemId: string }) => ({
          label: item.itemName,
          value: item.itemId,
        })
      );

      return [...defaultItemOptions, ...mappedItems];
    } catch (error) {
      console.error("Error loading item options:", error);
      return defaultItemOptions;
    }
  };

  const handleRowUpdate = (
    index: number,
    updatedFields: Partial<PurchaseEntryItem>
  ) => {
    setPurchaseRows((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, ...updatedFields } : item
      )
    );
  };

  const handleItemSelect = async (
    selectedOption: { value: string; label: string } | null,
    index: number
  ) => {
    if (!selectedOption) {
      handleRowUpdate(index, {
        itemId: "",
        itemName: "",
        batchNo: "",
        packageQuantity: 0,
        expiryDate: "",
        purchasePrice: 0,
        mrpSalePrice: 0,
        gstPercentage: 0,
        gstAmount: 0,
        discount: 0,
        amount: 0,
      });
      return;
    }

    const value = selectedOption.value;

    if (value === "newItem") {
      handleItemDrawer();
      return;
    }

    try {
      const itemDetails = await getItemById(value);

      const updatedRow: Partial<PurchaseEntryItem> = {
        itemId: itemDetails.itemId,
        itemName: itemDetails.itemName,
        // batchNo: itemDetails.batchNo,
        // packageQuantity: itemDetails.packageQuantity,
        // expiryDate: itemDetails.expiryDate,
        purchasePrice: itemDetails.purchasePrice,
        mrpSalePrice: itemDetails.mrpSalePrice,
        gstPercentage: itemDetails.gstPercentage,
        // gstAmount: itemDetails.gstAmount,
        // discount: itemDetails.discount,
        amount:
          (itemDetails.purchasePrice || 0) *
          (purchaseRows[index]?.packageQuantity || 1),
      };

      handleRowUpdate(index, updatedRow);
    } catch (error) {
      console.error("Error fetching item details:", error);
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
        <AsyncSelect
          cacheOptions
          defaultOptions={defaultItemOptions}
          loadOptions={loadItemOptions}
          isClearable={true}
          value={
            row.itemId
              ? {
                  label:
                    row.itemName ||
                    items.find((i) => i.itemId === row.itemId)?.itemName ||
                    "",
                  value: row.itemId,
                }
              : null
          }
          onChange={(selectedOption) => handleItemSelect(selectedOption, index)}
          placeholder="Select or search item"
          className="text-left w-full"
          classNamePrefix="react-select"
          styles={customSelectStyles<OptionType>()}
        />
      ),
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
            onKeyDown={restrictInvalidNumberKeys}
            onChange={handleNumericChange((e) => handleChange(e, index))}
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
            onBlur={(e) => checkExpiry(e, index)}
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
        <div className="relative group">
          <button className="p-2 rounded-full hover:bg-gray-200 cursor-pointer">
            <BsThreeDotsVertical size={18} />
          </button>

          <div className="absolute right-0 mt-2 w-32 bg-white shadow-xl rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
            <button
              onClick={() => handleItemDrawer(row.itemId)}
              className="block w-full px-4 py-2 text-left text-gray-700 cursor-pointer hover:bg-purple-950 hover:text-white hover:rounded-lg whitespace-nowrap"
            >
              Edit Item Details
            </button>

            <button
              onClick={() => handleDeleteRow(index)}
              className="block w-full px-4 py-2 text-left text-gray-700 cursor-pointer hover:bg-purple-950 hover:text-white hover:rounded-lg"
            >
              Delete
            </button>
          </div>
        </div>
      ),
    },
  ];

  // const handleSupplierClick = (id: string, name: string) => {
  //   setFormData((prev) => ({
  //     ...prev,
  //     supplierId: id,
  //     supplierName: name,
  //   }));
  //   setShowSupplierSuggestions(false);
  // };

  // const handleItemSelection = async (
  //   e: React.ChangeEvent<HTMLSelectElement>,
  //   index: number
  // ) => {
  //   const value = e.target.value;

  //   if (value === "newItem") {
  //     handleItemDrawer();
  //     return;
  //   }

  //   try {
  //     const itemDetails = await getItemById(value);

  //     const updatedValues: Partial<PurchaseEntryItem> = {
  //       itemId: value,
  //       purchasePrice: itemDetails.purchasePrice || 0,
  //       mrpSalePrice: itemDetails.mrpSalePrice || 0,
  //       cgstPercentage: itemDetails.cgstPercentage || 0,
  //       sgstPercentage: itemDetails.sgstPercentage || 0,
  //       gstPercentage:
  //         (itemDetails.cgstPercentage || 0) + (itemDetails.sgstPercentage || 0),
  //     };

  //     handleChange(e, index, updatedValues);
  //   } catch (error) {
  //     console.error("Failed to fetch item details:", error);
  //     handleChange(e, index);
  //   }
  // };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    index: number,
    updatedValues?: Partial<PurchaseEntryItem>
  ) => {
    const { name, value } = e.target;
    const updatedRows = [...purchaseRows];

    let updatedValue: number | string = value;
    if (name === "packageQuantity") {
      updatedValue = Number(value) || 0;
    }

    updatedRows[index] = {
      ...updatedRows[index],
      [name]: updatedValue,
      ...updatedValues,
    };

    if (
      name === "packageQuantity" ||
      updatedValues?.purchasePrice !== undefined
    ) {
      const packageQuantity = updatedRows[index].packageQuantity || 0;
      const purchasePrice = updatedRows[index].purchasePrice || 0;

      const amount = packageQuantity * purchasePrice;
      const gstPercentage = updatedRows[index].gstPercentage || 0;
      const gstAmount = (amount * gstPercentage) / 100;

      const cgstAmount = gstAmount / 2;
      const sgstAmount = gstAmount / 2;

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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));

    if (id === "orderId") {
      const matches = orderSuggestions.filter((order) =>
        order.orderId1?.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredSuggestions(matches);
      setShowSuggestions(true);
    }
  };

  const handleSuggestionClick = async (orderId: string, orderId1: string) => {
    setFormData((prev) => ({ ...prev, orderId, orderId1 }));
    setShowSuggestions(false);

    const fakeEvent = {
      target: { value: orderId },
    } as React.ChangeEvent<HTMLSelectElement>;

    await handleOrderSelect(fakeEvent);
  };

  const addNewRow = () => {
    setPurchaseRows([
      ...purchaseRows,
      {
        itemId: "",
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
        discount: 0,
        amount: 0,
      },
    ]);
  };

  const checkExpiry = async (
    e: React.FocusEvent<HTMLInputElement, Element>,
    idx: number
  ) => {
    const enteredDate = new Date(e.target.value);
    const currentDate = new Date();
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(currentDate.getMonth() + 3);

    if (enteredDate < threeMonthsFromNow) {
      const userConfirmed = await new Promise<boolean>((resolve) => {
        handleShowModal({
          message:
            "The expiry date is less than 3 months away. Do you want to proceed?",
          secondaryMessage: "Confirm Expiry Date",
          bgClassName: "bg-darkPurple",
          onConfirmCallback: () => resolve(true),
          onCancelCallback: () => {
            // ✅ Clear from STATE (not input directly)
            setPurchaseRows((prev) =>
              prev.map((row, i) =>
                i === idx ? { ...row, expiryDate: "" } : row
              )
            );
            resolve(false);
          },
        });
      });

      if (userConfirmed) {
        handleChange(e, idx);
      }
    } else {
      handleChange(e, idx);
    }
  };

  const handlePurchaseList = () => {
    setShowPurchaseEntry(false);
  };

  const handleDeleteRow = (index: number) => {
    if (purchaseRows.length === 1) {
      toast.error("Cannot delete the last row", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    handleShowModal({
      message:
        "Are you sure you want to delete this item? This action cannot be undone",
      secondaryMessage: "Confirm Deletion",
      bgClassName: "bg-darkRed",
      onConfirmCallback: () => {
        setPurchaseRows(purchaseRows.filter((_, i) => i !== index));
      },
    });
  };

  const handleItemDrawer = (itemId?: string) => {
    if (itemId) {
      setCurrentItemId(itemId);
    }

    setShowSupplier(false);
    setShowItem(true);
    setShowDrawer(true);
  };

  const handleSupplierDrawer = () => {
    setShowItem(false);
    setShowSupplier(true);
    setShowDrawer(true);
  };
  const handleCloseDrawer = async () => {
    setShowDrawer(false);
    setShowItem(false);
    setShowSupplier(false);
    await fetchItems();
  };

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      billDate: new Date().toISOString().split("T")[0],
    }));
  }, []);

  useEffect(() => {
    if (formData.creditPeriod && formData.purchaseDate) {
      const purchaseDate = new Date(formData.purchaseDate);
      const creditPeriod = Number(formData.creditPeriod);

      if (!isNaN(creditPeriod) && !isNaN(purchaseDate.getTime())) {
        const paymentDueDate = new Date(purchaseDate);
        paymentDueDate.setDate(paymentDueDate.getDate() + creditPeriod);

        setFormData((prev) => ({
          ...prev,
          paymentDueDate,
        }));
      }
    }
  }, [formData.creditPeriod, formData.purchaseDate]);

  const handleOrderSelect = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOrderId = e.target.value.trim();

    if (!selectedOrderId) {
      console.warn("Order ID is empty or invalid!");
      return;
    }

    setFormData((prev) => ({ ...prev, orderId: selectedOrderId }));

    try {
      const purchaseOrder = await getPurchaseOrderById(selectedOrderId);

      if (purchaseOrder?.purchaseOrderItemDtos) {
        const pharmacyId = purchaseOrder.pharmacyId || "";
        const supplierId = purchaseOrder.supplierId || "";

        let updatedRows: PurchaseEntryItem[] =
          purchaseOrder.purchaseOrderItemDtos.map(
            (item: PurchaseEntryItem): PurchaseEntryItem => ({
              itemId: item.itemId,
              itemName: item.itemName,
              batchNo: item.batchNo || "",
              packageQuantity: item.packageQuantity || 0,
              expiryDate: item.expiryDate || "",
              purchasePrice: item.purchasePrice || 0,
              mrpSalePrice: item.mrpSalePrice || 0,
              purchasePricePerUnit: item.purchasePricePerUnit || 0,
              mrpSalePricePerUnit: item.mrpSalePricePerUnit || 0,
              gstPercentage: item.gstPercentage || 0,
              gstAmount: item.gstAmount || 0,
              discount: item.discount || 0,
              amount: item.amount || 0,
              pharmacyId,
            })
          );

        setPurchaseRows(updatedRows);

        updatedRows = await Promise.all(
          updatedRows.map(
            async (row: PurchaseEntryItem): Promise<PurchaseEntryItem> => {
              try {
                const itemDetails = await getItemById(row.itemId.toString());

                return {
                  ...row,
                  purchasePrice: itemDetails.purchasePrice ?? row.purchasePrice,
                  mrpSalePrice: itemDetails.mrpSalePrice ?? row.mrpSalePrice,
                  gstPercentage: itemDetails.gstPercentage ?? row.gstPercentage,

                  itemName: row.itemName,
                  packageQuantity: row.packageQuantity,
                  batchNo: row.batchNo,
                  expiryDate: row.expiryDate,
                  pharmacyId: row.pharmacyId,
                  amount: row.amount,
                  discount: row.discount,
                  gstAmount: row.gstAmount,
                };
              } catch (error) {
                console.error(
                  "Error fetching item details for itemId:",
                  row.itemId,
                  error
                );
                return row;
              }
            }
          )
        );

        setPurchaseRows(updatedRows);

        if (pharmacyId) {
          try {
            const response = await getPharmacyById(pharmacyId);
            const pharmacy = response?.data;

            setFormData((prev) => ({
              ...prev,
              pharmacyId,
              pharmacyName: pharmacy?.pharmacyName || "N/A",
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

            const supplier = await getSupplierById(supplierId);

            setFormData((prev) => ({
              ...prev,
              supplierId,
              supplierName: supplier?.supplierName || "N/A",
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

  const handleShowModal = (options: ModalOptions) => {
    setModalMessage(options.message);
    setModalSecondaryMessage(options.secondaryMessage || "");
    setModalBgClass(options.bgClassName || "");
    setModalConfirmCallback(() => options.onConfirmCallback);
    if (options.onCancelCallback) {
      setModalCancelCallback(() => options.onCancelCallback); // ✅
    }
    setShowModal(true);
  };

  const handleModalCancel = () => {
    modalCancelCallback();
    setShowModal(false);
  };

  const handleModalConfirm = async () => {
    await modalConfirmCallback();
    setShowModal(false);
  };

  const addPurchase = () => {
    if (Number(formData.invoiceAmount) !== grandTotal) {
      toast.error(
        "Invoice amount must match the grand total before confirming."
      );
      return;
    }

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

    handleShowModal({
      message:
        "Are you sure you want to confirm the entry? Once confirmed cannot be edited",
      secondaryMessage: "Confirm Entry Completion",
      bgClassName: "bg-darkPurple",
      onConfirmCallback: async () => {
        try {
          await createPurchase(purchaseData);

          setFormData({
            orderId: "",
            purchaseDate: new Date(),
            purchaseBillNo: "",
            creditPeriod: 0,
            paymentDueDate: new Date(),
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

          setPurchaseRows([]);
          window.location.reload();
        } catch (error) {
          console.error("Error adding purchase:", error);
          toast.error("Failed to add purchase. Please try again.");
        }
      },
    });
  };

  return (
    <>
      {showModal && (
        <Modal
          message={modalMessage}
          secondaryMessage={modalSecondaryMessage}
          bgClassName={modalBgClass}
          onConfirm={handleModalConfirm}
          onCancel={handleModalCancel}
        />
      )}
      {(showItem || showSupplier) && (
        <div
          className="fixed inset-0 z-40 backdrop-blur-sm bg-black/20"
          onClick={handleCloseDrawer}
        />
      )}

      {showItem && (
        <Drawer setShowDrawer={handleCloseDrawer} title={"Add New Item"}>
          <AddItem setShowDrawer={handleCloseDrawer} itemId={currentItemId} />
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
              className="w-48 bg-darkPurple text-white h-11"
              icon={<ClipboardList size={15} />}
            ></Button>
          </div>
        </div>

        <div className="border border-Gray max-full h-full rounded-lg p-5">
          <div className="justify-start text-black text-lg font-normal leading-7">
            Basic Details
          </div>

          <div className="relative mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[
              { id: "orderId", label: "Order ID" },
              { id: "pharmacyName", label: "Pharmacy" },
              { id: "purchaseBillNo", label: "Invoice Number" },
              { id: "billDate", label: "Bill Date", type: "date" },
            ].map(({ id, label, type }) => (
              <div key={id} className="relative w-full">
                {id === "orderId" ? (
                  <div className="relative">
                    <input
                      type="text"
                      id="orderId"
                      value={formData.orderId1 || ""}
                      onChange={handleInputChange}
                      onBlur={() =>
                        setTimeout(() => setShowSuggestions(false), 200)
                      }
                      onFocus={() => {
                        if (formData.orderId) {
                          setFilteredSuggestions(
                            orderSuggestions.filter((order) =>
                              order.orderId1
                                .toLowerCase()
                                .includes(formData.orderId!.toLowerCase())
                            )
                          );
                          setShowSuggestions(true);
                        }
                      }}
                      required
                      placeholder=" "
                      className="peer w-full px-3 py-3 border border-gray-400 rounded-md bg-transparent text-black outline-none focus:border-purple-900 focus:ring-0"
                      data-has-value={formData.orderId1 ? "true" : "false"}
                    />
                    <label
                      htmlFor="orderId"
                      className="absolute left-3 top-0 -translate-y-1/2 bg-white px-1 text-gray-500 text-xs transition-all 
              peer-placeholder-shown:top-0 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-xs 
              peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-xs peer-focus:text-purple-950 peer-focus:px-1
              peer-[data-has-value=true]:top-0 peer-[data-has-value=true]:-translate-y-1/2 peer-[data-has-value=true]:text-xs"
                    >
                      {label}
                    </label>

                    {showSuggestions && filteredSuggestions.length > 0 && (
                      <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow max-h-40 overflow-y-auto">
                        {filteredSuggestions.map((suggestion, index) => (
                          <li
                            key={index}
                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() =>
                              handleSuggestionClick(
                                suggestion.orderId,
                                suggestion.orderId1
                              )
                            }
                          >
                            {suggestion.orderId1}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  <InputField
                    id={id}
                    label={label}
                    type={type}
                    max={id === "billDate" ? today : undefined}
                    value={
                      formData[id as keyof PurchaseEntryData]?.toString() ?? ""
                    }
                    onChange={handleInputChange}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="relative mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[
              { id: "creditPeriod", label: "Credit Period", type: "number" },
              { id: "paymentDueDate", label: "Payment Due Date", type: "date" },
              { id: "supplierName", label: "Supplier", type: "text" },
              { id: "invoiceAmount", label: "Invoice Amount", type: "number" },
            ].map(({ id, label, type }) => (
              <div key={id} className="relative w-full">
                {id === "supplierName" ? (
                  <div className="relative">
                    {/* <input
                      type="text"
                      id="supplierName"
                      value={formData.supplierName || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          supplierName: value,
                        }));

                        const filtered = supplierSuggestions.filter(
                          (supplier) =>
                            supplier.supplierName
                              .toLowerCase()
                              .includes(value.toLowerCase())
                        );
                        setFilteredSupplierSuggestions(filtered);
                        setShowSupplierSuggestions(true);
                      }}
                      onBlur={() =>
                        setTimeout(() => setShowSupplierSuggestions(false), 200)
                      }
                      onFocus={() => {
                        if (formData.supplierName) {
                          const filtered = supplierSuggestions.filter(
                            (supplier) =>
                              supplier.supplierName
                                .toLowerCase()
                                .includes(formData.supplierName!.toLowerCase())
                          );
                          setFilteredSupplierSuggestions(filtered);
                          setShowSupplierSuggestions(true);
                        }
                      }}
                      placeholder=" "
                      className="peer w-full px-3 py-3 border border-gray-400 rounded-md bg-transparent text-black outline-none focus:border-purple-900 focus:ring-0"
                      data-has-value={formData.supplierName ? "true" : "false"}
                      required
                    />
                    <label
                      htmlFor="supplierName"
                      className="absolute left-3 top-0 -translate-y-1/2 bg-white px-1 text-gray-500 text-xs transition-all 
              peer-placeholder-shown:top-0 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-xs 
              peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-xs peer-focus:text-purple-950 peer-focus:px-1
              peer-[data-has-value=true]:top-0 peer-[data-has-value=true]:-translate-y-1/2 peer-[data-has-value=true]:text-xs"
                    >
                      {label}
                    </label>

                    {showSupplierSuggestions &&
                      filteredSupplierSuggestions.length > 0 && (
                        <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow max-h-40 overflow-y-auto">
                          {filteredSupplierSuggestions.map(
                            (supplier, index) => (
                              <li
                                key={index}
                                className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                                onClick={() =>
                                  handleSupplierClick(
                                    supplier.supplierId,
                                    supplier.supplierName  
                                  )
                                }
                              >
                                {supplier.supplierName}
                              </li>
                            )
                          )}
                        </ul>
                      )} */}
                    <label
                      htmlFor={id}
                      className="absolute left-3 top-0 -translate-y-1/2 bg-white px-1 text-gray-500 text-xs transition-all"
                    >
                      {label}
                    </label>
                    <select
                      id={id}
                      value={formData.supplierId || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === "newSupplier") {
                          handleSupplierDrawer();
                        } else {
                          handleInputChange(e);
                        }
                      }}
                      className="w-full h-[49px] px-3 py-3 border border-gray-400 rounded-md bg-white text-black outline-none focus:border-purple-900 focus:ring-0"
                      name="supplierId"
                    >
                      <option value="" disabled>
                        Select Supplier
                      </option>
                      <option value="newSupplier" className="text-Purple">
                        + New Supplier
                      </option>
                      {suppliers.map((sup) => (
                        <option key={sup.supplierId} value={sup.supplierId}>
                          {sup.supplierName}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <InputField
                    id={id}
                    label={label}
                    type={type}
                    value={
                      id === "paymentDueDate" && formData.paymentDueDate
                        ? new Date(formData.paymentDueDate)
                            .toISOString()
                            .split("T")[0]
                        : formData[id as keyof PurchaseEntryData]?.toString() ??
                          ""
                    }
                    onChange={
                      id === "paymentDueDate"
                        ? () => {}
                        : id === "creditPeriod" || id === "invoiceAmount"
                        ? handleNumericChange(handleInputChange)
                        : handleInputChange
                    }
                    readOnly={id === "paymentDueDate"}
                    onKeyDown={
                      id === "creditPeriod" || id === "invoiceAmount"
                        ? restrictInvalidNumberKeys
                        : undefined
                    }
                  />
                )}
              </div>
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
            label="Add Item Row"
            value=""
            className="w-44 bg-gray h-11"
            icon={<Plus size={15} />}
          ></Button>
        </div>

        <div className="border h-56 w-lg border-Gray rounded-xl p-6 space-y-6 ml-auto font-normal text-sm">
          {[
            { label: "SUB TOTAL", value: subTotal.toFixed(2) },
            { label: "GST TOTAL", value: gstTotal.toFixed(2) },
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
                  ? "font-semibold text-base bg-gray1 h-8 p-1 items-center rounded-lg"
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
            className="w-28 bg-darkPurple text-white h-11"
          ></Button>
        </div>
      </main>
    </>
  );
};

export default PurchaseEntry;
