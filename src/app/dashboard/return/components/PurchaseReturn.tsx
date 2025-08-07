"use client";

import Button from "@/app/components/common/Button";
import ItemDropdown, { OptionType } from "@/app/components/common/ItemDropdown";
import Modal from "@/app/components/common/Modal";
import {
  handleNumericChange,
  restrictInvalidNumberKeys,
} from "@/app/components/common/RestrictedVal";
import Table from "@/app/components/common/Table";
import { getPurchase } from "@/app/services/PurchaseEntryService";
import { createPurchaseReturn } from "@/app/services/PurchaseReturnService";
import { getSupplierById } from "@/app/services/SupplierService";
import { PurchaseEntryData } from "@/app/types/PurchaseEntry";
import {
  PurchaseReturnData,
  PurchaseReturnItem,
} from "@/app/types/PurchaseReturnData";
import { ClipboardList, Plus } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import AsyncSelect from "react-select/async";
import { BsThreeDotsVertical } from "react-icons/bs";
import { getPharmacy } from "@/app/services/PharmacyService";
import { PharmacyData } from "@/app/types/PharmacyData";

interface PurchaseReturnProps {
  setShowPurchaseReturn: (value: boolean) => void;
}
const PurchaseReturn: React.FC<PurchaseReturnProps> = ({
  setShowPurchaseReturn,
}) => {
  const handlePurchaseReturnList = () => {
    setShowPurchaseReturn(false);
  };

  const [modalConfirmCallback, setModalConfirmCallback] = useState<
    () => Promise<void> | void
  >(() => {});
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalSecondaryMessage, setModalSecondaryMessage] = useState("");
  const [modalBgClass, setModalBgClass] = useState("");
  const [, setPharmacies] = useState<PharmacyData[]>([]);

  interface ModalOptions {
    message: string;
    secondaryMessage?: string;
    bgClassName?: string;
    onConfirmCallback: () => Promise<void> | void;
  }

  const [formData, setFormData] = useState<PurchaseReturnData>({
    returnId: "",
    pharmacyId: "",
    pharmacyName: "",
    supplierId: "",
    supplierName: "",
    returnDate: new Date(),
    totalAmount: 0,
    totalGst: 0,
    returnAmount: 0,
    purchaseBillNo: "",
    grnno: "",
    purchaseReturnItemDtos: [
      {
        itemId: "",
        itemName: "",
        batchNo: "",
        returnQuantity: 0,
        availableQuantity: 0,
        gstPercentage: 0,
        purchasePrice: 0,
        returnType: "",
        discrepancyIn: "",
        discrepancy: "",
      },
    ],
  });

  const handleDeleteRow = (index: number) => {
    if (formData.purchaseReturnItemDtos.length === 1) {
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
        setFormData((prev) => ({
          ...prev,
          purchaseReturnItemDtos: prev.purchaseReturnItemDtos.filter(
            (_, i) => i !== index
          ),
        }));
      },
    });
  };

  const columns = (rowIndex: number) => [
    {
      header: "Discrepancy In",
      accessor: (item: PurchaseReturnItem) => (
        <select
          name={`discrepancyIn-${rowIndex}`}
          value={item.discrepancyIn || ""}
          onChange={handleInputChange}
          className="w-40 h-10 px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-0 focus:border-purple-900"
        >
          <option value="">Select</option>
          <option value="Item Name">Item Name</option>
          <option value="Batch">Batch</option>
          <option value="Quantity">Quantity</option>
          <option value="Expiry Date">Expiry Date</option>
          <option value="Price">Price</option>
        </select>
      ),
    },
    {
      header: "Discrepancy",
      accessor: (item: PurchaseReturnItem) => (
        <input
          type="text"
          name={`discrepancy-${rowIndex}`}
          value={item.discrepancy}
          onChange={handleInputChange}
          className="w-72 h-10 px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-0 focus:border-purple-900"
        />
      ),
    },
    {
      header: "Action",
      accessor: (row: PurchaseReturnItem, index: number) => (
        <div className="relative group">
          <button className="p-2 rounded-full hover:bg-gray-200 cursor-pointer">
            <BsThreeDotsVertical size={18} />
          </button>

          <div className="absolute right-0 mt-2 w-32 bg-white shadow-xl rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
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

  // const handleInputChange = (
  //   e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  // ) => {
  //   const { name, value } = e.target;
  //   const parts = name.split("-");

  //   if (parts.length === 2) {
  //     const field = parts[0] as keyof PurchaseReturnItem;
  //     const idx = Number(parts[1]);

  //     setFormData((prev) => {
  //       const updatedItems = prev.purchaseReturnItemDtos.map((item, i) =>
  //         i === idx
  //           ? {
  //               ...item,
  //               [field]: field === "returnQuantity" ? Number(value) : value,
  //             }
  //           : item
  //       );

  //       const updatedReturnAmount = updatedItems.reduce((acc, item) => {
  //         const qty = Number(item.returnQuantity) || 0;
  //         const price = Number(item.purchasePrice) || 0;
  //         console.log(
  //           `Calculating: qty=${qty}, price=${price}, subtotal=${qty * price}`
  //         );
  //         return acc + qty * price;
  //       }, 0);

  //       return {
  //         ...prev,
  //         purchaseReturnItemDtos: updatedItems,
  //         returnAmount: parseFloat(updatedReturnAmount.toFixed(2)),
  //       };
  //     });
  //   } else {
  //     const field = name as keyof PurchaseReturnData;
  //     const newValue = field === "returnDate" ? new Date(value) : value;

  //     setFormData((prev) => ({
  //       ...prev,
  //       [field]: newValue,
  //     }));
  //   }
  // };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const parts = name.split("-");

    if (parts.length === 2) {
      const field = parts[0] as keyof PurchaseReturnItem;
      const idx = Number(parts[1]);

      setFormData((prev) => {
        const updatedItems = prev.purchaseReturnItemDtos.map((item, i) =>
          i === idx
            ? {
                ...item,
                [field]:
                  field === "returnQuantity" ||
                  field === "purchasePrice" ||
                  field === "gstPercentage"
                    ? Number(value)
                    : value,
              }
            : item
        );

        let totalAmount = 0;
        let totalGst = 0;

        updatedItems.forEach((item) => {
          const qty = Number(item.returnQuantity) || 0;
          const price = Number(item.purchasePrice) || 0;
          const gst = Number(item.gstPercentage) || 0;
          const itemTotal = qty * price;
          const itemGstAmount = (itemTotal * gst) / 100;

          totalAmount += itemTotal;
          totalGst += itemGstAmount;
        });

        const grandTotal = totalAmount + totalGst;

        return {
          ...prev,
          purchaseReturnItemDtos: updatedItems,
          totalAmount: parseFloat(totalAmount.toFixed(2)),
          totalGst: parseFloat(totalGst.toFixed(2)),
          returnAmount: parseFloat(grandTotal.toFixed(2)),
        };
      });
    } else {
      const field = name as keyof PurchaseReturnData;
      const newValue = field === "returnDate" ? new Date(value) : value;

      setFormData((prev) => ({
        ...prev,
        [field]: newValue,
      }));
    }
  };

  const handleShowModal = (options: ModalOptions) => {
    setModalMessage(options.message);
    setModalSecondaryMessage(options.secondaryMessage || "");
    setModalBgClass(options.bgClassName || "");
    setModalConfirmCallback(() => options.onConfirmCallback);
    setShowModal(true);
  };

  const handleModalCancel = () => {
    setShowModal(false);
  };

  const handleModalConfirm = async () => {
    await modalConfirmCallback();
    setShowModal(false);
  };

  const addPurchaseReturn = () => {
    const hasInvalidDiscrepancy = formData.purchaseReturnItemDtos.some(
      (item, index) => {
        const isInvalid =
          !item.discrepancyIn ||
          item.discrepancy === undefined ||
          item.discrepancy === null ||
          item.discrepancy === "";
        if (isInvalid) {
          toast.error(
            `Please fill in both "Discrepancy In" and "Discrepancy" for item ${
              index + 1
            }`,
            {
              position: "top-right",
              autoClose: 2000,
              pauseOnHover: false,
            }
          );
        }
        return isInvalid;
      }
    );

    if (hasInvalidDiscrepancy) return;

    const firstItem = formData.purchaseReturnItemDtos[0] || {};

    const purchaseReturnData: PurchaseReturnData = {
      returnId: formData.returnId,
      pharmacyId: formData.pharmacyId,
      pharmacyName: formData.pharmacyName,
      supplierId: firstItem.supplierId || "",
      supplierName:
        (firstItem.supplierId &&
          firstItem.purchaseBillOptions?.find(
            (opt) => opt.supplierId === firstItem.supplierId
          )?.supplierName) ||
        "",
      returnDate: new Date(formData.returnDate),
      totalAmount: formData.totalAmount,
      totalGst: formData.totalGst,
      returnAmount: formData.returnAmount,
      purchaseBillNo: firstItem.purchaseBillNo || "",
      grnno: formData.grnno,
      purchaseReturnItemDtos: formData.purchaseReturnItemDtos.map((item) => ({
        itemId: item.itemId,
        itemName: item.itemName,
        batchNo: item.batchNo,
        returnQuantity: item.returnQuantity,
        availableQuantity: item.availableQuantity,
        purchasePrice: item.purchasePrice,
        returnType: item.returnType,
        discrepancyIn: item.discrepancyIn,
        discrepancy: item.discrepancy,
      })),
    };

    handleShowModal({
      message: "Are you sure you want to confirm the Return?",
      secondaryMessage: "Confirm Purchase Return",
      bgClassName: "bg-darkPurple",
      onConfirmCallback: async () => {
        try {
          await createPurchaseReturn(purchaseReturnData);

          setFormData({
            returnId: "",
            pharmacyId: "",
            pharmacyName: "",
            supplierId: "",
            supplierName: "",
            returnDate: new Date(),
            totalAmount: 0,
            totalGst: 0,
            returnAmount: 0,
            purchaseBillNo: "",
            grnno: "",
            purchaseReturnItemDtos: [],
          });

          window.location.reload();
        } catch (error) {
          console.error("Failed to submit purchase return:", error);
          toast.error("Failed to submit purchase return. Please try again.");
        }
      },
    });
  };

  const handleItemDropdownChange = async (
    selected: OptionType | null,
    idx: number
  ) => {
    if (!selected) return;

    try {
      const purchaseResult = await getPurchase();
      if (purchaseResult.status !== "success") {
        throw new Error("Failed to fetch purchase data");
      }

      const allBills: PurchaseEntryData[] = purchaseResult.data;

      const matchingBills = allBills.filter((bill) =>
        bill.stockItemDtos.some(
          (item) =>
            item.itemId === selected.itemId && item.batchNo === selected.batchNo
        )
      );

      const uniqueSupplierIds = [
        ...new Set(
          matchingBills.map((bill) => bill.supplierId).filter(Boolean)
        ),
      ];

      const supplierMap: Record<string, string> = {};

      await Promise.all(
        uniqueSupplierIds.map(async (supplierId) => {
          try {
            const supplierData = await getSupplierById(supplierId);
            supplierMap[supplierId] =
              supplierData?.supplierName ?? "Unknown Supplier";
          } catch (err) {
            console.error(`Error fetching supplier ${supplierId}:`, err);
            supplierMap[supplierId] = "Unknown Supplier";
          }
        })
      );

      const billNumbers = matchingBills.map((bill) => {
        const supplierName = bill.supplierId
          ? supplierMap[bill.supplierId]
          : "Unknown Supplier";

        return {
          label: `${bill.purchaseBillNo} - ${supplierName}`,
          value: bill.purchaseBillNo,
          supplierId: bill.supplierId,
          supplierName,
          billOnlyLabel: bill.purchaseBillNo,
        };
      });

      let purchasePrice = 0;
      let gstPercentage = 0;
      for (const bill of matchingBills) {
        const matchedItem = bill.stockItemDtos.find(
          (item) =>
            item.itemId === selected.itemId && item.batchNo === selected.batchNo
        );
        if (matchedItem?.purchasePrice) {
          purchasePrice = matchedItem.purchasePrice;
          gstPercentage = matchedItem.gstPercentage ?? 0;
          break;
        }
      }

      setFormData((prev) => {
        const updatedItems = [...prev.purchaseReturnItemDtos];
        updatedItems[idx] = {
          ...updatedItems[idx],
          itemId: selected.itemId ?? "",
          itemName: selected.label,
          batchNo: selected.batchNo ?? "",
          selectedItem: selected,
          purchaseBillNo: "",
          purchaseBillOptions: billNumbers,
          purchasePrice,
          gstPercentage,
        };

        return {
          ...prev,
          purchaseReturnItemDtos: updatedItems,
        };
      });
    } catch (error) {
      console.error("Error loading bill data:", error);
    }
  };

  const addNewRow = () => {
    setFormData((prev) => {
      const newItem: PurchaseReturnItem = {
        itemId: "",
        itemName: "",
        batchNo: "",
        selectedItem: null,
        purchaseBillNo: "",
        supplierId: "",
        purchaseBillOptions: [],
        purchasePrice: 0,
        availableQuantity: 0,
        returnType: "",
        returnQuantity: 0,
        discrepancy: "",
        discrepancyIn: "",
      };

      return {
        ...prev,
        purchaseReturnItemDtos: [...prev.purchaseReturnItemDtos, newItem],
      };
    });
  };

  const hasSetPharmacy = useRef(false);

  useEffect(() => {
    const fetchPharmacies = async () => {
      try {
        const data = await getPharmacy();
        setPharmacies(data.data);

        if (!hasSetPharmacy.current && data.data.length > 0) {
          hasSetPharmacy.current = true;
          setFormData((prev) => ({
            ...prev,
            pharmacyId: data.data[0].pharmacyId,
          }));
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchPharmacies();
  }, []);

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
      <main className="space-y-6">
        <div className="flex justify-between">
          <div className="justify-start text-darkPurple text-3xl font-medium leading-10 ">
            Add Return Items
          </div>

          <div>
            <Button
              onClick={() => handlePurchaseReturnList()}
              label="Purchase Return List"
              value=""
              className="w-48 bg-darkPurple text-white h-11"
              icon={<ClipboardList size={15} />}
            ></Button>
          </div>
        </div>

        {/* <div className="border border-Gray w-full h-full rounded-lg p-5">
          <div className="justify-start text-black text-lg font-normal leading-7">
            Basic Details
          </div>

          <div className="relative mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[
              {
                id: "grnno",
                label: "GRN Number",
                type: "text",
                readOnly: false,
              },
              {
                id: "supplierName",
                label: "Supplier",
                type: "text",
                readOnly: true,
              },
              {
                id: "purchaseBillNo",
                label: "Bill Number",
                type: "text",
                readOnly: true,
              },
              {
                id: "returnDate",
                label: "Return Date",
                type: "date",
                readOnly: false,
              },
            ].map(({ id, label, type, readOnly }) => (
              <div key={id} className="relative w-full">
                <label
                  htmlFor={id}
                  className="absolute left-3 top-0 -translate-y-1/2 bg-white px-1 text-gray-500 text-xs transition-all"
                >
                  {label}
                </label>

                <input
                  id={id}
                  name={id}
                  type={type}
                  readOnly={readOnly}
                  value={
                    type === "date" && formData[id as keyof typeof formData]
                      ? (formData[id as keyof typeof formData] as Date)
                          .toISOString()
                          .split("T")[0]
                      : formData[id as keyof typeof formData]?.toString() ?? ""
                  }
                  onChange={handleInputChange}
                  className="peer w-full h-[49px] px-3 py-3 border border-gray-400 rounded-md bg-transparent text-black outline-none focus:border-purple-900 focus:ring-0"
                />
              </div>
            ))}
          </div>
        </div> */}

        {formData.purchaseReturnItemDtos.map((row, idx) => (
          <div
            key={idx}
            className="border border-gray-300 w-full rounded-lg p-5 flex flex-col gap-6 lg:grid lg:grid-cols-2 lg:gap-8"
          >
            {/* Left Column */}
            <div className="w-full min-w-0 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div className="relative w-full">
                  <ItemDropdown
                    selectedOption={row.selectedItem || null}
                    onChange={(selected) =>
                      handleItemDropdownChange(selected, idx)
                    }
                  />
                </div>

                <div className="relative w-full">
                  <label
                    htmlFor={`batchNo-${idx}`}
                    className="absolute left-3 top-0 -translate-y-1/2 bg-white px-1 text-gray-500 text-xs transition-all"
                  >
                    Batch Number
                  </label>
                  <input
                    id={`batchNo-${idx}`}
                    name={`batchNo-${idx}`}
                    type="text"
                    value={row.batchNo}
                    readOnly
                    className="peer w-full px-3 py-3 border border-gray-400 rounded-md bg-transparent text-black outline-none focus:border-purple-900 focus:ring-0"
                  />
                </div>

                <div className="relative w-full">
                  <label
                    htmlFor={`purchaseBillNo-${idx}`}
                    className="absolute left-3 top-0 -translate-y-1/2 bg-white px-1 text-gray-500 text-xs transition-all z-10"
                  >
                    Bill Number
                  </label>

                  <div className="peer w-full px-3 py-[6px] border border-gray-400 rounded-md bg-transparent text-black outline-none focus-within:border-purple-900 focus-within:ring-0">
                    <AsyncSelect
                      cacheOptions
                      defaultOptions={row.purchaseBillOptions}
                      value={
                        row.purchaseBillOptions?.find(
                          (opt) => opt.value === row.purchaseBillNo
                        ) || null
                      }
                      getOptionLabel={(option) =>
                        option.billOnlyLabel || option.label
                      }
                      formatOptionLabel={(option, { context }) =>
                        context === "menu"
                          ? option.label
                          : option.billOnlyLabel || option.label
                      }
                      loadOptions={(inputValue, callback) => {
                        const filtered =
                          row.purchaseBillOptions?.filter((option) =>
                            option.label
                              .toLowerCase()
                              .includes(inputValue.toLowerCase())
                          ) || [];
                        callback(filtered);
                      }}
                      onChange={(selected) => {
                        const billNo = selected?.value || "";
                        const supplierId = selected?.supplierId || "";

                        setFormData((prev) => {
                          const updated = [...prev.purchaseReturnItemDtos];
                          updated[idx] = {
                            ...updated[idx],
                            purchaseBillNo: billNo,
                            supplierId,
                          };
                          return { ...prev, purchaseReturnItemDtos: updated };
                        });
                      }}
                      placeholder="Select Bill No"
                      isClearable
                      styles={{
                        control: (base) => ({
                          ...base,
                          minHeight: "30px",
                          border: "none",
                          boxShadow: "none",
                          backgroundColor: "transparent",
                        }),
                        valueContainer: (base) => ({
                          ...base,
                          padding: 0,
                        }),
                        indicatorsContainer: (base) => ({
                          ...base,
                          padding: 0,
                        }),
                        menu: (base) => ({
                          ...base,
                          zIndex: 9999,
                          minWidth: "100%",
                          width: "auto",
                          overflowX: "hidden",
                        }),
                        menuList: (base) => ({
                          ...base,
                          padding: 0,
                          overflowX: "hidden",
                        }),
                        option: (base, state) => ({
                          ...base,
                          backgroundColor:
                            state.isSelected || state.isFocused
                              ? "#4B0082"
                              : "white",
                          color:
                            state.isSelected || state.isFocused
                              ? "white"
                              : "#111827",
                          cursor: "pointer",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          maxWidth: "100%",
                          padding: "8px 12px",
                          borderRadius: "0.375rem",
                          "&:active": {
                            backgroundColor: "#4B0082",
                            color: "white",
                          },
                        }),
                      }}
                    />
                  </div>
                </div>

                <div className="relative w-full">
                  <label
                    htmlFor={`supplierName-${idx}`}
                    className="absolute left-3 top-0 -translate-y-1/2 bg-white px-1 text-gray-500 text-xs transition-all"
                  >
                    Supplier Name
                  </label>
                  <input
                    id={`supplierName-${idx}`}
                    name={`supplierName-${idx}`}
                    type="text"
                    value={
                      row.supplierId
                        ? row.purchaseBillOptions?.find(
                            (opt) => opt.supplierId === row.supplierId
                          )?.supplierName || ""
                        : ""
                    }
                    readOnly
                    className="peer w-full px-3 py-3 border border-gray-400 rounded-md bg-transparent text-black outline-none focus:border-purple-900 focus:ring-0"
                  />
                </div>

                <div className="relative w-full min-w-0">
                  <label
                    htmlFor={`returnType-${idx}`}
                    className="absolute left-2 top-0 -translate-y-1/2 bg-white px-1 text-gray-500 text-xs transition-all"
                  >
                    Return Type
                  </label>
                  <select
                    id={`returnType-${idx}`}
                    name={`returnType-${idx}`}
                    value={row.returnType}
                    onChange={handleInputChange}
                    className="peer w-full px-3 pl-4 py-3 border border-gray-400 rounded-md bg-white text-black outline-none focus:border-purple-900 focus:ring-0"
                  >
                    <option value="">Select Return Type</option>
                    <option value="Exchange product">Exchange product</option>
                    <option value="Refund">Refund</option>
                    <option value="Store Credit Returns">
                      Store Credit Returns
                    </option>
                    <option value="Replacement Returns">
                      Replacement Returns
                    </option>
                    <option value="Change Invoice">Change Invoice</option>
                  </select>
                </div>

                <div className="relative w-full">
                  <label
                    htmlFor={`returnQuantity-${idx}`}
                    className="absolute left-3 top-0 -translate-y-1/2 bg-white px-1 text-gray-500 text-xs transition-all"
                  >
                    Return Quantity
                  </label>
                  <input
                    id={`returnQuantity-${idx}`}
                    name={`returnQuantity-${idx}`}
                    type="number"
                    value={
                      row.returnQuantity === 0 ? "" : row.returnQuantity ?? ""
                    }
                    onKeyDown={restrictInvalidNumberKeys}
                    onChange={handleNumericChange(handleInputChange)}
                    className="peer w-full px-3 py-3 border border-gray-400 rounded-md bg-transparent text-black outline-none focus:border-purple-900 focus:ring-0"
                  />
                </div>
              </div>
            </div>

            <input
              type="hidden"
              name="pharmacyId"
              value={formData.pharmacyId}
            />

            {/* Right Column */}
            <div className="w-full min-w-0 overflow-x-auto">
              <Table
                data={[row]}
                columns={columns(idx)}
                noDataMessage="No purchase items found"
              />
            </div>
          </div>
        ))}

        <div>
          <Button
            onClick={() => addNewRow()}
            label="Add Item Row"
            value=""
            className="w-44 bg-gray h-11"
            icon={<Plus size={15} />}
          ></Button>
        </div>

        <div className="border h-full w-lg border-Gray rounded-xl p-6 space-y-6 ml-auto font-normal text-sm">
          {[
            {
              label: "SUB TOTAL",
              value: formData.totalAmount?.toFixed(2) ?? "0.00",
            },
            {
              label: "GST TOTAL",
              value: formData.totalGst?.toFixed(2) ?? "0.00",
            },
            {
              label: "GRAND TOTAL",
              value: formData.returnAmount?.toFixed(2) ?? "0.00",
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
            onClick={addPurchaseReturn}
            label="Confirm"
            value=""
            className="w-28 bg-darkPurple text-white h-11"
          ></Button>
        </div>
      </main>
    </>
  );
};

export default PurchaseReturn;
