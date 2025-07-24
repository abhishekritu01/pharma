"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Table from "@/app/components/common/Table";
import { getSalesReturnById } from "@/app/services/SalesReturnService";
import { getPatientById } from "@/app/services/PatientService";
import { getItemById } from "@/app/services/ItemService";
import Footer from "@/app/components/common/Footer";
import { format } from "date-fns";
import Button from "@/app/components/common/Button";
import {
  SalesReturnData,
  SalesReturnItemData,
} from "@/app/types/SalesReturnData";
import { PatientData } from "@/app/types/PatientData";

const Page = () => {
  const params = useParams();
  const router = useRouter();
  const returnId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [salesReturnData, setSalesReturnData] =
    useState<SalesReturnData | null>(null);
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatDate = (date: string | Date | null | undefined): string => {
    if (!date) return "N/A";
    try {
      const parsedDate = typeof date === "string" ? new Date(date) : date;
      return isNaN(parsedDate.getTime())
        ? "N/A"
        : format(parsedDate, "dd-MM-yyyy");
    } catch {
      return "N/A";
    }
  };

  useEffect(() => {
    if (!returnId) {
      setError("Return ID is missing");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await getSalesReturnById(returnId);

        if (!response || response.status !== "success") {
          throw new Error(
            response?.message || "Failed to fetch return details"
          );
        }

        const apiData = response.data;

        const enrichedItems = await Promise.all(
          apiData.billReturnItemDtos.map(async (item: SalesReturnItemData) => {
            try {
              const itemDetails = await getItemById(item.itemId);
              return {
                ...item,
                itemName: itemDetails?.itemName || "Unknown Item",
              };
            } catch {
              return {
                ...item,
                itemName: "Unknown Item",
              };
            }
          })
        );

        setSalesReturnData({
          ...apiData,
          billReturnItemDtos: enrichedItems,
        });

        if (apiData.patientId) {
          try {
            const patient = await getPatientById(apiData.patientId);
            setPatientData(patient);
          } catch (patientError) {
            console.error("Error fetching patient:", patientError);
          }
        }
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to fetch return details"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [returnId]);

  const columns = [
    {
      header: "Item Name",
      accessor: (row: SalesReturnItemData) => row.itemName || "N/A",
    },
    {
      header: "Batch No.",
      accessor: (row: SalesReturnItemData) => row.batchNo || "N/A",
    },
    {
      header: "Expiry Date",
      accessor: (row: SalesReturnItemData) => formatDate(row.expiryDate),
    },
    {
      header: "Billed Qty.",
      accessor: (row: SalesReturnItemData) => row.packageQuantity || 0,
    },
    {
      header: "Returned Qty.",
      accessor: (row: SalesReturnItemData) => row.returnQuantity || 0,
    },
    {
      header: "Refund Amount",
      accessor: (row: SalesReturnItemData) =>
        `${(row.netTotal || 0).toFixed(2)}`,
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-darkPurple"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <strong>Error!</strong> {error}
      </div>
    );
  }

  if (!salesReturnData) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
        Return data not found
      </div>
    );
  }

  return (
    <main className="space-y-6 p-4">
      <div className="flex justify-between items-center">
        <h1 className="justify-start text-darkPurple text-3xl font-medium leading-10">
          Bill Return Summary
        </h1>
        <div>
          <Button
            onClick={() => router.push("/dashboard/salesReturn")}
            label="Back to Returns"
            value=""
            className="w-48 bg-darkPurple text-white h-11"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="w-full h-[96px] p-6 flex flex-col justify-center items-start rounded-lg bg-[#FAFAFA]">
            <div className="text-sm text-[#433E3F] font-inter font-normal leading-[161.8%]">
              Patient Name
            </div>
            <div className="text-base text-[#0A0A0B] font-inter font-normal leading-[161.8%] truncate w-full">
              {patientData?.firstName
                ? `${patientData.firstName} ${patientData.lastName || ""}`
                : salesReturnData.patientName || "--"}
            </div>
          </div>

          <div className="w-full h-[96px] p-6 flex flex-col justify-center items-start rounded-lg bg-[#FAFAFA]">
            <div className="text-sm text-[#433E3F] font-inter font-normal leading-[161.8%]">
              Mobile Number
            </div>
            <div className="text-base text-[#0A0A0B] font-inter font-normal leading-[161.8%] truncate w-full">
              {patientData?.phone || "--"}
            </div>
          </div>

          <div className="w-full h-[96px] p-6 flex flex-col justify-center items-start rounded-lg bg-[#FAFAFA]">
            <div className="text-sm text-[#433E3F] font-inter font-normal leading-[161.8%]">
              Bill No.
            </div>
            <div className="text-base text-[#0A0A0B] font-inter font-normal leading-[161.8%] truncate w-full">
              {salesReturnData.billId1 || "--"}
            </div>
          </div>

          <div className="w-full h-[96px] p-6 flex flex-col justify-center items-start rounded-lg bg-[#FAFAFA]">
            <div className="text-sm text-[#433E3F] font-inter font-normal leading-[161.8%]">
              Return ID
            </div>
            <div className="text-base text-[#0A0A0B] font-inter font-normal leading-[161.8%] truncate w-full">
              {salesReturnData.billReturnId1 ||
                salesReturnData.billReturnId ||
                "--"}
            </div>
          </div>

          <div className="w-full h-[96px] p-6 flex flex-col justify-center items-start rounded-lg bg-[#FAFAFA]">
            <div className="text-sm text-[#433E3F] font-inter font-normal leading-[161.8%]">
              Return Date
            </div>
            <div className="text-base text-[#0A0A0B] font-inter font-normal leading-[161.8%] truncate w-full">
              {formatDate(salesReturnData.billReturnDateTime)}
            </div>
          </div>

          <div className="w-full h-[96px] p-6 flex flex-col justify-center items-start rounded-lg bg-[#FAFAFA]">
            <div className="text-sm text-[#433E3F] font-inter font-normal leading-[161.8%]">
              Total Refund Amount
            </div>
            <div className="text-base text-[#0A0A0B] font-inter font-normal leading-[161.8%] truncate w-full">
              {salesReturnData.grandTotal?.toFixed(2) || "0.00"}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 w-full">
        <h2 className="text-lg font-medium text-gray-800 mb-4">
          Returned Items
        </h2>
        <Table
          data={salesReturnData.billReturnItemDtos || []}
          columns={columns}
          noDataMessage="No items were returned"
        />
      </div>

      <Footer />
    </main>
  );
};

export default Page;
