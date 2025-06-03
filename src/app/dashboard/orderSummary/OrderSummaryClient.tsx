"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import Table from "@/app/components/common/Table";
import {
  PurchaseEntryData,
  PurchaseEntryItem,
} from "@/app/types/PurchaseEntry";
import { getPurchaseById } from "@/app/services/PurchaseEntryService";
import { SupplierData } from "@/app/types/SupplierData";
import { getSupplierById } from "@/app/services/SupplierService";
import Footer from "@/app/components/common/Footer";
import { getItemById } from "@/app/services/ItemService";
import { format } from "date-fns";

const OrderSummaryClient = () => {
  const searchParams = useSearchParams();
  const invId = searchParams.get("id"); // ✅ Get invId from URL
  const [purchaseEntryData, setPurchaseEntryData] =
    useState<PurchaseEntryData | null>(null);
  const [supplierData, setSupplierData] = useState<SupplierData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSupplier = async (supplierId: string): Promise<void> => {
    try {
      const supplier = await getSupplierById(supplierId.trim());

      if (!supplier || !supplier.supplierName) {
        setSupplierData(null);
        return;
      }

      setSupplierData(supplier);
    } catch (error) {
      console.error("Failed to fetch supplier:", error);
      setSupplierData(null);
    }
  };

  useEffect(() => {
    const fetchPurchaseData = async () => {
      if (!invId) return;

      try {
        setLoading(true);
        const response = await getPurchaseById(invId);
        console.log("Fetched Purchase Data:", response);

        const purchaseData = response.data || null;

        if (purchaseData?.supplierId) {
          await fetchSupplier(purchaseData.supplierId);
        }

        // Fetch item names for each stock item
        if (purchaseData?.stockItemDtos?.length) {
          const stockItemDtosWithNames = await Promise.all(
            purchaseData.stockItemDtos.map(async (item: PurchaseEntryItem) => {
              try {
                const itemData = await getItemById(item.itemId);
                return {
                  ...item,
                  itemName: itemData?.itemName || "Unknown Item",
                };
              } catch (error) {
                console.error("Failed to fetch Item:", error);

                return {
                  ...item,
                  itemName: "Failed to fetch",
                };
              }
            })
          );

          purchaseData.stockItemDtos = stockItemDtosWithNames;
        }

        setPurchaseEntryData(purchaseData);
      } catch (err) {
        console.error("Error fetching purchase data:", err);
        setError("Failed to fetch purchase data");
      } finally {
        setLoading(false);
      }
    };

    fetchPurchaseData();
  }, [invId]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!purchaseEntryData) return <p>No data available.</p>;

  const formatDate = (date: string | Date): string => {
    const parsedDate = typeof date === "string" ? new Date(date) : date;
    return format(parsedDate, "dd-MM-yyyy");
  };

  const columns = [
    { header: "Item Name", accessor: "itemName" as keyof PurchaseEntryItem },
    { header: "Batch No", accessor: "batchNo" as keyof PurchaseEntryItem },
    {
      header: "Package Qty",
      accessor: "packageQuantity" as keyof PurchaseEntryItem,
    },
    {
      header: "Expiry Date",
        accessor: (row: PurchaseEntryItem) => formatDate(row.expiryDate),
    },
    {
      header: "Purchase Price",
      accessor: "purchasePrice" as keyof PurchaseEntryItem,
    },
    { header: "MRP", accessor: "mrpSalePrice" as keyof PurchaseEntryItem },
    { header: "Amount", accessor: "amount" as keyof PurchaseEntryItem },
  ];

  const columns1 = [
    { header: "Taxable Amount", accessor: "amount" as keyof PurchaseEntryItem },
    { header: "CGST %", accessor: "cgstPercentage" as keyof PurchaseEntryItem },
    {
      header: "CGST Amount",
      accessor: "cgstAmount" as keyof PurchaseEntryItem,
    },
    { header: "SGST %", accessor: "sgstPercentage" as keyof PurchaseEntryItem },
    {
      header: "SGST Amount",
      accessor: "sgstAmount" as keyof PurchaseEntryItem,
    },
  ];

  const totalCgstAmount = purchaseEntryData?.stockItemDtos?.reduce(
    (sum, item) => sum + (item.cgstAmount ?? 0),
    0
  );
  const totalSgstAmount = purchaseEntryData?.stockItemDtos?.reduce(
    (sum, item) => sum + (item.sgstAmount ?? 0),
    0
  );

  return (
    <>
      <main className="space-y-10">
        <div className="justify-start text-darkPurple text-3xl font-medium leading-10">
          Order Summary
        </div>

        <div className="flex space-x-7 w-full">
          <div className="border border-gray w-full h-64 rounded-lg p-6 flex flex-col items-center justify-center text-center">
            <div className="text-darkPurple text-3xl font-bold">
              {/* {String(purchaseEntryData.storeId ?? "N/A")} */}
            </div>
            <Image
              src="/PharmacyLogo.jpg"
              alt="Pharmacy Logo"
              width={200}
              height={200}
            />
          </div>

          <div className="border border-gray w-full h-64 rounded-lg p-6 flex">
            <div>
              {[
                { label: "Bill No", value: purchaseEntryData.purchaseBillNo },
                {
                  label: "Bill Date",
                  value: formatDate(purchaseEntryData.purchaseDate ?? "N/A"),
                },
                {
                  label: "Payment Due Date",
                  value: formatDate(purchaseEntryData.paymentDueDate ?? "N/A"),
                },
                { label: "GRN No", value: purchaseEntryData.grnNo },
                { label: "Order Status", value: purchaseEntryData.goodStatus },
                {
                  label: "Payment Status",
                  value: purchaseEntryData.paymentStatus,
                },
                { label: "DL No", value: "No Data" },
                // { label: "GSTIN No", value: "" },
              ].map(({ label, value }, index) => (
                <div key={index} className="flex text-sm space-y-3 space-x-2">
                  <div className="font-semibold">{label}</div>
                  <div>: {String(value ?? "N/A")}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-gray w-full h-64 rounded-lg p-6">
            <div>
              {[
                {
                  label: "Supplier",
                  value: supplierData?.supplierName ?? "N/A",
                },
                {
                  label: "Contact",
                  value: supplierData?.supplierMobile ?? "N/A",
                },
                {
                  label: "GSTIN No",
                  value: supplierData?.supplierGstinNo ?? "N/A",
                },
                { label: "Email", value: supplierData?.supplierEmail ?? "N/A" },
                {
                  label: "Address",
                  value: supplierData?.supplierAddress ?? "N/A",
                },
              ].map(({ label, value }, index) => (
                <div key={index} className="flex text-sm space-y-3 space-x-2">
                  <div className="font-semibold">{label}</div>
                  <div>: {String(value)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <Table
          data={purchaseEntryData?.stockItemDtos || []}
          columns={columns}
          noDataMessage="No items found"
        />

        <div className="flex">
          <div className="w-full max-w-2xl">
            <Table
              data={purchaseEntryData?.stockItemDtos || []}
              columns={columns1}
              noDataMessage="No tax details found"
            />
          </div>

          <div className="border h-60 w-lg border-gray rounded-xl p-6 space-y-5 ml-auto font-normal text-sm">
            {[
              { label: "SUB TOTAL", value: purchaseEntryData.totalAmount },
              { label: "TOTAL CGST", value: totalCgstAmount },
              { label: "TOTAL SGST", value: totalSgstAmount },
              { label: "DISCOUNT", value: purchaseEntryData.totalDiscount },
              {
                label: "GRAND TOTAL",
                value: purchaseEntryData.grandTotal,
                isTotal: true,
              },
            ].map(({ label, value, isTotal }, index) => (
              <div
                key={index}
                className={`flex justify-between ${
                  isTotal
                    ? "font-semibold text-base bg-primaryPurple h-10 p-1 items-center rounded-lg"
                    : ""
                }`}
              >
                <div>{label}</div>
                <div>{String(value ?? "N/A")}</div>
              </div>
            ))}
          </div>
        </div>

        <Footer />
      </main>
    </>
  );
};

export default OrderSummaryClient;
