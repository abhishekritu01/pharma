"use client";

import Input from "@/app/components/common/Input";
import Table from "@/app/components/common/Table";
import { getExpiredStock, getInventory } from "@/app/services/InventoryService";
import { getItemById } from "@/app/services/ItemService";
import { InventoryData } from "@/app/types/InventoryData";
import { Search } from "lucide-react";
import React, { useEffect, useState } from "react";
import { BiSolidShow } from "react-icons/bi";
import { toast } from "react-toastify";
import ViewStock from "./component/ViewStock";

const Page = () => {
  const [searchText, setSearchText] = useState<string>("");
  const [inventoryData, setInventoryData] = useState<InventoryData[]>([]);
  const [showViewStock, setShowViewStock] = useState(false);
  const [itemId, setItemId] = useState<string | null>(null);

  const columns = [
    {
      header: "Item Name",
      accessor: "itemName" as keyof InventoryData,
    },
    {
      header: "Manufacturer",
      accessor: "manufacturer" as keyof InventoryData,
    },
    {
      header: "Total Stock",
      accessor: (row: InventoryData) => (
        <span className="p-2">{row.packageQuantity}</span>
      ),
    },
    {
      header: "Expired Stock",
      accessor: (row: InventoryData) =>
        row.expiredStock && row.expiredStock > 0 ? (
          <span className="p-2 items-center justify-center text-Red bg-secondaryRed w-full h-[27px] rounded-2xl">
            {row.expiredStock}
          </span>
        ) : (
          <span className="p-2">{row.expiredStock}</span>
        ),
    },
    
    {
      header: "Current Stock",
      accessor: (row: InventoryData) =>   
         row.currentStock && row.currentStock <= 10 ? (
        <span className="p-2 items-center justify-center text-Red bg-secondaryRed w-full h-[27px] rounded-2xl">
          {row.currentStock}
        </span>
      ) : (
        <span className="p-2">{row.currentStock}</span>
      ),
    },
    {
      header: "Action",
      accessor: (row: InventoryData) => (
        <div className="p-2">
          <button
            className="cursor-pointer hover:opacity-80 transition"
            onClick={() => row.itemId && handleViewStock(row.itemId)}
          >
            <BiSolidShow size={23} color="4B0082"/>
          </button>
        </div>
      ),
    },
  ];

  const handleViewStock = (itemId: string) => {
    setItemId(itemId);
    setShowViewStock(true);
  };

  const filteredData = inventoryData.filter((item) => {
    const search = searchText.toLowerCase();

    return (
      item.itemName?.toLowerCase().includes(search) ||
      item.manufacturer?.toLowerCase().includes(search) ||
      item.currentStock?.toString().toLowerCase().includes(search) ||
      item.expiredStock?.toString().toLowerCase().includes(search)
    );
  });

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
      {!showViewStock && (
        <main className="space-y-10">
          <div className="flex justify-between">
            <div className="justify-start text-darkPurple text-3xl font-medium leading-10">
              Stock List
            </div>

            <div>
              <Input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search Table..."
                className="w-80 border-gray-300"
                icon={<Search size={18} />}
              />
            </div>
          </div>

          <Table
            data={filteredData}
            columns={columns}
            noDataMessage="No records found"
          />
        </main>
      )}
      {showViewStock && (
        <ViewStock setShowViewStock={setShowViewStock} itemId={itemId} />
      )}
    </>
  );
};

export default Page;
