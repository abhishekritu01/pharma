"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import {
  PurchaseOrderData,
  PurchaseOrderItem,
} from "@/app/types/PurchaseOrderData";
import { getPurchaseOrderById } from "@/app/services/PurchaseOrderService";
import { getSupplierById } from "@/app/services/SupplierService";
import Table from "@/app/components/common/Table";
import { getItemById } from "@/app/services/ItemService";
import Footer from "@/app/components/common/Footer";
import { getVariantById } from "@/app/services/VariantService";
import { UnitData } from "@/app/types/VariantData";

const PurchaseOrderDetailsClient = () => {
    const searchParams = useSearchParams();
    const orderId = searchParams.get("id");
  
    const [purchaseOrderData, setPurchaseOrderData] =
      useState<PurchaseOrderData | null>(null);
    const [supplier, setSupplier] = useState<string | null>(null);
    const [, setLoading] = useState(true);
    const [, setError] = useState<string>();
  
    const columns = [
      { header: "Item Name", accessor: "itemName" as keyof PurchaseOrderItem },
      {
        header: "Manufacturer",
        accessor: "manufacturer" as keyof PurchaseOrderItem,
      },
      {
        header: "Package Qty",
        accessor: "quantity" as keyof PurchaseOrderItem,
      },
      {
        header: "Variant Type",
        accessor: "variantName" as keyof PurchaseOrderItem,
      },
      {
        header: "Unit Type",
        accessor: "unitName" as keyof PurchaseOrderItem,
      },
  
      { header: "GST %", accessor: "gstPercentage" as keyof PurchaseOrderItem },
      { header: "GST ", accessor: "gstAmount" as keyof PurchaseOrderItem },
      {
        header: "Estimated Amount",
        accessor: "amount" as keyof PurchaseOrderItem,
      },
    ];
  
    useEffect(() => {
      const fetchPurchaseOrder = async () => {
        if (!orderId) return;
    
        try {
          const purchaseOrderData = await getPurchaseOrderById(orderId);
          setPurchaseOrderData(purchaseOrderData);
    
          if (purchaseOrderData?.supplierId) {
            const supplier = await getSupplierById(purchaseOrderData.supplierId);
            setSupplier(supplier?.supplierName || "Unknown Supplier");
          }
    
          const updatedItems = await Promise.all(
            purchaseOrderData?.purchaseOrderItemDtos?.map(async (item: { itemId: string; variantTypeId: string; unitTypeId: string; }) => {
              let itemName = "Unknown Item";
              let variantName = "Unknown Variant";
              let unitName = "Unknown Unit";
    
              // Fetch item name
              if (item?.itemId) {
                const fetchedItem = await getItemById(item.itemId);
                itemName = fetchedItem?.itemName || itemName;
              }
    
              if (item?.variantTypeId) {
                const fetchedVariant = await getVariantById(String(item.variantTypeId));
                variantName = fetchedVariant?.variantName || variantName;
    
                // Find matching unitName by comparing unitTypeId
                if (fetchedVariant?.unitDtos && Array.isArray(fetchedVariant.unitDtos)) {
                  const matchedUnit = fetchedVariant.unitDtos.find(
                    (unit: UnitData) => unit.unitId === String(item.unitTypeId)
                  );
                  unitName = matchedUnit?.unitName || unitName;
                }
              }
    
              return {
                ...item,
                itemName,
                variantName,
                unitName,
              };
            }) || []
          );
    
          setPurchaseOrderData({
            ...purchaseOrderData,
            purchaseOrderItemDtos: updatedItems,
          });
        } catch (err) {
          console.error("Error fetching purchase order:", err);
          setError("Failed to fetch order details or supplier.");
        } finally {
          setLoading(false);
        }
      };
    
      fetchPurchaseOrder();
    }, [orderId]);
   
   return (
      <>
        <main className="space-y-10">
          <div className="justify-start text-darkPurple text-3xl font-medium leading-10">
            Purchase Order Details
          </div>
  
          <div className="flex space-x-4">
            <div className="w-full h-24 border border-Gray rounded-lg flex items-center px-6 space-x-4">
              <div>
                <Image
                  src="/OrderId.svg"
                  alt="Company Logo"
                  width={45}
                  height={32}
                />
              </div>
              <div className="grid">
                <span className="font-normal text-sm text-gray">Order ID</span>
                <span className="font-normal text-base">
                  {purchaseOrderData?.orderId1}
                </span>
              </div>
            </div>
  
            <div className="w-full h-24 border border-Gray rounded-lg flex items-center px-6 space-x-4">
              <div>
                <Image
                  src="/Date.svg"
                  alt="Company Logo"
                  width={45}
                  height={32}
                />
              </div>
              <div className="grid">
                <span className="font-normal text-sm text-gray">Order Date</span>
                <span className="font-normal text-base">
                  {purchaseOrderData?.orderedDate
                    ? new Date(purchaseOrderData.orderedDate).toLocaleDateString()
                    : ""}
                </span>
              </div>
            </div>
  
            <div className="w-full h-24 border border-Gray rounded-lg flex items-center px-6 space-x-4">
              <div>
                <Image
                  src="/Supplier.svg"
                  alt="Company Logo"
                  width={45}
                  height={32}
                />
              </div>
              <div className="grid">
                <span className="font-normal text-sm text-gray">
                  Supplier Name
                </span>
                <span className="font-normal text-base">{supplier}</span>
              </div>
            </div>
  
            <div className="w-full h-24 border border-Gray rounded-lg flex items-center px-6 space-x-4">
              <div>
                <Image
                  src="/Date.svg"
                  alt="Company Logo"
                  width={45}
                  height={32}
                />
              </div>
              <div className="grid">
                <span className="font-normal text-sm text-gray">
                  Intended Delivery Date
                </span>
                <span className="font-normal text-base">
                  {purchaseOrderData?.intendedDeliveryDate
                    ? new Date(
                        purchaseOrderData.intendedDeliveryDate
                      ).toLocaleDateString()
                    : ""}
                </span>
              </div>
            </div>
          </div>
  
          <Table
            data={purchaseOrderData?.purchaseOrderItemDtos ?? []}
            columns={columns}
            noDataMessage="No items found"
          />
  
          <div className="border h-44 w-lg border-Gray rounded-xl p-6 space-y-6 ml-auto font-normal text-sm">
            {[
              {
                label: "SUB TOTAL",
                value: purchaseOrderData?.totalAmount.toFixed(2),
              },
              {
                label: "GST TOTAL",
                value: purchaseOrderData?.totalGst.toFixed(2),
              },
              {
                label: "GRAND TOTAL",
                value: purchaseOrderData?.grandTotal.toFixed(2),
                isTotal: true,
              },
            ].map(({ label, value, isTotal }, index) => (
              <div
                key={index}
                className={`flex justify-between ${
                  isTotal
                    ? "font-semibold text-base bg-gray h-8 p-1 items-center rounded-lg"
                    : ""
                }`}
              >
                <div>{label}</div>
                <div>₹{value}</div>
              </div>
            ))}
          </div>
  
          <Footer />
        </main>
      </>
    );
}

export default PurchaseOrderDetailsClient