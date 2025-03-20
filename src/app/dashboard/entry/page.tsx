"use client";

import Button from "@/app/components/common/Button";
import Input from "@/app/components/common/Input";
import { Plus, Filter, Search } from "lucide-react";
import React, { useState } from "react";
import PurchaseEntry from "./components/PurchaseEntry";
import { PurchaseEntryData } from "@/app/types/PurchaseEntry";
import Table from "@/app/components/common/Table";
import { FaEye } from "react-icons/fa";

const page = () => {
  const [showPurchasEntry, setShowPurchasEntry] = useState(false);
  const [purchaseEntry, setPurchaseEntry] = useState<PurchaseEntryData[]>([]);

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
    { header: "Bill No", accessor: "billNo" as keyof PurchaseEntryData },
    {
      header: "Bill Amount",
      accessor: "billAMount" as keyof PurchaseEntryData,
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
      header: "Action",
      accessor: "string" as keyof PurchaseEntryData,
    },
  ];

  const dummyData: PurchaseEntryData[] = [
    {
      supplierId: 1,
      purchaseDate: new Date("2024-03-15"),
      purchaseBillNo: "B12345",
      grandTotal: 1500,
      paymentStatus: "Paid",
      goodStatus: "Received",
      stockItemDtos: [],
    },
    {
      supplierId: 2,
      purchaseDate: new Date("2024-03-15"),
      purchaseBillNo: "B54321",
      grandTotal: 2000,
      paymentStatus: "Pending",
      goodStatus: "Shipped",
      stockItemDtos: [],
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
            data={dummyData}
            columns={columns}
            noDataMessage="No patients found"
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
