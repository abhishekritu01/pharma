"use client";

import Table from "@/app/components/common/Table";
import { getExpiredStock, getInventory } from "@/app/services/InventoryService";
import { getItemById } from "@/app/services/ItemService";
import { getPurchase } from "@/app/services/PurchaseEntryService";
import { getSupplierById } from "@/app/services/SupplierService";
import { InventoryData } from "@/app/types/InventoryData";
import { PurchaseEntryData, PurchaseEntryItem } from "@/app/types/PurchaseEntry";
import React, { useEffect, useState } from "react";
import { IoArrowBackCircleSharp } from "react-icons/io5";
import { toast } from "react-toastify";

interface ViewStockProps {
  setShowViewStock: (value: boolean) => void;
  itemId: string | null;
}

const ViewStock: React.FC<ViewStockProps> = ({ setShowViewStock, itemId }) => {
  const [inventoryData, setInventoryData] = useState<InventoryData[]>([]);
  const [tableData, setTableData] = useState<PurchaseEntryItem[]>([]);

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
  };
  

  const columns = [
    {
      header: "Batch Number",
      accessor: "batchNo" as keyof PurchaseEntryItem,
    },
    // {
    //   header: "Pharmacy",
    //   accessor: "pharmacyName" as keyof PurchaseEntryItem,
    // },
    {
      header: "Supplier Name",
      accessor: "supplierName" as keyof PurchaseEntryItem,
    },
    {
      header: "Purchase Price Per Unit",
      accessor: (row: PurchaseEntryItem) => (
        <span className="p-2">{row.purchasePricePerUnit}</span>
      ),
    },
    {
      header: "MRP Per Unit",
      accessor: (row: PurchaseEntryItem) => (
        <span className="p-2">{row.mrpSalePricePerUnit}</span>
      ),
    },
    {
      header: "Expired On",
      accessor: (row: PurchaseEntryItem) => {
        const isExpired = new Date(row.expiryDate) < new Date();
        return (
          <span className={isExpired ? "p-2 items-center justify-center text-Red bg-secondaryRed w-full h-full rounded-2xl" : "p-2"}>
            {formatDate(row.expiryDate)}
          </span>
        );
      },
    },
    
    {
      header: "Quantity",
      accessor: (row: PurchaseEntryItem) => {
        const isExpired = new Date(row.expiryDate) < new Date();
        return (
          <span className={isExpired ? "p-2 items-center justify-center text-Red bg-secondaryRed w-full h-full rounded-2xl" : "p-2"}>
            {row.packageQuantity}
          </span>
        );
      },
    }
    
  ];


  useEffect(() => {
    const fetchStockData = async () => {
      if (!itemId) return;
  
      try {
        const res = await getPurchase();
        const purchases: PurchaseEntryData[] = res.data;
  
        // Step 1: Filter items by itemId, and attach supplierId from parent
        const allFilteredItems: (PurchaseEntryItem & { supplierId: string })[] =
          purchases.flatMap((entry) =>
            entry.stockItemDtos
              .filter((item) => item.itemId === itemId)
              .map((item) => ({
                ...item,
                supplierId: entry.supplierId,
              }))
          );
  
        // Step 2: Extract unique supplierIds
        const uniqueSupplierIds = [
          ...new Set(allFilteredItems.map((item) => item.supplierId)),
        ];
  
        // Step 3: Fetch supplier names in parallel
        const supplierMap: Record<string, string> = {};
        await Promise.all(
          uniqueSupplierIds.map(async (id) => {
            try {
              const supplier = await getSupplierById(id);
              console.log("Supplierrrr",supplier);
              
              supplierMap[id] = supplier.supplierName ?? "Unknown";
            } catch (err) {
              console.error(`Failed to fetch supplier with ID ${id}`, err);
              supplierMap[id] = "Unknown";
            }
          })
        );
  
        // Step 4: Attach supplierName to each item
        const enrichedItems = allFilteredItems.map((item) => ({
          ...item,
          supplierName: supplierMap[item.supplierId] ?? "Unknown",
        }));
  
        setTableData(enrichedItems);
      } catch (error) {
        console.error("Error fetching stock table data:", error);
        toast.error("Failed to load stock details.");
      }
    };
  
    fetchStockData();
  }, [itemId]);
  


  const fetchItem = async (
    itemId: string
  ): Promise<{ name: string; manufacturer: string }> => {
    try {
      const item = await getItemById(itemId);
      return { name: item.itemName, manufacturer: item.manufacturer };
    } catch (error) {
      console.error("Error fetching Item:", error);
      return { name: "Unknown Item", manufacturer: "Unknown Manufacturer" };
    }
  };

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const inventoryResponseRaw = await getInventory();
        const expiredStockResponseRaw = await getExpiredStock();

        const inventoryResponse = inventoryResponseRaw.data;
        const expiredStockResponse = expiredStockResponseRaw.data;

        if (
          !Array.isArray(inventoryResponse) ||
          !Array.isArray(expiredStockResponse)
        ) {
          throw new Error("Invalid data format from API");
        }

        const expiredStockMap = new Map(
          expiredStockResponse.map((item) => [
            item.itemId,
            item.packageQuantity,
          ])
        );

        const inventoryWithData: InventoryData[] = await Promise.all(
          inventoryResponse.map(async (inventory) => {
            const { name, manufacturer } = await fetchItem(inventory.itemId);
            const expiredStock = expiredStockMap.get(inventory.itemId) || 0;
            return {
              ...inventory,
              itemName: name,
              manufacturer,
              expiredStock: expiredStockMap.get(inventory.itemId) || 0,
              currentStock: inventory.packageQuantity - expiredStock,
            };
          })
        );

        setInventoryData(inventoryWithData);
      } catch (error) {
        console.error("Error fetching inventory:", error);
        toast.error(
          error instanceof Error ? error.message : "An unknown error occurred"
        );
      }
    };

    fetchInventory();
  }, []);

  return (
    <>
      <main className="space-y-8">
        <div className="flex justify-between items-center">
          <div className="justify-start text-darkPurple text-3xl font-medium leading-10">
            Stock Details
          </div>
          <div>
            <button
              onClick={() => setShowViewStock(false)}
              className="hover:opacity-80 transition cursor-pointer"
            >
              <IoArrowBackCircleSharp size={28} color="4B0082" />
            </button>
          </div>
        </div>


{itemId && (
  <div className="border border-Gray w-full rounded-lg p-5 flex justify-between">
    {(() => {
      const itemData = inventoryData.find((item) => item.itemId === itemId);
      if (!itemData) return <div className="text-gray-500">Loading item data...</div>;
      return (
        <>
          <div className="flex flex-col">
            <div className="font-normal text-sm text-gray">Item Name</div>
            <div className="font-normal text-base">{itemData.itemName}</div>
          </div>
          <div className="flex flex-col">
            <div className="font-normal text-sm text-gray">Manufacturer</div>
            <div className="font-normal text-base">{itemData.manufacturer}</div>
          </div>
          <div className="flex flex-col">
            <div className="font-normal text-sm text-gray">Total Stock</div>
            <div className="font-normal text-base">{itemData.packageQuantity}</div>
          </div>
          <div className="flex flex-col">
            <div className="font-normal text-sm text-gray">Expired Stock</div>
            <div className="px-2 font-normal text-base text-Red bg-secondaryRed rounded-2xl w-fit">{itemData.expiredStock}</div>
          </div>
          <div className="flex flex-col">
            <div className="font-normal text-sm text-gray">Current Stock</div>
            <div className="font-normal text-base">{itemData.currentStock}</div>
          </div>
        </>
      );
    })()}
  </div>
)}

        <Table data={tableData} columns={columns} noDataMessage="No records found" />
      </main>
    </>
  );
};

export default ViewStock;
