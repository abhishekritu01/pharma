"use client";

import Button from "@/app/components/common/Button";
import Drawer from "@/app/components/common/Drawer";
import Input from "@/app/components/common/Input";
import PaginationTable from "@/app/components/common/PaginationTable";
import Loader from "@/app/components/common/Loader";
import { ItemData } from "@/app/types/ItemData";
import { Plus, Search, Upload } from "lucide-react";
import React, { useEffect, useState, useRef } from "react";
import AddItem from "./components/AddItem";
import { getItem, uploadItemsCsv } from "@/app/services/ItemService";
import { getVariantById } from "@/app/services/VariantService";
import { BsThreeDotsVertical } from "react-icons/bs";
import { FaCloudUploadAlt } from "react-icons/fa";
import { toast } from "react-toastify";

type Action = "edit" | "delete";

const Page = () => {
  const [searchText, setSearchText] = useState<string>("");
  const [itemData, setItemData] = useState<ItemData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [uploadLoading, setUploadLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showItem, setShowItem] = useState(false);
  const [, setShowDrawer] = useState<boolean>(false);
  const [currentItemId, setCurrentItemId] = useState<string | null>(null);
  const [action, setAction] = useState<Action | undefined>(undefined);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadCSVTemplate = () => {
    const headers = [
      "item_name",
      "generic_name",
      "gst_percentage",
      "hsn_no",
      "manufacturer",
      "mrp_sale_price",
      "mrp_sale_price_per_unit",
      "purchase_price",
      "purchase_price_per_unit",
      "purchase_unit",
      "unit_name",
      "variant_name"
    ];

    const csvContent = "data:text/csv;charset=utf-8," + headers.join(",");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "pharma_items_template.csv");
    document.body.appendChild(link);

    link.click();
    document.body.removeChild(link);
  };

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
    setLoading(true);
    setError(null);
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
      setError("Failed to load item data");
    } finally {
      setLoading(false);
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
    fetchItemsWithVariants();
  };

  const handleUploadClick = () => {
    setShowUploadModal(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;


    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      toast.error('Please upload a valid CSV file');
      return;
    }

    setUploadLoading(true);
    try {
      const response = await uploadItemsCsv(file);

      toast.success(response.message || 'CSV file uploaded successfully!', { autoClose: 3000 });

      setShowUploadModal(false);


      setTimeout(() => {
        fetchItemsWithVariants();
      }, 2000);

    } catch (error: unknown) {
      console.error('Upload error:', error);
      let errorMessage = 'An error occurred while uploading the file.';

      if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    } finally {
      setUploadLoading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
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

      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md text-center">
            {uploadLoading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader type="spinner" size="md" text="Uploading CSV file..." fullScreen={false} />
                <p className="mt-4 text-sm text-gray-500">Please wait while we process your file.</p>
              </div>
            ) : (
              <>
                <div className="text-blue-500 mb-4">
                  <FaCloudUploadAlt size={48} className="mx-auto bg-darkPurple text-white p-2 rounded-full" />
                </div>
                <h1 className="text-xl font-semibold text-gray-700 mb-2">
                  Upload Your Items CSV File
                </h1>
                <p className="text-gray-500 text-sm mb-6">
                  Select a CSV file to upload items in bulk. Ensure the CSV follows the required format.
                </p>
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer inline-block bg-darkPurple text-white py-2 px-6 rounded-md
                    hover:opacity-90
                    focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm font-medium"
                >
                  <Upload className="inline-block text-white mr-2" size={15} />
                  Choose CSV File
                  <input
                    id="file-upload"
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={handleFileUpload}
                    ref={fileInputRef}
                    disabled={uploadLoading}
                  />
                </label>
                <button
                  className="mt-4 ml-4 bg-gray-200 text-gray-600 py-2 px-6 rounded-md text-sm font-medium"
                  onClick={() => setShowUploadModal(false)}
                  disabled={uploadLoading}
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
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

            <div className="flex space-x-4">
              <div className="flex flex-col">
                <Button
                  onClick={handleUploadClick}
                  label="Upload CSV File"
                  value=""
                  className="w-52 bg-darkPurple text-white h-11"
                  icon={<Upload size={15} />}
                />
                <button
                  onClick={downloadCSVTemplate}
                  className="text-xs text-gray-500 mt-1 hover:underline text-gray-700 text-left px-6"
                >
                  Show CSV Format
                </button>
              </div>

              <Button
                onClick={() => handleSupplierDrawer()}
                label="Add New Item"
                value=""
                className="w-52 bg-darkPurple text-white h-11"
                icon={<Plus size={15} />}
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader type="spinner" size="md" text="Item List is loading ..." fullScreen={false} />
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <strong>Error!</strong> {error}
          </div>
        ) : (
          <PaginationTable
            data={filteredData}
            columns={columns}
            noDataMessage="No records found"
          />
        )}
      </main>
    </>
  );
};

export default Page;