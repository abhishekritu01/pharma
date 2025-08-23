"use client";

import Input from "@/app/components/common/Input";
import React, { useEffect, useState } from "react";
import { Plus, Search } from "lucide-react";
import Button from "@/app/components/common/Button";
import PurchaseReturn from "./components/PurchaseReturn";
import PaginationTable from "@/app/components/common/PaginationTable";
import Link from "next/link";
import { PurchaseReturnData } from "@/app/types/PurchaseReturnData";
import { BsThreeDotsVertical } from "react-icons/bs";
import { getSupplierById } from "@/app/services/SupplierService";
import { getReturnAll } from "@/app/services/PurchaseReturnService";
import { format } from "date-fns";
import { FaArrowDown, FaArrowUp } from "react-icons/fa";
import Loader from "@/app/components/common/Loader";

const Page = () => {
  const [showPurchaseReturn, setShowPurchaseReturn] = useState(false);
  const [purchaseReturnData, setPurchaseReturnData] = useState<
    PurchaseReturnData[]
  >([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState<string>("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const toggleMenu = (returnId1?: string) => {
    setOpenMenuId((prev) => (prev === returnId1 ? null : returnId1 || null));
  };

  const handlePurchesReturn = () => {
    setShowPurchaseReturn(true);
  };

  const fetchSupplier = async (supplierId: string): Promise<string> => {
    try {
      const supplier = await getSupplierById(supplierId.trim());

      if (!supplier || !supplier.supplierName) {
        console.warn(`Supplier not found for ID: ${supplierId} in frontend`);
        return "Unknown Supplier1";
      }

      return supplier.supplierName;
    } catch (error) {
      console.error(`Error fetching supplier for ID ${supplierId}:`, error);
      return "Unknown Supplier2";
    }
  };

  useEffect(() => {
    const fetchPurchaseReturn = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getReturnAll();

        if (!response?.data || response.status !== "success") {
          throw new Error("Failed to fetch purchases");
        }

        const purchases: PurchaseReturnData[] = response.data;

        const purchasesWithSuppliers = await Promise.all(
          purchases.map(async (purchase) => {
            const supplierName = await fetchSupplier(purchase.supplierId);
            return { ...purchase, supplierName };
          })
        );

        setPurchaseReturnData(purchasesWithSuppliers.reverse());
      } catch (error) {
        console.error("Error fetching purchases:", error);
        setError(
          error instanceof Error ? error.message : "An unknown error occurred"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPurchaseReturn();
  }, []);

  const formatDate = (date: string | Date): string => {
    const parsedDate = typeof date === "string" ? new Date(date) : date;
    return format(parsedDate, "dd-MM-yyyy");
  };

  const [sortConfig, setSortConfig] = useState<{
    key: keyof PurchaseReturnData | null;
    direction: "asc" | "desc";
  }>({ key: null, direction: "asc" });

  const handleSort = (key: keyof PurchaseReturnData) => {
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
          onClick={() => handleSort("returnId1")}
        >
          <span>Return ID</span>
          {sortConfig.key === "returnId1" ? (
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
      accessor: "returnId1" as keyof PurchaseReturnData,
    },
    {
      header: "Return Date",
      accessor: (row: PurchaseReturnData) => formatDate(row.returnDate),
    },

    {
      header: "Supplier Name",
      accessor: "supplierName" as keyof PurchaseReturnData,
    },

    {
      header: "Return Quantity",
      accessor: (row: PurchaseReturnData) =>
        row.purchaseReturnItemDtos?.reduce(
          (acc, item) => acc + (item.returnQuantity || 0),
          0
        ) ?? 0,
    },

    {
      header: "Return Amount",
      accessor: "returnAmount" as keyof PurchaseReturnData,
    },
    {
      header: <BsThreeDotsVertical size={18} />,
      accessor: (row: PurchaseReturnData, index: number) => (
        <div className="relative group">
          <button className="p-2 rounded-full hover:bg-gray-200 cursor-pointer"  onClick={() => toggleMenu(row.returnId1)} >
            <BsThreeDotsVertical size={18} />
          </button>

          {openMenuId === row.returnId1 && (
            <div className="absolute right-0 mt-2 w-18 bg-white shadow-xl rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
              <Link
                href={`/dashboard/return/components/${row.returnId}`}
                className="block w-full px-4 py-2 text-left text-gray-700 cursor-pointer hover:bg-purple-950 hover:text-white hover:rounded-lg"
              >
                View
              </Link>
              <button
                onClick={() => console.log("Deleting Item:", index)}
                className="block w-full px-4 py-2 text-left text-gray-700 cursor-pointer hover:bg-purple-950 hover:text-white hover:rounded-lg"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      ),
    },
  ];

  const filteredData = purchaseReturnData
    .filter((item) => {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

      const returnDate = new Date(item.returnDate);
      return returnDate >= oneMonthAgo;
    })
    .filter((item) => {
      const search = searchText.toLowerCase();

      const returnDateFormatted = format(
        new Date(item.returnDate),
        "dd-MM-yyyy"
      );

      const returnQuantity = item.purchaseReturnItemDtos?.reduce(
        (acc, i) => acc + (i.returnQuantity || 0),
        0
      );

      return (
        returnDateFormatted.toLowerCase().includes(search) ||
        item.returnId1?.toLowerCase().includes(search) ||
        item.supplierName?.toLowerCase().includes(search) ||
        returnQuantity?.toString().toLowerCase().includes(search) ||
        item.returnAmount?.toString().toLowerCase().includes(search)
      );
    });

  return (
    <>
      {!showPurchaseReturn ? (
        <main className="space-y-10">
          <div className="flex justify-between">
            <div className="justify-start text-darkPurple text-3xl font-medium leading-10">
              Purchase Return List
            </div>

            <div>
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
                    onClick={() => handlePurchesReturn()}
                    label="New Return"
                    value=""
                    className="w-40 bg-darkPurple text-white h-11 "
                    icon={<Plus size={15} />}
                  />
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              {/* <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div> */}
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
              noDataMessage="No purchase records found"
            />
          )}
        </main>
      ) : (
        <PurchaseReturn setShowPurchaseReturn={setShowPurchaseReturn} />
      )}
    </>
  );
};

export default Page;
