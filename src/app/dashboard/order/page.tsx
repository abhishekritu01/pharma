"use client";

import Button from "@/app/components/common/Button";
import Input from "@/app/components/common/Input";
import Table from "@/app/components/common/Table";
import { PurchaseOrderData } from "@/app/types/PurchaseOrderData";
import { Plus, Search } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";
import PurchaseOrder from "./components/PurchaseOrder";
import { getSupplierById } from "@/app/services/SupplierService";
import { getPurchaseOrder } from "@/app/services/PurchaseOrderService";
import { getPharmacyById } from "@/app/services/PharmacyService";
import { format } from "date-fns";
import { FaArrowDown, FaArrowUp } from "react-icons/fa";

const Page = () => {
  const [showPurchasOrder, setShowPurchasOrder] = useState(false);
  const [purchaseOrderData, setPurchaseOrderData] = useState<
    PurchaseOrderData[]
  >([]);
  const [, setLoading] = useState<boolean>(true);
  const [, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState<string>("");
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);

  const formatDate = (date: string | Date): string => {
    const parsedDate = typeof date === "string" ? new Date(date) : date;
    return format(parsedDate, "dd-MM-yyyy");
  };

  const [sortConfig, setSortConfig] = useState<{
    key: keyof PurchaseOrderData | null;
    direction: "asc" | "desc";
  }>({ key: null, direction: "asc" });

  const handleSort = (key: keyof PurchaseOrderData) => {
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
          onClick={() => handleSort("orderId1")}
        >
          <span>Order ID</span>
          {sortConfig.key === "orderId1" ? (
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
      accessor: "orderId1" as keyof PurchaseOrderData,
    },
    {
      header: "Order Date",
      accessor: (row: PurchaseOrderData) => formatDate(row.orderedDate),
    },

    {
      header: "Supplier Name",
      accessor: "supplierName" as keyof PurchaseOrderData,
    },
    {
      header: "Intended Delivery Date",
      accessor: (row: PurchaseOrderData) =>
        formatDate(row.intendedDeliveryDate),
    },
    {
      header: "Estimated Amount",
      accessor: "grandTotal" as keyof PurchaseOrderData,
    },
    {
      header: <BsThreeDotsVertical size={18} />,
      accessor: (row: PurchaseOrderData) => (
        <div className="relative group">
          <button className="p-2 rounded-full hover:bg-gray-200 cursor-pointer">
            <BsThreeDotsVertical size={18} />
          </button>

          <div className="absolute right-0 mt-2 w-18 bg-white shadow-xl rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
            <Link
              href={`/dashboard/purchaseOrderDetails?id=${row.orderId}`}
              className="block w-full px-4 py-2 text-left text-gray-700 cursor-pointer hover:bg-purple-950 hover:text-white hover:rounded-lg"
            >
              View
            </Link>
            <button
              onClick={() => handlePurchesOrder(row.orderId)}
              className="block w-full px-4 py-2 text-left text-gray-700 cursor-pointer hover:bg-purple-950 hover:text-white hover:rounded-lg"
            >
              Delete
            </button>
          </div>
        </div>
      ),
    },
  ];

  const handlePurchesOrder = (orderId?: string) => {
    if (orderId) {
      setCurrentOrderId(orderId);
    }
    setShowPurchasOrder(true);
  };

  const fetchSupplier = async (supplierId: string): Promise<string> => {
    // console.log("Fetching Supplier for ID:", supplierId);

    try {
      const supplier = await getSupplierById(supplierId.trim());

      if (!supplier || !supplier.supplierName) {
        return "Unknown Supplier1";
      }

      return supplier.supplierName;
    } catch {
      return "Unknown Supplier2";
    }
  };

  useEffect(() => {
    const fetchPurchaseOrder = async () => {
      try {
        const response = await getPurchaseOrder();

        if (!response?.data || response.status !== "success") {
          throw new Error(
            response?.message || "Failed to fetch purchase order"
          );
        }

        const purchaseOrder: PurchaseOrderData[] = response.data;

        const purchaseOrderWithDetails = await Promise.all(
          purchaseOrder.map(async (purchase) => {
            const supplierName = await fetchSupplier(purchase.supplierId);
            const pharmacyData = await getPharmacyById(purchase.pharmacyId);
            const pharmacyName =
              pharmacyData?.pharmacyName || "Unknown Pharmacy";

            return {
              ...purchase,
              supplierName,
              pharmacyName,
            };
          })
        );

        setPurchaseOrderData(purchaseOrderWithDetails.reverse());
      } catch (error) {
        console.error("Error fetching purchase orders:", error);
        setError(
          error instanceof Error ? error.message : "An unknown error occurred"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPurchaseOrder();
  }, []);


  const filteredData = purchaseOrderData
  .filter((item) => {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const orderDate = new Date(item.orderedDate);
    return orderDate >= oneMonthAgo; // Only include if within last 1 month
  })
  .filter((item) => {
    const search = searchText.toLowerCase();

    const orderedDateFormatted = format(new Date(item.orderedDate), "dd-MM-yyyy");
    const deliveryDateFormatted = format(new Date(item.intendedDeliveryDate), "dd-MM-yyyy");

    return (
      item.orderId1?.toLowerCase().includes(search) ||
      orderedDateFormatted.toLowerCase().includes(search) ||
      item.supplierName?.toLowerCase().includes(search) ||
      deliveryDateFormatted.toLowerCase().includes(search) ||
      item.grandTotal?.toString().toLowerCase().includes(search)
    );
  });

  return (
    <>
      {!showPurchasOrder && (
        <main className="space-y-10">
          <div className="flex justify-between">
            <div className="justify-start text-darkPurple text-3xl font-medium leading-10">
              Purchase Order List
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
                {/* <div>
                  <Button
                    label="Filter"
                    value=""
                    className="w-24 text-black h-11"
                    icon={<Filter size={15} />}
                  ></Button>
                </div> */}
                <div>
                  <Button
                    onClick={() => handlePurchesOrder()}
                    label="New Order"
                    value=""
                    className="w-40 bg-darkPurple text-white h-11 "
                    icon={<Plus size={15} />}
                  ></Button>
                </div>
              </div>
            </div>
          </div>

          <Table
            data={getSortedData()}
            columns={columns}
            noDataMessage="No purchase records found"
          />
        </main>
      )}

      {showPurchasOrder && (
        <PurchaseOrder
          setShowPurchasOrder={setShowPurchasOrder}
          orderIdNew={currentOrderId}
        />
      )}
    </>
  );
};

export default Page;
