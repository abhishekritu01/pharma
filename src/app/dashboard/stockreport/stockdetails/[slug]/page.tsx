"use client";

import { useParams } from "next/navigation";
import { getItemById } from "@/app/services/ItemService";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getPurchase } from "@/app/services/PurchaseEntryService";
import { getExpiredStock, getInventory, getInventoryDetails, updateStockItem  } from "@/app/services/InventoryService";
import PaginationTable from "@/app/components/common/PaginationTable";
import { toast } from "react-toastify";
import Link from "next/link";
import Button from "@/app/components/common/Button";
import { FaArrowDown, FaArrowUp } from "react-icons/fa";
import Loader from "@/app/components/common/Loader";
import { BsThreeDotsVertical } from "react-icons/bs";

interface PurchaseEntryItem {
  itemId: string;
  batchNo: string;
  packageQuantity: number;
  expiryDate: string;
  createdDate: string;
  invId: string;
   purchasePricePerUnit: number;
  mrpSalePricePerUnit: number;
}

interface PurchaseEntryData {
  supplierId: string;
  purchaseBillNo: string;
  purchaseDate: string;
  invId: string;
  stockItemDtos: PurchaseEntryItem[];
}

interface Item {
  itemId: string;
  itemName: string;
  purchaseUnit: number;
  variantName: string;
  unitName: string;
  manufacturer: string;
  purchasePrice: number;
  mrpSalePrice: number;
  purchasePricePerUnit: number;
  mrpSalePricePerUnit: number;
  gstPercentage: number;
  genericName: string;
  hsnNo: string;
  consumables: string;
  createdBy: number;
  createdDate: string;
  modifiedBy: number | null;
  modifiedDate: string | null;
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

export default function Page() {
  const params = useParams();
  const itemId = params.slug as string;
  const [item, setItem] = useState<Item | null>(null);
  const [purchaseRecords, setPurchaseRecords] = useState<
    (PurchaseEntryItem & { purchaseBillNo: string })[]
  >([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [totalStock, setTotalStock] = useState<number>(0);
  const [expiredStock, setExpiredStock] = useState<number>(0);
  const [currentStock, setCurrentStock] = useState<number>(0);
  const [searchText, setSearchText] = useState<string>("");
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
const [editingRow, setEditingRow] = useState<string | null>(null);
const [editFormData, setEditFormData] = useState<{
  mrpSalePricePerUnit: number;
  purchasePricePerUnit: number;
   expiryDate: string;
}>({ mrpSalePricePerUnit: 0, purchasePricePerUnit: 0, expiryDate: "" });
const toggleMenu = (uniqueId: string) => {
  setOpenMenuId((prev) => (prev === uniqueId ? null : uniqueId));
};

  useEffect(() => {
    const handleStockUpdated = () => {
      setRefreshTrigger(prev => prev + 1);
    };

    window.addEventListener('stockUpdated', handleStockUpdated as EventListener);
    
    return () => {
      window.removeEventListener('stockUpdated', handleStockUpdated as EventListener);
    };
  }, []);

  const filteredRecords = purchaseRecords.filter((record) => {
    const search = searchText.toLowerCase();
    return (
      record.batchNo?.toLowerCase().includes(search) ||
      record.purchaseBillNo?.toLowerCase().includes(search) ||
      (formatDate(record.expiryDate || "") ?? "--")
        .toLowerCase()
        .includes(search) ||
      record.packageQuantity?.toString().includes(search)
    );
  });

  const [sortConfig, setSortConfig] = useState<{
    key: keyof (PurchaseEntryItem & { purchaseBillNo: string }) | null;
    direction: "asc" | "desc";
  }>({ key: null, direction: "asc" });

  const handleSort = (
    key: keyof (PurchaseEntryItem & { purchaseBillNo: string })
  ) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return {
          key,
          direction: prev.direction === "asc" ? "desc" : "asc",
        };
      }
      
      return { key, direction: "asc" };
    });
  };

  const getSortedData = () => {
    const sorted = [...filteredRecords];

    if (sortConfig.key) {
      sorted.sort((a, b) => {
        const aValue = a[sortConfig.key!];
        const bValue = b[sortConfig.key!];

        // Special handling for dates
        if (sortConfig.key === "expiryDate" || sortConfig.key === "createdDate") {
          const dateA = new Date(aValue as string);
          const dateB = new Date(bValue as string);
          if (isNaN(dateA.getTime())) return sortConfig.direction === "asc" ? 1 : -1;
          if (isNaN(dateB.getTime())) return sortConfig.direction === "asc" ? -1 : 1;
          return sortConfig.direction === "asc"
            ? dateA.getTime() - dateB.getTime()
            : dateB.getTime() - dateA.getTime();
        }

        if (typeof aValue === "string" && typeof bValue === "string") {
          return sortConfig.direction === "asc"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        if (typeof aValue === "number" && typeof bValue === "number") {
          return sortConfig.direction === "asc"
            ? aValue - bValue
            : bValue - aValue;
        }

        return 0;
      });
    }

    return sorted;
  };

  const handleEditClick = (row: PurchaseEntryItem & { purchaseBillNo: string; invId: string }) => {
  const uniqueId = `${row.invId}-${row.itemId}-${row.batchNo}`;
  setEditingRow(uniqueId);
  setEditFormData({
    mrpSalePricePerUnit: row.mrpSalePricePerUnit || 0,
    purchasePricePerUnit: row.purchasePricePerUnit || 0,
    expiryDate: row.expiryDate || "",
  });
  setOpenMenuId(null);
};

const handleSave = async (row: PurchaseEntryItem & { purchaseBillNo: string; invId: string }) => {
if (editFormData.mrpSalePricePerUnit <= editFormData.purchasePricePerUnit) {
    toast.error("MRP per unit must be greater than Purchase price per unit");
    return;
  }
  try {
    await updateStockItem(row.invId, row.itemId, row.batchNo, editFormData);
    
    setPurchaseRecords(prev => prev.map(record => 
      record.invId === row.invId && 
      record.itemId === row.itemId && 
      record.batchNo === row.batchNo
        ? { ...record,
           mrpSalePricePerUnit: editFormData.mrpSalePricePerUnit,
            purchasePricePerUnit: editFormData.purchasePricePerUnit,
            expiryDate: editFormData.expiryDate
        }
        : record
    ));
    
    setEditingRow(null);
    setEditFormData({ mrpSalePricePerUnit: 0, purchasePricePerUnit: 0, expiryDate: "" });
    toast.success("Stock updated successfully");
  } catch (error) {
    console.error("Error updating stock:", error);
    toast.error("Failed to update stock");
  }
};

const handleCancel = () => {
  setEditingRow(null);
  setEditFormData({ mrpSalePricePerUnit: 0, purchasePricePerUnit: 0, expiryDate: "" });
};
  const columns = [
    {
      header: (
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => handleSort("purchaseBillNo")}
        >
          <span>Bill Number</span>
          {sortConfig.key === "purchaseBillNo" ? (
            sortConfig.direction === "asc" ? (
              <FaArrowUp />
            ) : (
              <FaArrowDown />
            )
          ) : (
            <FaArrowDown />
          )}
        </div>
      ),
      accessor: (row: { purchaseBillNo: string; invId: string }) => (
        <Link
          href={`/dashboard/orderSummary?id=${row.invId}`}
          className={`block w-full px-4 py-2 text-left ${row.invId
            ? "text-gray-700 hover:text-purple-600 hover:underline"
            : "text-gray-400 cursor-not-allowed"
            } transition-colors duration-200`}
        >
          {row.purchaseBillNo}
        </Link>
      ),
    },
    {
      header: (
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => handleSort("batchNo")}
        >
          <span>Batch Number</span>
          {sortConfig.key === "batchNo" ? (
            sortConfig.direction === "asc" ? (
              <FaArrowUp />
            ) : (
              <FaArrowDown />
            )
          ) : (
            <FaArrowDown />
          )}
        </div>
      ),
      accessor: (row: PurchaseEntryItem) => row.batchNo || "--",
    },
    {
      header: (
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => handleSort("createdDate")}
        >
          <span>Bill Date</span>
          {sortConfig.key === "createdDate" ? (
            sortConfig.direction === "asc" ? (
              <FaArrowUp />
            ) : (
              <FaArrowDown />
            )
          ) : (
            <FaArrowDown />
          )}
        </div>
      ),
      accessor: (row: PurchaseEntryItem) => formatDate(row.createdDate || ""),
    },
    {
      header: (
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => handleSort("packageQuantity")}
        >
          <span>Quantity</span>
          {sortConfig.key === "packageQuantity" ? (
            sortConfig.direction === "asc" ? (
              <FaArrowUp />
            ) : (
              <FaArrowDown />
            )
          ) : (
            <FaArrowDown />
          )}
        </div>
      ),
      accessor: (row: PurchaseEntryItem) =>
        row.packageQuantity?.toLocaleString() || "0",
    },
{
  header: "MRP per unit",
  accessor: (row: PurchaseEntryItem & { purchaseBillNo: string; invId: string }) => {
    const uniqueId = `${row.invId}-${row.itemId}-${row.batchNo}`;
    if (editingRow === uniqueId) {
      return (
        <input
          inputMode="decimal"
          type="text"
          value={editFormData.mrpSalePricePerUnit === 0 ? "" : editFormData.mrpSalePricePerUnit.toString()}
          onChange={(e) => {
            const value = e.target.value.replace(/[^0-9.]/g, '');
            
            const newValue = value === "" ? 0 : parseFloat(value);
            
            if (!isNaN(newValue)) {
              setEditFormData(prev => ({
                ...prev,
                mrpSalePricePerUnit: newValue,
              }));
            }
          }}
          onBlur={(e) => {
            const value = e.target.value;
            if (value === "" || value === "0") {
              setEditFormData(prev => ({
                ...prev,
                mrpSalePricePerUnit: 0,
              }));
            }
          }}
          className="w-20 border rounded p-1"
          placeholder="0.00"
        />
      );
    }
    return row.mrpSalePricePerUnit?.toFixed(2) || "0.00";
  },
},
{
  header: "Purchase price per unit",
  accessor: (row: PurchaseEntryItem & { purchaseBillNo: string; invId: string }) => {
    const uniqueId = `${row.invId}-${row.itemId}-${row.batchNo}`;
    if (editingRow === uniqueId) {
      return (
        <input
          inputMode="decimal"
          type="text"
          value={editFormData.purchasePricePerUnit === 0 ? "" : editFormData.purchasePricePerUnit.toString()}
          onChange={(e) => {
            const value = e.target.value.replace(/[^0-9.]/g, '');
            
            const newValue = value === "" ? 0 : parseFloat(value);
            
            if (!isNaN(newValue)) {
              setEditFormData(prev => ({
                ...prev,
                purchasePricePerUnit: newValue,
              }));
            }
          }}
          onBlur={(e) => {
            const value = e.target.value;
            if (value === "" || value === "0") {
              setEditFormData(prev => ({
                ...prev,
                purchasePricePerUnit: 0,
              }));
            }
          }}
          className="w-20 border rounded p-1"
          placeholder="0.00"
        />
      );
    }
    return row.purchasePricePerUnit?.toFixed(2) || "0.00";
  },
},
    {
  header: (
    <div
      className="flex items-center gap-2 cursor-pointer"
      onClick={() => handleSort("expiryDate")}
    >
      <span>Expiry Date</span>
      {sortConfig.key === "expiryDate" ? (
        sortConfig.direction === "asc" ? (
          <FaArrowUp />
        ) : (
          <FaArrowDown />
        )
      ) : (
        <FaArrowDown />
      )}
    </div>
  ),
  accessor: (row: PurchaseEntryItem & { purchaseBillNo: string; invId: string }) => {
    const uniqueId = `${row.invId}-${row.itemId}-${row.batchNo}`;
    
    if (editingRow === uniqueId) {
      return (
        <input
          type="date"
          value={editFormData.expiryDate}
          onChange={(e) => setEditFormData(prev => ({
            ...prev,
            expiryDate: e.target.value
          }))}
          className="w-32 border rounded p-1"
        />
      );
    }
    
    const expiryDate = new Date(row.expiryDate || "");
    const isValidDate = !isNaN(expiryDate.getTime());
    const isExpired = isValidDate && expiryDate < new Date();

    return (
      <div className="flex items-center gap-1">
        {isValidDate && (
          <svg
            width="9"
            height="9"
            viewBox="0 0 9 9"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="shrink-0"
          >
            <circle
              cx="4.5"
              cy="4.5"
              r="4"
              fill={isExpired ? "#FF0000" : "#28A745"}
            />
          </svg>
        )}
        <span className={isExpired ? "text-black" : ""}>
          {formatDate(row.expiryDate || "")}
        </span>
      </div>
    );
  },
},
    {
    header: "Actions",
    accessor: (row: PurchaseEntryItem & { purchaseBillNo: string; invId: string }) => {
      const uniqueId = `${row.invId}-${row.itemId}-${row.batchNo}`;
      
      if (editingRow === uniqueId) {
        return (
          <div className="flex space-x-2">
            <button
              onClick={() => handleSave(row)}
              className="px-2 py-1 bg-darkPurple text-white rounded"
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              className="px-2 py-1 bg-gray-500 text-white rounded"
            >
              Cancel
            </button>
          </div>
        );
      }
      return (
        <div className="relative menu-container">
          <button
            className="p-2 rounded-full hover:bg-gray-200 cursor-pointer"
            onClick={() => toggleMenu(uniqueId)}
          >
            <BsThreeDotsVertical size={18} />
          </button>

          {openMenuId === uniqueId && (
            <div className="absolute right-0 mt-2 w-48 bg-white shadow-xl rounded-lg z-10 border border-gray-200">
              <button
                onClick={() => handleEditClick(row)}
                className="block w-full px-4 py-3 text-left text-gray-700 cursor-pointer hover:bg-purple-950 hover:text-white hover:rounded-lg transition-colors duration-150"
              >
                Edit
              </button>
            </div>
          )}
        </div>
      );
    },
  }
    
  ];

     const fetchStockData = useCallback(async () => {
    if (!itemId) return;

    try {
      setLoading(true);
      setError(null);

      const itemData = await getItemById(itemId);
      setItem(itemData);

      const res = await getPurchase();
      const purchases: PurchaseEntryData[] = res.data;

      const records = purchases.flatMap((entry) =>
        entry.stockItemDtos
          .filter((item) => item.itemId === itemId)
          .map((item) => ({
            ...item,
            purchaseBillNo: entry.purchaseBillNo,
            invId: entry.invId,
          }))
      );
      setPurchaseRecords(records);

        const inventoryResponseRaw = await getInventory();
        const expiredStockResponseRaw = await getExpiredStock();
         const inventoryDetailsResponse = await getInventoryDetails();
        
        const inventoryResponse = inventoryResponseRaw.data;
        const expiredStockResponse = expiredStockResponseRaw.data;
         const inventoryDetails = inventoryDetailsResponse.data;
        
        if (!Array.isArray(inventoryResponse) || !Array.isArray(expiredStockResponse) || !Array.isArray(inventoryDetails)) {
        throw new Error("Invalid data format from API");
      }
        
        const expiredStockMap = new Map(
        expiredStockResponse.map((item: { itemId: string; packageQuantity: number }) => [
          item.itemId,
          item.packageQuantity,
        ])
      );

      const inventoryDetailsMap = new Map();
      interface InventoryDetail {
        itemId: string;
        packageQuantity: number;
      }

      inventoryDetails.forEach((detail: InventoryDetail) => {
        if (inventoryDetailsMap.has(detail.itemId)) {
          inventoryDetailsMap.set(
            detail.itemId, 
            inventoryDetailsMap.get(detail.itemId) + (detail.packageQuantity || 0)
          );
        } else {
          inventoryDetailsMap.set(detail.itemId, detail.packageQuantity || 0);
        }
      });
        
        const inventoryItem = inventoryResponse.find(item => item.itemId === itemId);
        
        if (inventoryItem) {
        const itemExpiredStock = expiredStockMap.get(itemId) || 0;
        const totalPackageQuantity = inventoryDetailsMap.get(itemId) || inventoryItem.packageQuantity || 0;
        setTotalStock(totalPackageQuantity);
        setExpiredStock(itemExpiredStock);
        setCurrentStock(totalPackageQuantity - itemExpiredStock);
      } else {
        setTotalStock(0);
        setExpiredStock(0);
        setCurrentStock(0);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load data. Please try again later.");
      toast.error("Failed to load stock details");
    } finally {
      setLoading(false);
    }
  }, [itemId]);
  useEffect(() => {
    fetchStockData();
  }, [fetchStockData, refreshTrigger]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <Loader type="spinner" size="md" text="Loading ..." fullScreen={false} />
      </div>
    );

  if (error)
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-red-500"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );

  if (!item)
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <h3 className="text-lg font-medium text-gray-900">Item not found</h3>
      </div>
    );

  return (
    <div className="w-full">
      {/* Header */}
      <div className="w-full">
        <h1 className="text-[28px] font-medium text-[#442060]">
          Stock Details
        </h1>
      </div>

      {/* Basic Details Card */}
      <div className="w-full p-6 rounded-lg border border-[#B5B3B3] bg-white flex flex-col gap-6 mb-6">
        <h2 className="text-lg font-normal text-[#0A0A0B]">Basic Details</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="w-full h-[96px] p-6 flex flex-col justify-center items-start rounded-lg bg-[#FAFAFA]">
            <div className="text-sm text-[#433E3F] font-inter font-normal leading-[161.8%]">
              Item Name
            </div>
            <div className="text-base text-[#0A0A0B] font-inter font-normal leading-[161.8%] truncate w-full">
              {item.itemName || "--"}
            </div>
          </div>

          <div className="w-full h-[96px] p-6 flex flex-col justify-center items-start rounded-lg bg-[#FAFAFA]">
            <div className="text-sm text-[#433E3F] font-inter font-normal leading-[161.8%]">
              Generic Name
            </div>
            <div className="text-base text-[#0A0A0B] font-inter font-normal leading-[161.8%] truncate w-full">
              {item.genericName || "--"}
            </div>
          </div>

          <div className="w-full h-[96px] p-6 flex flex-col justify-center items-start rounded-lg bg-[#FAFAFA]">
            <div className="text-sm text-[#433E3F] font-inter font-normal leading-[161.8%]">
              Manufacturer
            </div>
            <div className="text-base text-[#0A0A0B] font-inter font-normal leading-[161.8%] truncate w-full">
              {item.manufacturer || "--"}
            </div>
          </div>

          <div className="w-full h-[96px] p-6 flex flex-col justify-center items-start rounded-lg bg-[#FAFAFA]">
            <div className="text-sm text-[#433E3F] font-inter font-normal leading-[161.8%]">
              Variant
            </div>
            <div className="text-base text-[#0A0A0B] font-inter font-normal leading-[161.8%] truncate w-full">
              {item.variantName || "--"}
            </div>
          </div>

          {/* Unit Field */}
          <div className="w-full h-[96px] p-6 flex flex-col justify-center items-start rounded-lg bg-[#FAFAFA]">
            <div className="text-sm text-[#433E3F] font-inter font-normal leading-[161.8%]">
              Unit Type
            </div>
            <div className="text-base text-[#0A0A0B] font-inter font-normal leading-[161.8%] truncate w-full">
              {item.unitName || "--"}
            </div>
          </div>

          <div className="w-full h-[96px] p-6 flex flex-col justify-center items-start rounded-lg bg-[#FAFAFA]">
            <div className="text-sm text-[#433E3F] font-inter font-normal leading-[161.8%]">
              Total Stock Qty
            </div>
            <div className="text-base text-[#0A0A0B] font-inter font-normal leading-[161.8%]">
              {totalStock.toLocaleString()}
            </div>
          </div>

          {/* Expired Stock Field */}
          <div className="w-full h-[96px] p-6 flex flex-col justify-center items-start rounded-lg bg-[#FAFAFA]">
            <div className="text-sm text-[#433E3F] font-inter font-normal leading-[161.8%]">
              Expired Stock
            </div>
            <div className="text-base text-[#0A0A0B] font-inter font-normal leading-[161.8%]">
              {expiredStock.toLocaleString()}
            </div>
          </div>

          {/* Current Stock Field */}
          <div className="w-full h-[96px] p-6 flex flex-col justify-center items-start rounded-lg bg-[#FAFAFA]">
            <div className="text-sm text-[#433E3F] font-inter font-normal leading-[161.8%]">
              Current Stock
            </div>
            <div className="text-base text-[#0A0A0B] font-inter font-normal leading-[161.8%]">
              {currentStock.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="mb-6">
        <div className="w-full mb-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-normal text-[#0A0A0B]">
              Stock Details
            </h2>
            <div className="relative">
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search table..."
                className="w-80 border border-gray-300 rounded-md pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#442060] focus:border-transparent"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
        <PaginationTable
          data={getSortedData()}
          columns={columns}
          noDataMessage="No stock records found for this item"
        />
      </div>

      <div className="flex justify-end">
        <Button
          type="button"
          onClick={() => router.back()}
          label="Back"
          className="w-20"
        />
      </div>
    </div>
  );
}