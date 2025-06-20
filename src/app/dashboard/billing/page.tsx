"use client";

import Button from "@/app/components/common/Button";
import Input from "@/app/components/common/Input";
import Table from "@/app/components/common/Table";
import { BillingData } from "@/app/types/BillingData";
import { format } from "date-fns";
import { Plus, Search } from "lucide-react";
import React, { useEffect, useState } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { FaArrowDown, FaArrowUp } from "react-icons/fa";
import Billing from "./components/Billing";
import { getBilling } from "@/app/services/BillingService";
import { getPatientById } from "@/app/services/PatientService";
import BillingSummary from "./components/BillingSummary";

const Page = () => {
  const [showBilling, setShowBilling] = useState(false);
  const [billingData, setBillingData] = useState<BillingData[]>([]);
  const [, setLoading] = useState<boolean>(true);
  const [, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState<string>("");
  const [currentBillId, setCurrentBillId] = useState<string | null>(null);
  const [showBillSummary, setShowBillSummary] = useState(false);

  const formatDate = (date: string | Date): string => {
    const parsedDate = typeof date === "string" ? new Date(date) : date;
    return format(parsedDate, "dd-MM-yyyy");
  };

  const [sortConfig, setSortConfig] = useState<{
    key: keyof BillingData | null;
    direction: "asc" | "desc";
  }>({ key: null, direction: "asc" });

  const handleSort = (key: keyof BillingData) => {
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
          onClick={() => handleSort("billId1")}
        >
          <span>Bill ID</span>
          {sortConfig.key === "billId1" ? (
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
      accessor: "billId1" as keyof BillingData,
    },
    {
      header: "Patient Name",
      accessor: "patientName" as keyof BillingData,
    },

    {
      header: "Mobile No.",
      accessor: "phone" as keyof BillingData,
    },
    {
      header: "Patient Type",
      accessor: "patientType" as keyof BillingData,
    },
    {
      header: "Bill Date",
      accessor: (row: BillingData) => formatDate(row.billDateTime),
    },
    {
      header: "Patient ID",
      accessor: "patientId1" as keyof BillingData,
    },
    {
      header: "Payment Status",
      accessor: "paymentStatus" as keyof BillingData,
    },
    {
      header: "Payment Mode",
      accessor: "paymentType" as keyof BillingData,
    },
    {
      header: "Bill Amount",
      accessor: "grandTotal" as keyof BillingData,
    },
    {
      header: <BsThreeDotsVertical size={18} />,
      accessor: (row: BillingData) => (
        <div className="relative group">
          <button className="p-2 rounded-full hover:bg-gray-200 cursor-pointer">
            <BsThreeDotsVertical size={18} />
          </button>

          <div className="absolute right-0 mt-2 w-18 bg-white shadow-xl rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
            <button
              onClick={() => handleBillingSummary(row.billId)}
              className="block w-full px-4 py-2 text-left text-gray-700 cursor-pointer hover:bg-purple-950 hover:text-white hover:rounded-lg"
            >
              View
            </button>
            <button
              onClick={() => handleBillingSummary(row.billId)}
              className="block w-full px-4 py-2 text-left text-gray-700 cursor-pointer hover:bg-purple-950 hover:text-white hover:rounded-lg"
            >
              Delete
            </button>
          </div>
        </div>
      ),
    },
  ];

  const handleBillingSummary = (billId?: string) => {
    if (billId) {
      setCurrentBillId(billId);
    }
    setShowBillSummary(true);
  };

  const handleBilling = () => {
    setShowBilling(true);
  };

  useEffect(() => {
    const fetchBillingData = async () => {
      try {
        const result = await getBilling();
        if (result.status === "success") {
          const billingList = result.data;

          const enrichedBillingData = await Promise.all(
            billingList.map(async (bill: BillingData) => {
              try {
                const patient = await getPatientById(bill.patientId);
                console.log("patient-----", patient);

                return {
                  ...bill,
                  patientName: `${patient.firstName} ${patient.lastName}`,
                  phone: patient.phone,
                  patientId1: patient.patientId1,
                };
              } catch (err) {
                console.error(
                  `Failed to fetch patient for ID ${bill.patientId}`,
                  err
                );
                return {
                  ...bill,
                  patientName: "Unknown",
                  mobileNo: "N/A",
                  patientId1: "N/A",
                };
              }
            })
          );

          setBillingData(enrichedBillingData);
        } else {
          setError(result.message || "Failed to fetch data");
        }
      } catch (error) {
        console.error("Error fetching billing data:", error);
        setError("Something went wrong while fetching billing data");
      } finally {
        setLoading(false);
      }
    };

    fetchBillingData();
  }, []);

  const filteredData = billingData
    .filter((item) => {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

      const billDate = new Date(item.billDateTime);
      return billDate >= oneMonthAgo;
    })
    .filter((item) => {
      const search = searchText.toLowerCase();

      const billDateFormatted = format(
        new Date(item.billDateTime),
        "dd-MM-yyyy"
      );

      return (
        item.billId1?.toLowerCase().includes(search) ||
        item.patientName?.toLowerCase().includes(search) ||
        item.patientType?.toLowerCase().includes(search) ||
        billDateFormatted.toLowerCase().includes(search) ||
        item.patientId?.toLowerCase().includes(search) ||
        item.paymentStatus?.toLowerCase().includes(search) ||
        item.paymentType?.toLowerCase().includes(search) ||
        item.grandTotal?.toString().toLowerCase().includes(search)
      );
    });

  return (
    <>
      {showBillSummary && currentBillId ? (
        <BillingSummary billId={currentBillId} />
      ) : showBilling ? (
        <Billing setShowBilling={setShowBilling} />
      ) : (
        <main className="space-y-10">
          <div className="flex justify-between">
            <div className="justify-start text-darkPurple text-3xl font-medium leading-10">
              Billing List
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
                    onClick={() => handleBilling()}
                    label="Generate Bill"
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
    </>
  );
};

export default Page;
