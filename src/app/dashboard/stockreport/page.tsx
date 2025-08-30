"use client";
import Input from "@/app/components/common/Input";
import PaginationTable from "@/app/components/common/PaginationTable";
import { getExpiredStock, getInventory } from "@/app/services/InventoryService";
import { getItemById } from "@/app/services/ItemService";
import { InventoryData } from "@/app/types/InventoryData";
import { ItemData } from "@/app/types/ItemData";
import { Search } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { BsThreeDotsVertical } from "react-icons/bs";
import Link from "next/link";
import { FaArrowDown, FaArrowUp } from "react-icons/fa";
import Loader from "@/app/components/common/Loader";

interface ExtendedInventoryData extends InventoryData {
  genericName: string;
  variantId?: string;
  unitId?: string;
  unitName: string;
  variantName: string;
  itemName: string;
  manufacturer: string;
  expiredStock: number;
  currentStock: number;
}

const Page = () => {
  const [searchText, setSearchText] = useState<string>("");
  const [inventoryData, setInventoryData] = useState<ExtendedInventoryData[]>(
    []
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const showStocksDetails = false;
  const [sortConfig, setSortConfig] = useState<{
    key: keyof ExtendedInventoryData | null;
    direction: "asc" | "desc";
  }>({ key: null, direction: "asc" });

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const toggleMenu = (itemId?: string) => {
    setOpenMenuId((prev) => (prev === itemId ? null : itemId || null));
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".menu-container")) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSort = (key: keyof ExtendedInventoryData) => {
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
    const sorted = [...filteredData];

    if (sortConfig.key) {
      sorted.sort((a, b) => {
        const aValue = a[sortConfig.key!];
        const bValue = b[sortConfig.key!];

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

  const columns = [
    {
      header: (
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => handleSort("itemName")}
        >
          <span>Item Name</span>
          {sortConfig.key === "itemName" ? (
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
      accessor: "itemName" as keyof ExtendedInventoryData,
    },
    {
      header: (
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => handleSort("genericName")}
        >
          <span>Generic Name</span>
          {sortConfig.key === "genericName" ? (
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
      accessor: (row: ExtendedInventoryData) => (
        <span className="p-2">{row.genericName ?? "--"}</span>
      ),
    },
    {
      header: (
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => handleSort("manufacturer")}
        >
          <span>Manufacturer</span>
          {sortConfig.key === "manufacturer" ? (
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
      accessor: "manufacturer" as keyof ExtendedInventoryData,
    },
    {
      header: (
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => handleSort("variantName")}
        >
          <span>Variant</span>
          {sortConfig.key === "variantName" ? (
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
      accessor: (row: ExtendedInventoryData) => (
        <span className="p-2">{row.variantName ?? "--"}</span>
      ),
    },
    {
      header: (
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => handleSort("unitName")}
        >
          <span>Unit Type</span>
          {sortConfig.key === "unitName" ? (
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
      accessor: (row: ExtendedInventoryData) => (
        <span className="p-2">{row.unitName ?? "--"}</span>
      ),
    },
    {
      header: (
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => handleSort("packageQuantity")}
        >
          <span>Total Stock</span>
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
      accessor: (row: ExtendedInventoryData) => (
        <span className="p-2">{row.packageQuantity?.toLocaleString()}</span>
      ),
    },
    {
      header: (
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => handleSort("expiredStock")}
        >
          <span>Expired Stock</span>
          {sortConfig.key === "expiredStock" ? (
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
      accessor: (row: ExtendedInventoryData) =>
        row.expiredStock && row.expiredStock > 0 ? (
          <span className="p-2 items-center justify-center text-Red bg-secondaryRed w-full h-[27px] rounded-2xl">
            {row.expiredStock?.toLocaleString()}
          </span>
        ) : (
          <span className="p-2">{row.expiredStock?.toLocaleString()}</span>
        ),
    },
    {
      header: (
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => handleSort("currentStock")}
        >
          <span>Current Stock</span>
          {sortConfig.key === "currentStock" ? (
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
      accessor: (row: ExtendedInventoryData) => {
        let colorClass =
          "p-2 items-center justify-center text-Green bg-secondaryGreen w-full h-[27px] rounded-2xl";
        if (row.currentStock <= 0) {
          colorClass =
            "p-2 items-center justify-center text-Red bg-secondaryRed w-full h-[27px] rounded-2xl";
        } else if (row.currentStock <= 10) {
          colorClass =
            "p-2 items-center justify-center text-Yellow bg-secondaryYellow w-full h-[27px] rounded-2xl";
        }
        return (
          <span className={colorClass}>
            {row.currentStock?.toLocaleString()}
          </span>
        );
      },
    },
    {
      header: <BsThreeDotsVertical size={18} />,
      accessor: (row: ExtendedInventoryData) => (
        <div className="relative menu-container">
          <button
            className="p-2 rounded-full hover:bg-gray-200 cursor-pointer"
            onClick={() => toggleMenu(row.itemId)}
          >
            <BsThreeDotsVertical size={18} />
          </button>

          {openMenuId === row.itemId && (
            <div className="absolute right-0 mt-2 w-48 bg-white shadow-xl rounded-lg z-10 border border-gray-200">
              <Link
                href={`/dashboard/stockreport/stockdetails/${row.itemId}`}
                className="block w-full px-4 py-3 text-left text-gray-700 cursor-pointer hover:bg-purple-950 hover:text-white hover:rounded-lg transition-colors duration-150"
              >
                View
              </Link>
            </div>
          )}
        </div>
      ),
    }
  ];

  const filteredData = inventoryData.filter((item) => {
    const search = searchText.toLowerCase();
    return (
      item.itemName?.toLowerCase().includes(search) ||
      item.manufacturer?.toLowerCase().includes(search) ||
      (item.genericName ?? "--").toLowerCase().includes(search) ||
      (item.variantName ?? "--").toLowerCase().includes(search) ||
      (item.unitName ?? "--").toLowerCase().includes(search) ||
      item.currentStock?.toString().includes(search) ||
      item.expiredStock?.toString().includes(search) ||
      item.packageQuantity?.toString().includes(search)
    );
  });

  const fetchItem = async (
    itemId: string
  ): Promise<{
    name: string;
    manufacturer: string;
    genericName: string;
    variantName: string;
    unitName: string;
  }> => {
    try {
      const item: ItemData = await getItemById(itemId);

      console.log(item, "item");
      return {
        name: item.itemName,
        manufacturer: item.manufacturer,
        genericName: item.genericName || "--",
        variantName: item.variantName || "--",
        unitName: item.unitName || "--",
      };
    } catch (error) {
      console.error("Error fetching Item:", error);
      return {
        name: "Unknown Item",
        manufacturer: "Unknown Manufacturer",
        genericName: "--",
        variantName: "--",
        unitName: "--",
      };
    }
  };

  useEffect(() => {
    const fetchInventory = async () => {
      setLoading(true);
      setError(null);
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

        const inventoryWithData = await Promise.all(
          inventoryResponse.map(async (inventory) => {
            const { name, manufacturer, genericName, variantName, unitName } =
              await fetchItem(inventory.itemId);
            const expiredStock = expiredStockMap.get(inventory.itemId) || 0;
            return {
              ...inventory,
              itemName: name,
              manufacturer,
              genericName,
              variantName,
              unitName,
              expiredStock,
              currentStock: inventory.packageQuantity - expiredStock,
            } as ExtendedInventoryData;
          })
        );
        setInventoryData(inventoryWithData);
      } catch (error) {
        console.error("Error fetching inventory:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, []);

  return (
    <div className="w-full">
      {/* Header */}
      {!showStocksDetails && (
        <main className="space-y-10">
          <div className="flex justify-between">
            <div className="justify-start text-darkPurple text-3xl font-medium leading-10">
              Stocks Report
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

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader type="spinner" size="md" text="Loading ..." fullScreen={false} />
            </div>
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <strong>Error!</strong> {error}
            </div>
          ) : (
            <PaginationTable
              data={getSortedData()}
              columns={columns}
              noDataMessage="No records found"
            />
          )}
        </main>
      )}
    </div>
  );
};

export default Page;