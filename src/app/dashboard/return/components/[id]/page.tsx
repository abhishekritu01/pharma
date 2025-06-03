"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import Table from "@/app/components/common/Table";
import {
  PurchaseReturnData,
} from "@/app/types/PurchaseReturnData";
import { getPurchaseReturnById } from "@/app/services/PurchaseReturnService";
import { getSupplierById } from "@/app/services/SupplierService";
import { getItemById } from "@/app/services/ItemService";
import Footer from "@/app/components/common/Footer";
const Page = () => {
  const params = useParams();
  const returnId = params.id as string;

  const [purchaseReturnData, setPurchaseReturnData] =
    useState<PurchaseReturnData | null>(null);
  const [supplier, setSupplier] = useState<string | null>(null);

  const [, setLoading] = useState(true);
  const [, setError] = useState<string>();

  const columns = [
    {
      header: "Discrepancy In",
      accessor: "discrepancyIn" as const, 
    },
    {
      header: "Discrepancy",
      accessor: "discrepancy" as const, 
    },
  ];

  useEffect(() => {
    const fetchPurchaseReturn = async () => {
      if (!returnId) return;

      try {
        const purchaseReturnData = await getPurchaseReturnById(returnId);
        setPurchaseReturnData(purchaseReturnData);
        console.log("purchaseReturnData--", purchaseReturnData);

        if (purchaseReturnData?.supplierId) {
          const supplier = await getSupplierById(purchaseReturnData.supplierId);
          setSupplier(supplier?.supplierName || "Unknown Supplier");
        }

        const updatedItems = await Promise.all(
          purchaseReturnData?.purchaseReturnItemDtos?.map(
            async (item: { itemId: string }) => {
              let itemName = "Unknown Item";

              if (item?.itemId) {
                const fetchedItem = await getItemById(item.itemId);
                itemName = fetchedItem?.itemName || itemName;
              }

              return {
                ...item,
                itemName,
              };
            }
          ) || []
        );

        setPurchaseReturnData({
          ...purchaseReturnData,
          purchaseReturnItemDtos: updatedItems,
        });
      } catch (err) {
        console.error("Error fetching purchase return:", err);
        setError("Failed to fetch return details or supplier.");
      } finally {
        setLoading(false);
      }
    };

    fetchPurchaseReturn();
  }, [returnId]);

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
              <span className="font-normal text-sm text-gray">Return ID</span>
              <span className="font-normal text-base">
                {purchaseReturnData?.returnId1}
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
              <span className="font-normal text-sm text-gray">Return Date</span>
              <span className="font-normal text-base">
                {purchaseReturnData?.returnDate
                  ? new Date(purchaseReturnData.returnDate).toLocaleDateString()
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
                src="/OrderId.svg"
                alt="Company Logo"
                width={45}
                height={32}
              />
            </div>
            <div className="grid">
              <span className="font-normal text-sm text-gray">Bill Number</span>
              <span className="font-normal text-base">
                {purchaseReturnData?.purchaseBillNo}
              </span>
            </div>
          </div>
        </div>

        {purchaseReturnData?.purchaseReturnItemDtos?.map((item, index) => (
          <div
            key={index}
            className="border border-gray-300 w-full rounded-lg p-5 flex gap-8"
          >
            <div className="space-y-5 w-1/2">
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                <div className="grid">
                  <div className="font-normal text-sm text-gray">Item Name</div>
                  <div className="font-normal text-base">
                    {(item).itemName || "Unknown Item"}
                  </div>
                </div>

                <div className="grid">
                  <div className="font-normal text-sm text-gray">
                    Return Type
                  </div>
                  <div className="font-normal text-base">{item.returnType}</div>
                </div>

                <div className="grid">
                  <div className="font-normal text-sm text-gray">
                    Batch Number
                  </div>
                  <div className="font-normal text-base">{item.batchNo}</div>
                </div>

                <div className="grid">
                  <div className="font-normal text-sm text-gray">
                    Return Quantity
                  </div>
                  <div className="font-normal text-base">
                    {item.returnQuantity}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1">
              <Table
                data={[
                  {
                    discrepancyIn: item.discrepancyIn,
                    discrepancy: item.discrepancy,
                  },
                ]}
                columns={columns}
                noDataMessage="No purchase items found"
              />
            </div>
          </div>
        ))}

        <div className="border h-full w-lg border-Gray rounded-xl p-6 space-y-6 ml-auto font-normal text-sm">
          {[
            {
              label: "RETURN AMOUNT",
              value: purchaseReturnData?.returnAmount.toFixed(2),
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
};

export default Page;
