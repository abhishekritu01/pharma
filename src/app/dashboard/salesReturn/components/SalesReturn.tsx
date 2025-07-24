"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { BillingData, BillingItemData } from "@/app/types/BillingData";
import {
  SalesReturnData,
  SalesReturnItemData,
} from "@/app/types/SalesReturnData";
import { PatientData } from "@/app/types/PatientData";
import { getBillingById } from "@/app/services/BillingService";
import { getPatientById } from "@/app/services/PatientService";
import { createSalesReturn } from "@/app/services/SalesReturnService";
import Button from "@/app/components/common/Button";
import Table from "@/app/components/common/Table";
import { toast } from "react-toastify";
import Modal from "@/app/components/common/Modal";
import Select, { SelectInstance } from "react-select";
import { getItemById } from "@/app/services/ItemService";
import { ClipboardList } from "lucide-react";
import { useRouter } from "next/navigation";

interface SalesReturnProps {
  setShowCreateReturn: (value: boolean) => void;
  onSuccess: () => void;
  bills: Array<{ billId: string; billNumber: string }>;
}

interface OptionType {
  label: string;
  value: string;
}

interface MyButtonProps {
  onClick: () => void;
  label: string;
  className?: string;
  disabled?: boolean;
}

const MyButton: React.FC<MyButtonProps> = ({
  disabled,
  onClick,
  label,
  className = "",
  ...props
}) => (
  <div className={disabled ? "opacity-50 cursor-not-allowed" : ""}>
    <Button
      onClick={disabled ? undefined : onClick}
      label={label}
      className={className}
      {...props}
    />
  </div>
);

