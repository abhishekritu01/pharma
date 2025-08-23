"use client";

import Button from "@/app/components/common/Button";
import Drawer from "@/app/components/common/Drawer";
import Input from "@/app/components/common/Input";
import Table from "@/app/components/common/Table";
import { ItemData } from "@/app/types/ItemData";
import { Plus, Search } from "lucide-react";
import React, { useEffect, useState } from "react";
import AddItem from "./components/AddItem";
import { getItem } from "@/app/services/ItemService";
import { getVariantById } from "@/app/services/VariantService";
import { BsThreeDotsVertical } from "react-icons/bs";

type Action = "edit" | "delete";

const Page = () => {
  const [searchText, setSearchText] = useState<string>("");
  const [itemData, setItemData] = useState<ItemData[]>([]);
  const [showItem, setShowItem] = useState(false);
  const [, setShowDrawer] = useState<boolean>(false);
  const [currentItemId, setCurrentItemId] = useState<string | null>(null);
  const [action, setAction] = useState<Action | undefined>(undefined);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const toggleMenu = (orderId?: string) => {
    setOpenMenuId((prev) => (prev === orderId ? null : orderId || null));
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

  const columns = [
    {
      header: "Item Name",
      accessor: "itemName" as keyof ItemData,
    },
    {
      header: "Manufacturer",
      accessor: "manufacturer" as keyof ItemData,
    },
    {
      header: "Variant Name",
      accessor: "variantName" as keyof ItemData,
    },
    {
      header: "Unit Name",
      accessor: "unitName" as keyof ItemData,
    },
    {
      header: "Action",
      accessor: (row: ItemData) => (
        <div className="relative menu-container">
          <button
            className="p-2 rounded-full hover:bg-gray-200 cursor-pointer"
            onClick={() => toggleMenu(row.itemId)}
          >
            <BsThreeDotsVertical size={18} />
          </button>

          {openMenuId === row.itemId && (
            <div className="absolute right-0 mt-2 w-full bg-white shadow-xl rounded-lg z-10">
              <button
                onClick={() => {
                  if (row.itemId) {
                    handleSupplierDrawer(row.itemId, "edit");
                  }
                  setOpenMenuId(null);
                }}
                className="block w-full px-4 py-2 text-left text-gray-700 cursor-pointer hover:bg-purple-950 hover:text-white hover:rounded-lg"
              >
                Edit
              </button>
            </div>
          )}
        </div>
      ),
    },
  ];

  const filteredData = itemData.filter((item) => {
    const search = searchText.toLowerCase();

    return (
      item.itemName?.toLowerCase().includes(search) ||
      item.manufacturer?.toLowerCase().includes(search) ||
      item.variantName?.toLowerCase().includes(search) ||
      item.unitName?.toLowerCase().includes(search)
    );
  });

  const fetchItemsWithVariants = async () => {
    try {
      const items = await getItem();

      const itemsWithVariants = await Promise.all(
        items.map(async (item: ItemData) => {
          if (!item.variantId || !item.unitId) return item;

          try {
            const variantData = await getVariantById(item.variantId);

            const matchingUnit = variantData.unitDtos?.find(
              (unit: ItemData) => unit.unitId === item.unitId
            );

            return {
              ...item,
              variantName: variantData.variantName,
              unitName: matchingUnit?.unitName || "N/A",
            };
          } catch (err) {
            console.error("Error fetching variant for item:", item.itemId, err);
            return item;
          }
        })
      );

      setItemData(itemsWithVariants);
    } catch (error) {
      console.error("Failed to fetch items:", error);
    }
  };

  useEffect(() => {
    fetchItemsWithVariants();
  }, []);

  const handleSupplierDrawer = (itemId?: string, action?: Action) => {
    if (itemId) {
      setCurrentItemId(itemId);
    } else {
      setCurrentItemId(null);
    }

    setAction(action);
    setShowItem(true);
    setShowDrawer(true);
  };

  const handleCloseDrawer = () => {
    setShowDrawer(false);
    setShowItem(false);
  };

  return (
    <>
      {showItem && (
        <Drawer setShowDrawer={handleCloseDrawer} title={"Item Master"}>
          <AddItem
            setShowDrawer={handleCloseDrawer}
            itemId={currentItemId}
            action={action}
            onSuccess={fetchItemsWithVariants}
          />
        </Drawer>
      )}

      <main className="space-y-10">
        <div className="flex justify-between">
          <div className="justify-start text-darkPurple text-3xl font-medium leading-10">
            Item List
          </div>

          <div className="flex space-x-4">
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

            <div>
              <Button
                onClick={() => handleSupplierDrawer()}
                label="Add New Item"
                value=""
                className="w-52 bg-darkPurple text-white h-11 "
                icon={<Plus size={15} />}
              ></Button>
            </div>
          </div>
        </div>

        <Table
          data={filteredData}
          columns={columns}
          noDataMessage="No records found"
        />
      </main>
    </>
  );
};

export default Page;
