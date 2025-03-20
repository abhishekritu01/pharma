"use client";
import React from "react";
import Image from "next/image";
import Table from "@/app/components/common/Table";
import { PurchaseEntryData } from "@/app/types/PurchaseEntry";

const page = () => {
  const columns = [
    {
      header: "Item Name",
      accessor: "itemName" as keyof PurchaseEntryData,
    },
    {
      header: "Batch No",
      accessor: "batchNo" as keyof PurchaseEntryData,
    },
    {
      header: "Package Qty",
      accessor: "billpackageQuantityNo" as keyof PurchaseEntryData,
    },
    {
      header: "Expiry Date",
      accessor: "expiryDate" as keyof PurchaseEntryData,
    },
    {
      header: "Purchase Price",
      accessor: "purchasePrice" as keyof PurchaseEntryData,
    },
    {
      header: "MRP",
      accessor: "mrpSalePrice" as keyof PurchaseEntryData,
    },
    {
      header: "Amount",
      accessor: "amount" as keyof PurchaseEntryData,
    },
  ];

  const columns1 = [
    {
      header: "Tax Slab",
      accessor: "taxSlab" as keyof PurchaseEntryData,
    },
    {
      header: "CGST % ",
      accessor: "cgstPercentage" as keyof PurchaseEntryData,
    },
    {
      header: "SGST %",
      accessor: "sgstPercentage" as keyof PurchaseEntryData,
    },
    {
      header: "CGST Amount ",
      accessor: "cgstAmount" as keyof PurchaseEntryData,
    },
    {
      header: "SGST Amount",
      accessor: "sgstAmount" as keyof PurchaseEntryData,
    },
  ];

  return (
    <>
      <main className="space-y-10">
        <div className="justify-start text-darkPurple text-3xl font-medium leading-10">
          Order Summary
        </div>

        <div className="flex space-x-7 w-fit">
          <div className="border border-Gray w-80 h-64 rounded-lg p-6 flex flex-col items-center justify-center text-center">
            <div className="text-darkPurple text-3xl font-bold">
              Cure Plus Pharma
            </div>
            <div>
              <Image
                src="/PharmacyLogo.jpg"
                alt="Pharmacy Logo"
                width={200}
                height={200}
              />
            </div>
          </div>

          <div className="border border-Gray w-96 h-64 rounded-lg p-6 flex">
            <div>
              {[
                { label: "Bill No", value: 1111 },
                { label: "Bill Date", value: 1111 },
                { label: "Payment Due Date", value: 1111 },
                { label: "Order Status", value: 1111 },
                { label: "Payment Status", value: 1111 },
                { label: "DL No", value: 1111 },
                { label: "GSTIN No", value: 1111 },
              ].map(({ label, value }, index) => (
                <div key={index} className="flex text-sm space-y-3 space-x-2">
                  <div className="font-semibold">{label}</div>
                  <div>
                    <span className="font-semibold"> : </span>
                    {}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-Gray w-md h-64 rounded-lg p-6 ">
            <div>
              {[
                { label: "Supplier", value: 1111 },
                { label: "Contact", value: 1111 },
                { label: "GSTIN No", value: 1111 },
                { label: "Email", value: 1111 },
                { label: "Address", value: 1111 },
              ].map(({ label, value }, index) => (
                <div key={index} className="flex text-sm space-y-3 space-x-2">
                  <div className="font-semibold">{label}</div>
                  <div>
                    <span className="font-semibold"> : </span>
                    {}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <Table
            data={[]}
            columns={columns}
            noDataMessage="No patients found"
          />
        </div>

        <div className="flex">
          <div className="w-full max-w-2xl">
            <Table
              data={[]}
              columns={columns1}
              noDataMessage="No patients found"
            />
          </div>

          <div className="border h-60 w-lg border-Gray rounded-xl p-6 space-y-5 ml-auto font-normal text-sm">
            {[
              { label: "SUB TOTAL", value: 1111 },
              { label: "CGST", value: 1111 },
              { label: "SGST", value: 1111 },
              { label: "DISCOUNT", value: 1111 },
              { label: "GRAND TOTAL", value: 1111, isTotal: true },
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
                <div>{value}</div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div>
                 <span className="text-lg font-semibold flex space-x-3">
                    <Image src="/TiamedsIcon.svg" alt="Company Logo" width={45} height={32} />
                    <Image src="/TiamedsLogo.svg" alt="Company Logo" width={90} height={32}  />
                  </span>
          </div>
          <div>
            Powered by TiaMeds Technology Pvt Ltd
          </div>
        </div>
      </main>
    </>
  );
};

export default page;
