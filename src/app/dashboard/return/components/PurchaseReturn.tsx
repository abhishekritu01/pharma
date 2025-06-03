"use client";

import Button from "@/app/components/common/Button";
import Modal from "@/app/components/common/Modal";
import { handleNumericChange, restrictInvalidNumberKeys } from "@/app/components/common/RestrictedVal";
import Table from "@/app/components/common/Table";
import { getItemById } from "@/app/services/ItemService";
import { getPurchase } from "@/app/services/PurchaseEntryService";
import { createPurchaseReturn } from "@/app/services/PurchaseReturnService";
import { getSupplierById } from "@/app/services/SupplierService";
import {
  PurchaseReturnData,
  PurchaseReturnItem,
} from "@/app/types/PurchaseReturnData";
import { ClipboardList } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

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
        purchasePrice: 0,
        returnType: "",
        discrepancyIn: "",
        discrepancy: "",
      },
    ],
  });

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
  ];


  // const handleInputChange = (
  //   e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  // ) => {
  //   const { name, value } = e.target;
  //   const parts = name.split("-");

  //   if (parts.length === 2) {
  //     const field = parts[0] as keyof PurchaseReturnItem;
  //     const idx = Number(parts[1]);
  //     const newValue = field === "returnQuantity" ? Number(value) : value;

  //     setFormData((prev) => ({
  //       ...prev,
  //       purchaseReturnItemDtos: prev.purchaseReturnItemDtos.map((item, i) =>
  //         i === idx ? { ...item, [field]: newValue } : item
  //       ),
  //     }));
  //   }
  //   else {
  //     const field = name as keyof PurchaseReturnData;
  //     const newValue = field === "returnDate" ? new Date(value) : value;

  //     setFormData(
  //       (prev) =>
  //         ({
  //           ...prev,
  //           [field]: newValue,
  //         } as unknown as PurchaseReturnData)
  //     );
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

    if (field === "returnQuantity") {
      const numericValue = Number(value);
      const availableQty = formData.purchaseReturnItemDtos[idx]?.availableQuantity ?? 0;

      if (numericValue > availableQty) {
        toast.error(
          `Return quantity cannot exceed available quantity (${availableQty})`,
          {
            position: "top-right",
            autoClose: 2000,
            pauseOnHover: false,
          }
        );
        return;
      }

      setFormData((prev) => ({
        ...prev,
        purchaseReturnItemDtos: prev.purchaseReturnItemDtos.map((item, i) =>
          i === idx ? { ...item, [field]: numericValue } : item
        ),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        purchaseReturnItemDtos: prev.purchaseReturnItemDtos.map((item, i) =>
          i === idx ? { ...item, [field]: value } : item
        ),
      }));
    }
  } else {
    const field = name as keyof PurchaseReturnData;
    const newValue = field === "returnDate" ? new Date(value) : value;

    setFormData((prev) => ({
      ...prev,
      [field]: newValue,
    }));
  }
};


  const { grnno } = formData;

  useEffect(() => {
    const fetchByGrn = async () => {
      const { grnno } = formData;
      if (!grnno) return;

      try {
        const response = await getPurchase();

        if (response.status !== "success" || !Array.isArray(response.data)) {
          console.error(
            "Failed to fetch purchases or unexpected data:",
            response
          );
          return;
        }

        const all = response.data;

        const purchase = all.find((p) => p.grnNo === grnno);
        if (!purchase) return;

        const supplier = await getSupplierById(purchase.supplierId);

        const items: PurchaseReturnItem[] = await Promise.all(
          (purchase.stockItemDtos || []).map(async (si: PurchaseReturnItem) => {
            const item = await getItemById(si.itemId);

            return {
              itemId: si.itemId,
              itemName: item.itemName,
              batchNo: si.batchNo,
              returnQuantity: 0,
              returnType: "",
              discrepancyIn: "",
              discrepancy: "",
              availableQuantity: si.packageQuantity,
              purchasePrice: si.purchasePrice,
            };
          })
        );

        setFormData((prev) => ({
          ...prev,
          supplierId: purchase.supplierId,
          supplierName: supplier.supplierName,
          purchaseBillNo: purchase.purchaseBillNo,
          purchaseReturnItemDtos: items,
        }));
      } catch (err) {
        console.error("fetchByGrn:", err);
      }
    };

    fetchByGrn();
 // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grnno]);

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
    const hasInvalidDiscrepancy = formData.purchaseReturnItemDtos.some((item, index) => {
    const isInvalid = !item.discrepancyIn || item.discrepancy === undefined || item.discrepancy === null || item.discrepancy === "";
    if (isInvalid) {
      toast.error(`Please fill in both "Discrepancy In" and "Discrepancy" for item ${index + 1}`, {
        position: "top-right",
        autoClose: 2000,
        pauseOnHover: false,
      });
    }
    return isInvalid;
  });

  if (hasInvalidDiscrepancy) return;
  
    const purchaseReturnData: PurchaseReturnData = {
      returnId: formData.returnId,
      pharmacyId: formData.pharmacyId,
      pharmacyName: formData.pharmacyName,
      supplierId: formData.supplierId,
      supplierName: formData.supplierName,
      returnDate: new Date(formData.returnDate),
      returnAmount: formData.returnAmount,
      purchaseBillNo: formData.purchaseBillNo,
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

          // Reset form data
          setFormData({
            returnId: "",
            pharmacyId: "",
            pharmacyName: "",
            supplierId: "",
            supplierName: "",
            returnDate: new Date(),
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

  useEffect(() => {
    const total = formData.purchaseReturnItemDtos.reduce((acc, item) => {
      const qty = Number(item.returnQuantity) || 0;
      const price = Number(item.purchasePrice) || 0;

      return acc + qty * price;
    }, 0);

    setFormData((prev) => ({
      ...prev,
      returnAmount: total,
    }));
  }, [formData.purchaseReturnItemDtos]);

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

        <div className="border border-Gray w-full h-full rounded-lg p-5">
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
        </div>

        {formData.purchaseReturnItemDtos.map((row, idx) => (
          <div
            key={idx}
            className="border border-gray-300 w-full rounded-lg p-5 flex flex-col lg:flex-row gap-8"
          >
            {/* Left Column */}
            <div className="space-y-5 w-full lg:w-1/2">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-4">
                <div className="relative w-full">
                  <label
                    htmlFor={`itemName-${idx}`}
                    className="absolute left-3 top-0 -translate-y-1/2 bg-white px-1 text-gray-500 text-xs transition-all"
                  >
                    Item Name
                  </label>
                  <input
                    id={`itemName-${idx}`}
                    name={`itemName-${idx}`}
                    type="text"
                    value={row.itemName}
                    readOnly
                    className="peer w-full px-3 py-3 border border-gray-400 rounded-md bg-transparent text-black outline-none focus:border-purple-900 focus:ring-0"
                  />
                </div>

                <div className="relative w-full">
                  <label
                    htmlFor={`returnType-${idx}`}
                    className="absolute left-3 top-0 -translate-y-1/2 bg-white px-1 text-gray-500 text-xs transition-all"
                  >
                    Return Type
                  </label>
                  <select
                    id={`returnType-${idx}`}
                    name={`returnType-${idx}`}
                    value={row.returnType}
                    onChange={handleInputChange}
                    className="peer w-full px-3 py-3 border border-gray-400 rounded-md bg-white text-black outline-none focus:border-purple-900 focus:ring-0"
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
                    htmlFor={`returnQuantity-${idx}`}
                    className="absolute left-3 top-0 -translate-y-1/2 bg-white px-1 text-gray-500 text-xs transition-all"
                  >
                    Return Quantity
                  </label>
                  <input
                    id={`returnQuantity-${idx}`}
                    name={`returnQuantity-${idx}`}
                    type="number"
                    value={row.returnQuantity}
                    onKeyDown={restrictInvalidNumberKeys}
                    onChange={handleNumericChange(handleInputChange)}
                    // onChange={handleInputChange}
                    className="peer w-full px-3 py-3 border border-gray-400 rounded-md bg-transparent text-black outline-none focus:border-purple-900 focus:ring-0"
                  />
                  <span className="text-sm italic">
                    Available Qty.: {row.availableQuantity ?? "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="w-full lg:flex-1">
              <Table
                data={[row]}
                columns={columns(idx)}
                noDataMessage="No purchase items found"
              />
            </div>
          </div>
        ))}

        <div className="border h-auto w-lg border-Gray rounded-xl p-6 space-y-6 ml-auto font-normal text-sm">
          {[
            // { label: "SUB TOTAL", value: 0 },
            // { label: "GST TOTAL", value: 0 },
            {
              label: "RETURN AMOUNT",
              value: formData.returnAmount.toFixed(2),

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
