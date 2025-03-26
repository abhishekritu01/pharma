"use client";

import Button from "@/app/components/common/Button";
import Input from "@/app/components/common/Input";
import { Plus, Filter, Search } from "lucide-react";
import React, { useEffect, useState } from "react";
import PurchaseEntry from "./components/PurchaseEntry";
import { PurchaseEntryData } from "@/app/types/PurchaseEntry";
import Table from "@/app/components/common/Table";
import { FaEye } from "react-icons/fa";
import { getPurchase } from "@/app/services/PurchaseEntryService";
import { getSupplierById } from "@/app/services/SupplierService";
import { BsThreeDotsVertical } from "react-icons/bs";
import Link from "next/link";

const page = () => {
  const [showPurchasEntry, setShowPurchasEntry] = useState(false);
  const [purchaseEntryData, setPurchaseEntryData] = useState<
    PurchaseEntryData[]
  >([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSupplier = async (supplierId: string): Promise<string> => {
    console.log("Fetching Supplier for ID:", supplierId);

    try {
      const supplier = await getSupplierById(supplierId.trim());
      console.log("Supplier API Response in Frontend:", supplier); // Debug API response

      if (!supplier || !supplier.supplierName) {
        console.warn(`Supplier not found for ID: ${supplierId} in frontend`);
        return "Unknown Supplier1";
      }

      return supplier.supplierName; // ✅ Now supplierName should be correctly extracted
    } catch (error) {
      console.error(`Error fetching supplier for ID ${supplierId}:`, error);
      return "Unknown Supplier2";
    }
  };

  useEffect(() => {
    const fetchPurchasesWithSuppliers = async () => {
      try {
        const response = await getPurchase();
        console.log("Fetched Purchases:", response);

        if (!response?.data || response.status !== "success") {
          throw new Error(response?.message || "Failed to fetch purchases");
        }

        const purchases: PurchaseEntryData[] = response.data;

        // Fetch supplier names for each purchase
        const purchasesWithSuppliers = await Promise.all(
          purchases.map(async (purchase) => {
            const supplierName = await fetchSupplier(purchase.supplierId);
            console.log(
              `Supplier Name for ${purchase.supplierId}:`,
              supplierName
            );

            return { ...purchase, supplierName }; // Ensure supplierName is added to each purchase
          })
        );

        console.log("Updated Purchases:", purchasesWithSuppliers);
        setPurchaseEntryData(purchasesWithSuppliers); // ✅ Correctly update state
      } catch (error) {
        console.error("Error fetching purchases:", error);
        setError(
          error instanceof Error ? error.message : "An unknown error occurred"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPurchasesWithSuppliers();
  }, []);

  const handlePurchesEntry = () => {
    setShowPurchasEntry(true);
  };

  const columns = [
    {
      header: "Supplier Name",
      accessor: "supplierName" as keyof PurchaseEntryData,
    },
    {
      header: "Purchase Date",
      accessor: "purchaseDate" as keyof PurchaseEntryData,
    },
    {
      header: "Bill No",
      accessor: "purchaseBillNo" as keyof PurchaseEntryData,
    },
    {
      header: "Bill Amount",
      accessor: "grandTotal" as keyof PurchaseEntryData,
    },
    {
      header: "Payment Status",
      accessor: "paymentStatus" as keyof PurchaseEntryData,
    },
    {
      header: "Goods Status",
      accessor: "goodStatus" as keyof PurchaseEntryData,
    },
    {
      header: <BsThreeDotsVertical size={18} />, // ✅ Icon in Header
      accessor: (
        row: PurchaseEntryData,
        index: number // ✅ Show icon with dropdown on hover
      ) => (
        <div className="relative group">
          {/* Icon Button */}
          <button className="p-2 rounded-full hover:bg-gray-200 cursor-pointer">
            <BsThreeDotsVertical size={18} />
          </button>

          {/* Dropdown Menu (Hidden by Default) */}
          <div className="absolute right-0 mt-2 w-18 bg-white shadow-xl rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
          <Link
            href={`/dashboard/orderSummary?id=${row.invId}`} // ✅ Navigate with Link
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
        </div>
      ),
    },
  ];

  return (
    <>
      {!showPurchasEntry && (
        <main className="space-y-10">
          <div className="flex justify-between">
            <div className="justify-start text-darkPurple text-3xl font-medium leading-10">
              Purchase List
            </div>

            <div>
              <div className="flex space-x-4">
                <div>
                  <Input
                    type="text"
                    value=""
                    onChange={(e) => console.log(e.target.value)}
                    placeholder="Search Table..."
                    className="w-80 border-gray-300"
                    icon={<Search size={18} />}
                  />
                </div>
                <div>
                  <Button
                    onClick={() => handlePurchesEntry()}
                    label="Filter"
                    value=""
                    className="w-24 text-black"
                    icon={<Filter size={15} />}
                  ></Button>
                </div>
                <div>
                  <Button
                    onClick={() => handlePurchesEntry()}
                    label="New Purchase Entry"
                    value=""
                    className="w-52 bg-darkPurple text-white "
                    icon={<Plus size={15} />}
                  ></Button>
                </div>
              </div>
            </div>
          </div>

          <Table
            data={purchaseEntryData}
            columns={columns}
            noDataMessage="No purchase records found"
          />
        </main>
      )}

      {showPurchasEntry && (
        <PurchaseEntry setShowPurchaseEntry={setShowPurchasEntry} />
      )}
    </>
  );
};

export default page;
