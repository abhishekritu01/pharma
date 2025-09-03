"use client";

import Drawer from "@/app/components/common/Drawer";
import Input from "@/app/components/common/Input";
import PaginationTable from "@/app/components/common/PaginationTable";
import { getSupplier } from "@/app/services/SupplierService";
import { SupplierData } from "@/app/types/SupplierData";
import { Plus, Search } from "lucide-react";
import React, { useEffect, useState } from "react";
import AddSupplier from "./component/AddSupplier";
import Button from "@/app/components/common/Button";
import { BsThreeDotsVertical } from "react-icons/bs";
import Loader from "@/app/components/common/Loader";

type Action = "edit" | "delete";

const Page = () => {
  const [searchText, setSearchText] = useState<string>("");
  const [supplierData, setSupplierData] = useState<SupplierData[]>([]);
  const [showSupplier, setShowSupplier] = useState(false);
  const [, setShowDrawer] = useState<boolean>(false);
  const [currentSupplierId, setCurrentSupplierId] = useState<string | null>(
    null
  );
  const [action, setAction] = useState<Action | undefined>(undefined);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true); // Add loading state
  const [error, setError] = useState<string | null>(null); // Add error state

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
      header: "Supplier Name",
      accessor: "supplierName" as keyof SupplierData,
    },
    {
      header: "Contact No.",
      accessor: "supplierMobile" as keyof SupplierData,
    },
    {
      header: "Email ID",
      accessor: "supplierEmail" as keyof SupplierData,
    },
    {
      header: "Action",
      accessor: (row: SupplierData) => (
        <div className="relative menu-container">
          <button
            className="p-2 rounded-full hover:bg-gray-200 cursor-pointer"
            onClick={() => toggleMenu(row.supplierId)}
          >
            <BsThreeDotsVertical size={18} />
          </button>

          {openMenuId === row.supplierId && (
            <div className="absolute right-0 mt-2 w-full bg-white shadow-xl rounded-lg z-10">
              <button
                onClick={() => {
                  if (row.supplierId) {
                    handleSupplierDrawer(row.supplierId, "edit");
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

  const filteredData = supplierData.filter((item) => {
    const search = searchText.toLowerCase();

    return (
      item.supplierName?.toLowerCase().includes(search) ||
      item.supplierMobile?.toString().toLowerCase().includes(search) ||
      item.supplierEmail?.toString().toLowerCase().includes(search)
    );
  });

  const fetchSuppliers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSupplier();
      setSupplierData(data);
    } catch (error) {
      console.error("Failed to fetch suppliers:", error);
      setError("Failed to fetch suppliers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleSupplierDrawer = (supplierId?: string, action?: Action) => {
    if (supplierId) {
      setCurrentSupplierId(supplierId);
    } else {
      setCurrentSupplierId(null);
    }

    setAction(action);
    setShowSupplier(true);
    setShowDrawer(true);
  };

  const handleCloseDrawer = () => {
    setShowDrawer(false);
    setShowSupplier(false);
  };

  return (
    <>
      {showSupplier && (
        <Drawer setShowDrawer={handleCloseDrawer} title={"Supplier Master"}>
          <AddSupplier
            setShowDrawer={handleCloseDrawer}
            supplierId={currentSupplierId}
            action={action}
            onSuccess={fetchSuppliers}
          />
        </Drawer>
      )}

      <main className="space-y-10">
        <div className="flex justify-between">
          <div className="justify-start text-darkPurple text-3xl font-medium leading-10">
            Supplier List
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
                label="Add New Supplier"
                value=""
                className="w-52 bg-darkPurple text-white h-11 "
                icon={<Plus size={15} />}
              ></Button>
            </div>
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

