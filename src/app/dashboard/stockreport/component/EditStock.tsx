"use client";

import Button from "@/app/components/common/Button";
import { InventoryData } from "@/app/types/InventoryData";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { getInventoryDetails, saveInventoryDetails } from "@/app/services/InventoryService";
import SelectField from "@/app/components/common/SelectField";
import { Listbox } from "@headlessui/react";
import { ListboxButton } from "@headlessui/react";

type OptionType = {
    label: string;
    value: string;
    firstName?: string;
    lastName?: string;
    phone?: number;
};

interface BatchInfo {
    batchNo: string;
    expiryDate: string;
    invDetailsId: string;
    packageQuantity: number;
}

interface EditStockProps {
    setShowDrawer: (value: boolean) => void;
    item: InventoryData & { genericName?: string };
    onSuccess?: () => void;
}

interface InventoryDetailResponse {
    batchNo: string;
    expiryDate: string;
    invDetailsId: string;
    packageQuantity: number;
    itemId: string;
    purchasePrice?: number;
    mrpSalePrice?: number;
    purchasePricePerUnit?: number;
    mrpSalePricePerUnit?: number;
    gstPercentage?: number;
    gstAmount?: number;
    createdBy?: number;
    createdDate?: string;
    modifiedBy?: number;
    modifiedDate?: string;
    stockEditDtos?: {
        adjustmentType: string;
        updatedStockQuantity: number;
    }[];
}

const formatDate = (dateStr: string): string => {
    try {
        const date = new Date(dateStr);
        return isNaN(date.getTime())
            ? "--"
            : `${String(date.getDate()).padStart(2, "0")}/${String(
                date.getMonth() + 1
            ).padStart(2, "0")}/${date.getFullYear()}`;
    } catch {
        return "--";
    }
};


const isBatchExpired = (expiryDate: string): boolean => {
    if (!expiryDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryDate);
    return expiry < today;
};

interface BatchOption extends OptionType {
    batchNo: string;
    expiryDate: string;
    packageQuantity: number;
    isExpired: boolean;
}

