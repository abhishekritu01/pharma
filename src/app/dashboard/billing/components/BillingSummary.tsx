"use client";

import { getBillingById } from "@/app/services/BillingService";
import { BillingData } from "@/app/types/BillingData";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Button from "@/app/components/common/Button";
import { useRouter } from "next/navigation";
import { getItemById } from "@/app/services/ItemService";
import { ItemData } from "@/app/types/ItemData";

interface BillingSummaryProps {
  billId: string;
}

const BillingSummary: React.FC<BillingSummaryProps> = ({ billId }) => {
  const router = useRouter();
  const [billingData, setBillingData] = useState<BillingData | null>(null);

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const data = await getBillingById(billId);
  //       setBillingData(data);
  //     } catch (error) {
  //       console.error("Failed to fetch billing data:", error);
  //     }
  //   };

  //   fetchData();
  // }, [billId]);

  useEffect(() => {
  const fetchData = async () => {
    try {
      const data = await getBillingById(billId);

      const enrichedItems = await Promise.all(
        data.billItemDtos.map(async (item: ItemData) => {
          try {
            const itemDetails = await getItemById(item.itemId);
            return {
              ...item,
              itemName: itemDetails.itemName || "N/A", // add itemName to each bill item
            };
          } catch (err) {
            console.error("Failed to fetch item name:", err);
            return {
              ...item,
              itemName: "Unknown Item",
            };
          }
        })
      );

      setBillingData({
        ...data,
        billItemDtos: enrichedItems, // replace with enriched data
      });
    } catch (error) {
      console.error("Failed to fetch billing data:", error);
    }
  };

  if (billId) {
    fetchData();
  }
}, [billId]);


  return (
    <>
      <main className="space-y-10">
        <div className="justify-start text-darkPurple text-3xl font-medium leading-10">
          Bill Summary
        </div>

        <div className="border border-Gray">
          <div className="flex">
            <div className="flex-1 border-r border-gray-400 flex-col">
              <div className="flex justify-center items-center py-2">
                <Image
                  src="/PharmacyIcon.jpg"
                  alt="Pharmacy Logo"
                  width={200}
                  height={200}
                />
              </div>
              <div className=" text-center py-2 text-3xl font-bold">
                Cure Plus Pharma
              </div>
            </div>
            <div className="flex-1 border-r border-gray-400 p-5">
              {billingData &&
                [
                  {
                    label: "Invoice No.",
                    value: billingData.billId1 ?? billingData.billId,
                  },
                  {
                    label: "Date / Time",
                    value: new Date(billingData.billDateTime).toLocaleString(),
                  },
                  { label: "Contact No.", value: "N/A" },
                  { label: "Name", value: billingData.patientName ?? "N/A" },
                  { label: "Doctor", value: billingData.doctorId },
                  { label: "Payment Status", value: billingData.paymentStatus },
                ].map(({ label, value }, index) => (
                  <div
                    key={index}
                    className="flex text-base space-y-3 space-x-1"
                  >
                    <div className="font-medium">{label}</div>
                    <div className="font-normal">
                      : {String(value ?? "N/A")}
                    </div>
                  </div>
                ))}
            </div>

            <div className="flex-1 p-5">
              {[
                { label: "Branch", value: "" },
                {
                  label: "Address",
                  value: "",
                },
                {
                  label: "Tel No.",
                  value: "",
                },
                { label: "DL No.", value: "" },
                { label: "GSTIN", value: "" },
              ].map(({ label, value }, index) => (
                <div
                  key={index}
                  className="flex  text-base space-y-5 space-x-2"
                >
                  <div className="font-medium">{label}</div>
                  <div>: {String(value ?? "N/A")}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-400">
            {billingData && billingData.billItemDtos && (
              <table className="text-sm font-medium w-full table-fixed border-collapse">
                <thead className="h-12 whitespace-nowrap border-b border-gray-400">
                  <tr>
                    {[
                      "SL No.",
                      "Item Name",
                      "Batch No.",
                      "Expiry Date",
                      "Quantity",
                      "Price",
                      "GST %",
                      "GST",
                      "Net",
                      "Gross",
                    ].map((header, i) => (
                      <td key={i} className="text-left px-4 py-2">
                        {header}
                      </td>
                    ))}
                  </tr>
                </thead>
                <tbody className="whitespace-nowrap">
                  {billingData.billItemDtos.map((item, index) => (
                    <tr key={item.billItemId}>
                      <td className="px-4 py-2">{index + 1}</td>
                      <td className="px-4 py-2">{item.itemName}</td>
                      <td className="px-4 py-2">{item.batchNo}</td>
                      <td className="px-4 py-2">
                        {item.expiryDate
                          ? new Date(item.expiryDate).toLocaleDateString()
                          : "N/A"}
                      </td>

                      <td className="px-4 py-2">{item.packageQuantity}</td>
                      <td className="px-4 py-2">
                        {item.mrpPerUnit.toFixed(2)}
                      </td>
                      <td className="px-4 py-2">{item.gstPercentage}%</td>
                      <td className="px-4 py-2">{item.gstAmount.toFixed(2)}</td>
                      <td className="px-4 py-2">{item.netTotal.toFixed(2)}</td>
                      <td className="px-4 py-2">
                        {item.grossTotal.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="flex justify-between border-t border-gray-400 h-9 px-4 items-center text-sm">
            <div className="text-[#5A5555]">
              {billingData?.paymentType} -{" "}
              {billingData?.receivedAmount ?? "N/A"}
            </div>
            <div className="flex space-x-3">
              <div className="text-[#5A5555] space-x-2">
                <span>Disc {billingData?.totalDiscount ?? "0.00"}</span>
                <span>
                  CGST{" "}
                  {(billingData?.totalGst
                    ? billingData.totalGst / 2
                    : 0
                  ).toFixed(2)}
                </span>
                <span>
                  SGST{" "}
                  {(billingData?.totalGst
                    ? billingData.totalGst / 2
                    : 0
                  ).toFixed(2)}
                </span>
                <span>Due {billingData?.balanceAmount ?? "0.00"}</span>
              </div>
              <div className="space-x-2 font-medium">
                <span>Total</span>
                <span>{billingData?.grandTotal ?? "0.00"}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-between border-t border-gray-400 h-9 px-4 items-center text-sm font-medium">
            <div>E & OE. Goods once sold cannot be taken back or exchanged</div>
            {/* <div>{billingData ? rupeesInWords(billingData.grandTotal) : ""}</div> */}
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            label="Back"
            value=""
            className="w-20 text-black h-11"
            onClick={() => router.back()}
          ></Button>
        </div>
      </main>
    </>
  );
};

export default BillingSummary;