const SalesReturn: React.FC<SalesReturnProps> = ({
  setShowCreateReturn,
  onSuccess,
  bills,
}) => {
  const router = useRouter();
  const [selectedBill, setSelectedBill] = useState<OptionType | null>(null);
  const [originalBill, setOriginalBill] = useState<BillingData | null>(null);
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [returnItem, setReturnItem] = useState<SalesReturnItemData[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const selectRef = useRef<SelectInstance<OptionType>>(null);
  const [modalMessage, setModalMessage] = useState("");
  const [modalSecondaryMesaage, setModalSecondaryMessage] = useState("");
  const [modalBgClass, setModalBgClass] = useState("");
  const [modalCancelCallback, setModalCancelCallback] = useState<() => void>(
    () => { }
  );
  const [modalConfirmCallback, setModalConfirmCallback] = useState<
    () => Promise<void> | void
  >(() => { });

  const handleShowModal = (options: {
    message: string;
    secondaryMessage?: string;
    bgClassName?: string;
    onConfirmCallback: () => Promise<void> | void;
    onCancelCallback?: () => void;
  }) => {
    setModalMessage(options.message);
    setModalSecondaryMessage(options.secondaryMessage || "");
    setModalBgClass(options.bgClassName || "");
    setModalConfirmCallback(() => options.onConfirmCallback);
    setModalCancelCallback(() => options.onCancelCallback || (() => { }));
    setShowModal(true);
  };

  const handleModalConfirm = async () => {
    await modalConfirmCallback();
    setShowModal(false);
  };

  const handleModalCancel = async () => {
    if (modalCancelCallback) {
      modalCancelCallback();
    }
    setShowModal(false);
  };

  const fetchOriginalBill = useCallback(async () => {
    if (!selectedBill?.value) return;
    try {
      setSearching(true);
      const bill = await getBillingById(selectedBill.value);

      if (!bill) {
        toast.error("Bill not found");
        return;
      }

      const enrichedItems = await Promise.all(
        bill.billItemDtos.map(async (item: BillingItemData) => {
          try {
            const itemDetails = await getItemById(item.itemId);
            return {
              ...item,
              itemName: itemDetails.itemName,
              gstPercentage: item.gstPercentage || itemDetails.gstPercentage,
              cgstPercentage:
                (item.gstPercentage || itemDetails.gstPercentage) / 2,
              sgstPercentage:
                (item.gstPercentage || itemDetails.gstPercentage) / 2,
            };
          } catch (err) {
            console.error("Failed to fetch item details:", err);
            return {
              ...item,
              itemName: "Unknown Item",
              gstPercentage: item.gstPercentage || 0,
              cgstPercentage: (item.gstPercentage || 0) / 2,
              sgstPercentage: (item.gstPercentage || 0) / 2,
            };
          }
        })
      );

      const updatedBill = {
        ...bill,
        billItemDtos: enrichedItems,
      };

      setOriginalBill(updatedBill);

      if (bill.patientId) {
        try {
          const patient = await getPatientById(bill.patientId);
          setPatientData(patient);
        } catch (patientError) {
          console.warn("Could not fetch patient details", patientError);
        }
      }

      const initialReturnItems = updatedBill.billItemDtos.map(
        (item: BillingItemData) => {
          const cgstPercentage = item.gstPercentage / 2;
          const sgstPercentage = item.gstPercentage / 2;

          const discountedPrice =
            item.mrpSalePricePerUnit *
            (1 - (item.discountPercentage || 0) / 100);
          const originalGross = item.packageQuantity * discountedPrice;
          const cgstAmount = originalGross * (cgstPercentage / 100);
          const sgstAmount = originalGross * (sgstPercentage / 100);
          const originalNet = originalGross + cgstAmount + sgstAmount;

          return {
            returnItemId: `temp-${Math.random().toString(36).substring(2, 9)}`,
            billItemId: item.billItemId,
            itemId: item.itemId,
            itemName: item.itemName,
            batchNo: item.batchNo,
            expiryDate: item.expiryDate,
            returnedQuantity: 0,
            originalPrice: item.mrpSalePricePerUnit,
            billedAmount: originalNet,
            gstPercentage: item.gstPercentage,
            cgstPercentage,
            sgstPercentage,
            discountPercentage: item.discountPercentage,
            refundAmount: 0,
            maxQuantity: item.packageQuantity,
            packageQuantity: item.packageQuantity,
            returnQuantity: 0,
            mrpSalePricePerUnit: discountedPrice,
            netTotal: 0,
            grossTotal: item.grossTotal,
            cgstAmount: 0,
            sgstAmount: 0,
          };
        }
      );

      setReturnItem(initialReturnItems);
    } catch (error) {
      toast.error("Failed to fetch bill details");
      console.error("Error fetching bill details:", error);
    } finally {
      setSearching(false);
    }
  }, [selectedBill?.value]);

  useEffect(() => {
    if (selectedBill?.value) {
      fetchOriginalBill();
    } else {
      setOriginalBill(null);
      setPatientData(null);
      setReturnItem([]);
    }
  }, [selectedBill?.value, fetchOriginalBill]);

  const handleInputChange = (newValue: string) => {
    setInputValue(newValue);
  };

  const handleBillChange = (selected: OptionType | null) => {
    setSelectedBill(selected);
    if (!selected) {
      setInputValue("");
    }
  };

  const handleReturnItemChange = (
    index: number,
    field: keyof SalesReturnItemData,
    value: string | number
  ) => {
    const updatedItems = [...returnItem];
    const item = { ...updatedItems[index], [field]: value };

    if (field === "returnedQuantity" || field === "returnQuantity") {
      const quantity = Number(value);
      const discountedPrice = item.mrpSalePricePerUnit;
      const grossAmount = quantity * discountedPrice;

      const cgstAmount = grossAmount * ((item.cgstPercentage || 0) / 100);
      const sgstAmount = grossAmount * ((item.sgstPercentage || 0) / 100);
      const netAmount = grossAmount + cgstAmount + sgstAmount;

      item.refundAmount = netAmount;
      item.grossAmount = grossAmount;
      item.netTotal = netAmount;
      item.returnQuantity = quantity;
      item.cgstAmount = cgstAmount;
      item.sgstAmount = sgstAmount;
    }

    updatedItems[index] = item;
    setReturnItem(updatedItems);
  };

  const calculateTotals = () => {
    return returnItem.reduce(
      (acc, item) => {
        return {
          subTotal: acc.subTotal + (item.grossAmount || 0),
          totalCgst: acc.totalCgst + (item.cgstAmount || 0),
          totalSgst: acc.totalSgst + (item.sgstAmount || 0),
          grandTotal: acc.grandTotal + (item.netTotal || 0),
        };
      },
      { subTotal: 0, totalCgst: 0, totalSgst: 0, grandTotal: 0 }
    );
  };

  const validateForm = () => {
    if (!originalBill) {
      toast.error("Please select a valid bill first");
      return false;
    }

    const hasReturnItem = returnItem.some((item) => item.returnQuantity > 0);

    if (!hasReturnItem) {
      toast.error("Please specify return quantities for at least one item");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !originalBill) return;

    const totals = calculateTotals();

    const salesReturnData: SalesReturnData = {
      originalBillId: originalBill.billId,
      billId1: originalBill.billId1 || "",
      patientId: originalBill.patientId,
      patientName: originalBill.patientName || "",
      billReturnDateTime: new Date(),
      subTotal: totals.subTotal,
      totalCgst: totals.totalCgst,
      totalSgst: totals.totalSgst,
      grandTotal: totals.grandTotal,
      totalDiscount: originalBill.totalDiscount,
      billReturnItemDtos: returnItem
        .filter((item) => (item.returnedQuantity || 0) > 0)
        .map((item) => ({
          itemId: item.itemId,
          batchNo: item.batchNo,
          expiryDate: item.expiryDate,
          packageQuantity: item.packageQuantity,
          returnQuantity: item.returnQuantity || item.returnedQuantity || 0,
          mrpSalePricePerUnit: item.mrpSalePricePerUnit,
          gstPercentage:
            item.gstPercentage || item.cgstPercentage + item.sgstPercentage,
          cgstPercentage: item.cgstPercentage,
          sgstPercentage: item.sgstPercentage,
          discountPercentage: item.discountPercentage || 0,
          netTotal: item.netTotal || 0,
          grossTotal: item.grossTotal || 0,
          cgstAmount: item.cgstAmount || 0,
          sgstAmount: item.sgstAmount || 0,
        })),
    };

    try {
      setLoading(true);
      const result = await createSalesReturn(salesReturnData);
      if (result) {
        toast.success("Return created successfully");
        onSuccess();
        setShowCreateReturn(false);
        router.push("/dashboard/salesReturn");
      }
    } catch (error: unknown) {
      console.error("Error creating return:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create return"
      );
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      header: "Item Name",
      accessor: (row: SalesReturnItemData) => row.itemName,
    },
    {
      header: "Batch No.",
      accessor: (row: SalesReturnItemData) => row.batchNo,
    },
    {
      header: "Expiry Date",
      accessor: (row: SalesReturnItemData) =>
        row.expiryDate
          ? new Date(row.expiryDate).toLocaleDateString("en-GB")
          : "N/A",
    },
    {
      header: "Billed Qty.",
      accessor: (row: SalesReturnItemData) => row.packageQuantity,
    },
    {
      header: "Return Qty.",
      accessor: (row: SalesReturnItemData, index: number) => (
        <input
          type="number"
          min="0"
          max={row.packageQuantity ?? undefined}
          value={row.returnedQuantity}
          onChange={(e) =>
            handleReturnItemChange(
              index,
              "returnedQuantity",
              Math.min(Number(e.target.value), row.packageQuantity ?? Infinity)
            )
          }
          className="w-20 border border-gray-300 rounded px-2 py-1"
        />
      ),
    },
    {
      header: "Billed Amount",
      accessor: (row: SalesReturnItemData) =>
        row.billedAmount?.toFixed(2) || "0.00",
    },
    {
      header: "Refund Amount",
      accessor: (row: SalesReturnItemData) =>
        `${row.netTotal?.toFixed(2) || "0.00"}`,
    },
  ];

  const formatPaymentStatus = (status: string) => {
    return status
      ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
      : "N/A";
  };

  const handleManualBillEntry = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      const matchedBill = bills.find(
        (bill) => bill.billNumber.toLowerCase() === inputValue.toLowerCase()
      );
      if (matchedBill) {
        setSelectedBill({
          label: matchedBill.billNumber,
          value: matchedBill.billId,
        });
      } else {
        toast.error("No matching bill found");
        setSelectedBill(null);
      }
    }
  };

  const formatPatientType = (type: string) => {
    return type === "IP"
      ? "In-Patient"
      : type === "OP"
        ? "Out-Patient"
        : type || "N/A";
  };

  return (
    <main className="space-y-6 p-4">
      {showModal && (
        <Modal
          message={modalMessage}
          secondaryMessage={modalSecondaryMesaage}
          bgClassName={modalBgClass}
          onConfirm={handleModalConfirm}
          onCancel={handleModalCancel}
        />
      )}
      <div className="flex justify-between items-center">
        <h1 className="justify-start text-darkPurple text-3xl font-medium leading-10">
          Bill Return
        </h1>
        <div>
          <Button
            onClick={() => setShowCreateReturn(false)}
            label="Sales Return List"
            value=""
            className="w-48 bg-darkPurple text-white h-11"
            icon={<ClipboardList size={15} />}
          />
        </div>
      </div>

      {/* Bill Number Section*/}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex w-[351.67px] h-[96px] py-6 flex-col justify-center items-start relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bill Number *
          </label>
          <Select
            ref={selectRef}
            options={bills.map((bill) => ({
              label: bill.billNumber,
              value: bill.billId,
            }))}
            value={selectedBill}
            onChange={handleBillChange}
            onInputChange={handleInputChange}
            inputValue={inputValue}
            className="w-full"
            placeholder="Enter Bill Number"
            isLoading={searching}
            isClearable={true}
            onKeyDown={handleManualBillEntry}
            filterOption={(option, rawInput) => {
              return option.label
                .toLowerCase()
                .includes(rawInput.toLowerCase());
            }}
            styles={{
              control: (base, state) => ({
                ...base,
                borderColor: state.isFocused ? "#442060" : base.borderColor,
                boxShadow: state.isFocused
                  ? "0 0 0 1px #421D5E"
                  : base.boxShadow,
                "&:hover": {
                  borderColor: state.isFocused ? "#442060" : base.borderColor,
                },
              }),
              option: (base, state) => ({
                ...base,
                backgroundColor: state.isSelected
                  ? "#442060"
                  : state.isFocused
                    ? "#F3E8FF"
                    : base.backgroundColor,
                color: state.isSelected ? "white" : base.color,
                "&:active": {
                  backgroundColor: "#E1C4F8",
                },
              }),
              menu: (base) => ({
                ...base,
                zIndex: 9999,
              }),
            }}
            theme={(theme) => ({
              ...theme,
              colors: {
                ...theme.colors,
                primary: "#442060",
                primary25: "#F3E8FF",
                primary50: "#E1C4F8",
              },
            })}
          />
        </div>
      </div>

      {originalBill && (
        <>
          <div className="bg-white rounded-lg p-6 w-full border border-gray-200">
            <div className="flex items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Patient Details</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Patient Name</label>
                <div className="text-base text-gray-800 p-3 border border-gray-200 rounded-md bg-gray-50/50">
                  {patientData?.firstName
                    ? `${patientData.firstName} ${patientData.lastName || ""}`.trim()
                    : originalBill.patientName || "--"}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Bill Date</label>
                <div className="text-base text-gray-800 p-3 border border-gray-200 rounded-md bg-gray-50/50">
                  {originalBill?.billDateTime
                    ? new Date(originalBill.billDateTime).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })
                    : "--"}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Mobile Number</label>
                <div className="text-base text-gray-800 p-3 border border-gray-200 rounded-md bg-gray-50/50">
                  {patientData?.phone || originalBill.phone || "--"}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Patient ID</label>
                <div className="text-base text-gray-800 p-3 border border-gray-200 rounded-md bg-gray-50/50 truncate">
                  {patientData?.patientId1 || originalBill?.patientId1 || "--"}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Patient Type</label>
                <div className="text-base text-gray-800 p-3 border border-gray-200 rounded-md bg-gray-50/50">
                  {formatPatientType(originalBill.patientType) || "--"}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Payment Status</label>
                <div className="text-base p-3 border border-gray-200 rounded-md bg-gray-50/50">
                  <span className={
                    originalBill.paymentStatus?.toLowerCase() === "paid"
                      ? "text-green-600"
                      : ["pending", "not paid"].includes(
                        originalBill.paymentStatus?.toLowerCase()
                      )
                        ? "text-amber-500"
                        : "text-gray-800"
                  }>
                    {formatPaymentStatus(originalBill.paymentStatus) || "--"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* <div className="bg-white rounded-lg shadow p-6 w-full border border-gray-200">
            <h2 className="text-lg font-medium text-gray-800 mb-4">
              Patient Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="w-full h-[96px] p-6 flex flex-col justify-center items-start rounded-lg bg-[#FAFAFA] border border-gray-100">
                <div className="text-sm text-[#433E3F] font-inter font-normal leading-[161.8%]">
                  Patient Name
                </div>
                <div className="text-base text-[#0A0A0B] font-inter font-normal leading-[161.8%] truncate w-full">
                  {patientData?.firstName
                    ? `${patientData.firstName} ${
                        patientData.lastName || ""
                      }`.trim()
                    : originalBill.patientName || "--"}
                </div>
              </div>
              <div className="w-full h-[96px] p-6 flex flex-col justify-center items-start rounded-lg bg-[#FAFAFA] border border-gray-100">
                <div className="text-sm text-[#433E3F] font-inter font-normal leading-[161.8%]">
                  Bill Date
                </div>
                <div className="text-base text-[#0A0A0B] font-inter font-normal leading-[161.8%] truncate w-full">
                  {originalBill?.billDateTime
                    ? new Date(originalBill.billDateTime).toLocaleDateString(
                        "en-GB",
                        {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        }
                      )
                    : "--"}
                </div>
              </div>
              <div className="w-full h-[96px] p-6 flex flex-col justify-center items-start rounded-lg bg-[#FAFAFA] border border-gray-100">
                <div className="text-sm text-[#433E3F] font-inter font-normal leading-[161.8%]">
                  Mobile Number
                </div>
                <div className="text-base text-[#0A0A0B] font-inter font-normal leading-[161.8%] truncate w-full">
                  {patientData?.phone || originalBill.phone || "--"}
                </div>
              </div>
              <div className="w-full h-[96px] p-6 flex flex-col justify-center items-start rounded-lg bg-[#FAFAFA] border border-gray-100">
                <div className="text-sm text-[#433E3F] font-inter font-normal leading-[161.8%]">
                  Patient ID
                </div>
                <div className="text-base text-[#0A0A0B] font-inter font-normal leading-[161.8%] truncate w-full">
                  {patientData?.patientId1 || originalBill?.patientId1 || "--"}
                </div>
              </div>
              <div className="w-full h-[96px] p-6 flex flex-col justify-center items-start rounded-lg bg-[#FAFAFA] border border-gray-100">
                <div className="text-sm text-[#433E3F] font-inter font-normal leading-[161.8%]">
                  Patient Type
                </div>
                <div className="text-base text-[#0A0A0B] font-inter font-normal leading-[161.8%] truncate w-full">
                  {formatPatientType(originalBill.patientType) || "--"}
                </div>
              </div>
              <div className="w-full h-[96px] p-6 flex flex-col justify-center items-start rounded-lg bg-[#FAFAFA] border border-gray-100">
                <div className="text-sm text-[#433E3F] font-inter font-normal leading-[161.8%]">
                  Payment Status
                </div>
                <div
                  className={`text-base font-inter font-normal leading-[161.8%] truncate w-full ${
                    originalBill.paymentStatus?.toLowerCase() === "paid"
                      ? "text-green-600"
                      : ["pending", "not paid"].includes(
                          originalBill.paymentStatus?.toLowerCase()
                        )
                      ? "text-orange-500"
                      : "text-[#0A0A0B]"
                  }`}
                >
                  {formatPaymentStatus(originalBill.paymentStatus) || "--"}
                </div>
              </div>
            </div>
          </div> */}

          <div className="bg-white rounded-lg shadow p-6 w-full">
            <h2 className="text-xl font-bold text-gray-800">
              Billed Items
            </h2>
            <Table
              data={returnItem}
              columns={columns}
              noDataMessage="No items available for return"
            />
          </div>

          <div className="bg-white rounded-lg shadow p-6 w-full">
            <div className="flex flex-col space-y-4">
              <div className="flex justify-between w-full">
                <div className="flex items-center flex-1 gap-x-8">
                  <div className="w-48"></div>
                  <div className="w-60"></div>
                </div>
                <div className="flex items-center flex-1 justify-end gap-x-8">
                  <span className="w-48 text-base font-medium text-[#433E3F]">
                    Subtotal:
                  </span>
                  <span className="w-60 text-base text-[#0A0A0B] text-right">
                    {calculateTotals().subTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex justify-between w-full">
                <div className="flex items-center flex-1 gap-x-8">
                  <div className="w-48"></div>
                  <div className="w-60"></div>
                </div>
                <div className="flex items-center flex-1 justify-end gap-x-8">
                  <span className="w-48 text-base font-medium text-[#433E3F]">
                    Total CGST:
                  </span>
                  <span className="w-60 text-base text-[#0A0A0B] text-right">
                    {calculateTotals().totalCgst.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex justify-between w-full">
                <div className="flex items-center flex-1 gap-x-8">
                  <div className="w-48"></div>
                  <div className="w-60"></div>
                </div>
                <div className="flex items-center flex-1 justify-end gap-x-8">
                  <span className="w-48 text-base font-medium text-[#433E3F]">
                    Total SGST:
                  </span>
                  <span className="w-60 text-base text-[#0A0A0B] text-right">
                    {calculateTotals().totalSgst.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex justify-between w-full">
                <div className="flex items-center flex-1 gap-x-8">
                  <div className="w-48"></div>
                  <div className="w-60"></div>
                </div>
                <div className="flex items-center flex-1 justify-end gap-x-8 bg-[#F3E8FF] rounded-lg p-3">
                  <span className="w-48 text-xl font-medium text-[#442060]">
                    Grand Total
                  </span>
                  <span className="w-60 text-xl font-medium text-[#442060] text-right">
                    {calculateTotals().grandTotal.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4 w-full">
            <Button
              onClick={() =>
                handleShowModal({
                  message: "Are you sure you want to cancel this return?",
                  secondaryMessage: "All entered data will be lost.",
                  bgClassName: "bg-darkRed",
                  onConfirmCallback: () => setShowCreateReturn(false),
                })
              }
              label="Cancel"
              className="bg-gray-200 text-gray-800 hover:bg-gray-300 px-6 py-2 rounded-lg"
            />
            <MyButton
              onClick={() =>
                handleShowModal({
                  message:
                    "Are you sure you want to confirm payment? once confirmed, cannot be edited.",
                  secondaryMessage: "Confirm Payment",
                  bgClassName: "bg-darkPurple",
                  onConfirmCallback: handleSubmit,
                })
              }
              label={loading ? "Processing..." : "Confirm Return"}
              disabled={loading}
              className="bg-darkPurple text-white px-6 py-2 rounded-lg"
            />
          </div>
        </>
      )}
    </main>
  );
};

export default SalesReturn;