const EditStock: React.FC<EditStockProps> = ({
    setShowDrawer,
    item,
    onSuccess,
}) => {
    const [adjustmentType, setAdjustmentType] = useState<string>("");
    const [stockQty, setStockQty] = useState<number>(0);
    const [batches, setBatches] = useState<BatchInfo[]>([]);
    const [batchOptions, setBatchOptions] = useState<BatchOption[]>([]);
    const [selectedBatch, setSelectedBatch] = useState<BatchOption | null>(null);
    const [expiryDate, setExpiryDate] = useState<string>("");
    const [currentStock, setCurrentStock] = useState<number>(0);
    const [, setLoading] = useState<boolean>(true);

    const adjustmentOptions = [
        { value: "ADD_STOCK", label: "Add Stock" },
        { value: "REMOVE_STOCK", label: "Remove Stock" },
    ];

    useEffect(() => {
        const fetchBatches = async () => {
            try {
                setLoading(true);
                const response = await getInventoryDetails();
                const inventoryDetails = response.data;

                const itemBatches: BatchInfo[] = inventoryDetails
                    .filter((detail: InventoryDetailResponse) =>
                        detail.itemId === item.itemId
                    )
                    .map((detail: InventoryDetailResponse) => ({
                        batchNo: detail.batchNo,
                        expiryDate: detail.expiryDate,
                        invDetailsId: detail.invDetailsId,
                        packageQuantity: detail.packageQuantity
                    }));

                setBatches(itemBatches);

                const options = itemBatches
                    .filter(batch => !isBatchExpired(batch.expiryDate))
                    .map(batch => ({
                        value: batch.batchNo,
                        label: `${batch.batchNo} - ${batch.packageQuantity}`,
                        batchNo: batch.batchNo,
                        expiryDate: batch.expiryDate,
                        packageQuantity: batch.packageQuantity,
                        isExpired: false
                    }));

                setBatchOptions(options);
            } catch (error) {
                console.error("Error fetching batches:", error);
                toast.error("Failed to load batches");
            } finally {
                setLoading(false);
            }
        };

        fetchBatches();
    }, [item.itemId]);

    const loadBatchOptions = (
        inputValue: string,
        callback: (options: BatchOption[]) => void
    ) => {
        const filtered = batchOptions.filter(
            (opt) =>
                opt.label.toLowerCase().includes(inputValue.toLowerCase()) ||
                String(opt.value).toLowerCase().includes(inputValue.toLowerCase())
        );

        callback(filtered);
    };

    const handleBatchChange = (selectedOption: OptionType | null) => {

        const batchOption = selectedOption as BatchOption | null;

        setSelectedBatch(batchOption);

        if (batchOption) {
            setExpiryDate(batchOption.expiryDate);
            setCurrentStock(batchOption.packageQuantity);

            if (batchOption.packageQuantity === 0 && adjustmentType === "REMOVE_STOCK") {
                setAdjustmentType("");
            }
        } else {
            setExpiryDate("");
            setCurrentStock(0);
        }
    };

    const formatBatchOptionLabel = (data: OptionType, { context }: { context: string }) => {
        if (context === "menu") {
            const [batchNo, quantity] = data.label.split(' - ');
            return (
                <div className="flex items-center">
                    <span>{batchNo}</span>
                    <span className="ml-1">- Qty: {quantity}</span>
                </div>
            );
        }

        const batchNo = data.label.split(' - ')[0];
        return <span>{batchNo}</span>;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedBatch) {
            toast.error("Please select a batch");
            return;
        }

        if (!adjustmentType) {
            toast.error("Please select an adjustment type");
            return;
        }

        if (stockQty <= 0) {
            toast.error("Please enter a valid quantity");
            return;
        }

        if (adjustmentType === "REMOVE_STOCK" && stockQty > currentStock) {
            toast.error("Cannot remove more stock than available");
            return;
        }

        try {
            const selectedBatchData = batches.find(b => b.batchNo === selectedBatch.batchNo);

            if (!selectedBatchData) {
                throw new Error("Selected batch not found");
            }

            const payload = {
                invDetailsId: selectedBatchData.invDetailsId,
                stockEditDtos: [
                    {
                        adjustmentType: adjustmentType,
                        updatedStockQuantity: stockQty
                    }
                ]
            };

            await saveInventoryDetails(JSON.stringify(payload));
            setShowDrawer(false);

            if (onSuccess) {
                onSuccess();
            }
        } catch (error) {
            console.error("Error updating stock:", error);
            toast.error("Failed to update stock");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-10">
            {/* Basic Details */}
            <div className="space-y-6">
                <h3 className="text-lg font-medium">Item Details</h3>
                <div className="grid grid-cols-2 gap-y-8 gap-x-12">
                    <div>
                        <label className="text-sm text-gray-600">Item Name</label>
                        <div className="font-medium">{item.itemName}</div>
                    </div>
                    <div>
                        <label className="text-sm text-gray-600">Generic Name</label>
                        <div className="font-medium">{item.genericName || "--"}</div>
                    </div>
                    <div>
                        <label className="text-sm text-gray-600">Manufacturer</label>
                        <div className="font-medium">{item.manufacturer || "--"}</div>
                    </div>
                    <div>
                        <label className="text-sm text-gray-600">Current Stock</label>
                        <div className="font-medium">{item.currentStock}</div>
                    </div>
                </div>
            </div>

            {/* Stock Details */}
            <div className="border border-Gray rounded-lg p-4 space-y-10">
                <h3 className="text-lg font-medium">Stock Details</h3>
                <div className="grid grid-cols-2 gap-6">
                    {/* Batch Number */}
                    <div className="space-y-2">
                        <div className="relative">
                            <SelectField
                                value={selectedBatch}
                                onChange={handleBatchChange}
                                label="Batch Number *"
                                loadOptions={loadBatchOptions}
                                defaultOptions={batchOptions}
                                isClearable
                                formatOptionLabel={formatBatchOptionLabel}

                            />
                        </div>
                    </div>

                    {/* Expiry Date */}
                    <div className="space-y-2">
                        <div className="relative">
                            <input
                                type="text"
                                value={expiryDate ? formatDate(expiryDate) : ""}
                                readOnly
                                className="peer w-full px-3 py-3 border border-gray-400 rounded-md bg-transparent text-black outline-none focus:border-purple-900 focus:ring-0 cursor-not-allowed"
                            />
                            <label className="absolute left-3 top-0 -translate-y-1/2 bg-white px-1 text-gray-500 text-xs transition-all pointer-events-none">
                                Expiry Date
                            </label>
                        </div>
                    </div>

                    {/* Adjustment Type */}
                    <div className="space-y-2">
                        <div className="relative w-full">
                            {/* <select
                                value={adjustmentType}
                                onChange={(e) => setAdjustmentType(e.target.value)}
                                className="peer w-full h-[49px] px-3 py-3 border border-Gray rounded-md bg-transparent text-black outline-none focus:border-purple-900 focus:ring-0"
                                required
                            >
                                <option value="" disabled>
                                    Select Adjustment Type
                                </option>
                                {adjustmentOptions.map((option) => (
                                    <option
                                        key={option.value}
                                        value={option.value}
                                        disabled={option.value === "REMOVE_STOCK" && currentStock === 0}
                                        className="hover:bg-darkPurple hover:text-white"
                                    >
                                        {option.label}
                                    </option>
                                ))}
                            </select> */}
                            <Listbox value={adjustmentType} onChange={setAdjustmentType}>
                                <ListboxButton
                                    className="peer w-full h-[49px] px-3 py-3 border border-Gray rounded-md bg-transparent text-black outline-none focus:border-purple-900 flex items-center justify-between"
                                >
                                    <span>
                                        {adjustmentOptions.find(o => o.value === adjustmentType)?.label ||
                                            "Select Adjustment Type"}
                                    </span>
                                </ListboxButton>

                                <Listbox.Options className="absolute mt-1 w-full border border-Gray rounded-md bg-white shadow-lg z-10">
                                    {adjustmentOptions.map((option) => (
                                        <Listbox.Option
                                            key={option.value}
                                            value={option.value}
                                            disabled={
                                                option.value === "REMOVE_STOCK" && currentStock === 0
                                            }
                                            className={({ active, disabled }) =>
                                                `cursor-pointer px-3 py-2 h-[40px] flex items-center ${active ? "bg-purple-900 text-white" : "text-black"
                                                } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`
                                            }
                                        >
                                            {option.label}
                                        </Listbox.Option>
                                    ))}
                                </Listbox.Options>
                            </Listbox>
                            <label className="absolute left-3 top-0 -translate-y-1/2 bg-white px-1 text-gray-500 text-xs transition-all pointer-events-none">
                                Adjustment Type <span className="text-tertiaryRed">*</span>
                            </label>
                        </div>
                    </div>

                    {/* Update Stock Qty */}
                    <div className="space-y-2">
                        <div className="relative">
                            {/* <input
                                type="number"
                                value={stockQty}
                                onChange={(e) => setStockQty(Number(e.target.value))}
                                className="peer w-full px-3 py-3 border border-gray-400 rounded-md bg-transparent text-black outline-none focus:border-purple-900 focus:ring-0"
                                min={1}
                                required
                            /> */}
                            <input
                                type="number"
                                value={stockQty === 0 ? "" : stockQty}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (value === "") {
                                        setStockQty(0);
                                    } else {
                                        setStockQty(Number(value));
                                    }
                                }}
                                className="peer w-full px-3 py-3 border border-gray-400 rounded-md bg-transparent text-black outline-none focus:border-purple-900 focus:ring-0"
                                min={1}
                                required
                            />


                            <label className="absolute left-3 top-0 -translate-y-1/2 bg-white px-1 text-gray-500 text-xs transition-all pointer-events-none">
                                Update Stock Qty <span className="text-tertiaryRed">*</span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-start space-x-4 pt-6">
                <Button
                    label={"Save"}
                    className="bg-darkPurple text-white px-6 py-2"
                    type="submit"
                />
            </div>
        </form>
    );
};

export default EditStock;