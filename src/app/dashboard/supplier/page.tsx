"use client";

import Drawer from "@/app/components/common/Drawer";
import Input from "@/app/components/common/Input";
import Table from "@/app/components/common/Table";
import { getSupplier } from "@/app/services/SupplierService";
import { SupplierData } from "@/app/types/SupplierData";
import { Plus, Search } from "lucide-react";
import React, { useEffect, useState } from "react";
import { MdEdit} from "react-icons/md";
import AddSupplier from "./component/AddSupplier";
import Button from "@/app/components/common/Button";

type Action = "edit" | "delete";

const Page = () => {
  const [searchText, setSearchText] = useState<string>("");
  const [supplierData, setSupplierData] = useState<SupplierData[]>([]);
  const [showSupplier, setShowSupplier] = useState(false);
  const [, setShowDrawer] = useState<boolean>(false);
  const [currentSupplierId, setCurrentSupplierId] = useState<string | null>(
    null
  );
  const [action, setAction] = useState<Action | undefined>(undefined);

  const columns = [
    {
      header: "Supplier Name",
      accessor: "supplierName" as keyof SupplierData,
    },
    {
      header: "Contact No.",
      accessor: "supplierMobile" as keyof SupplierData,
    },
    {
      header: "Email ID",
      accessor: "supplierEmail" as keyof SupplierData,
    },
    {
      header: "Action",
      accessor: (row: SupplierData) => (
        <div className="space-x-3">
          <button
            className="cursor-pointer hover:opacity-80 transition"
            onClick={() =>
              row.supplierId && handleSupplierDrawer(row.supplierId, "edit")
            }
          >
            <MdEdit size={19} color="228B22" />
          </button>

          {/* <button
            className="cursor-pointer hover:opacity-80 transition"
            onClick={() =>
              row.supplierId && handleSupplierDrawer(row.supplierId, "delete")
            }
          >
            <MdDelete size={20} color="B30000" />
          </button> */}
        </div>
      ),
    },
  ];

  const filteredData = supplierData.filter((item) => {
    const search = searchText.toLowerCase();

    return (
      item.supplierName?.toLowerCase().includes(search) ||
      item.supplierMobile?.toString().toLowerCase().includes(search) ||
      item.supplierEmail?.toString().toLowerCase().includes(search)
    );
  });

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const data = await getSupplier();
        setSupplierData(data);
      } catch (error) {
        console.error("Failed to fetch suppliers:", error);
      }
    };

    fetchSuppliers();
  }, []);

  const handleSupplierDrawer = (supplierId?: string, action?: Action) => {
    if (supplierId) {
    setCurrentSupplierId(supplierId);
  } else {
    setCurrentSupplierId(null);
  }

    setAction(action); 
    setShowSupplier(true);
    setShowDrawer(true);
  };

  const handleCloseDrawer = () => {
    setShowDrawer(false);
    setShowSupplier(false);
  };

  return (
    <>
      {showSupplier && (
        <Drawer setShowDrawer={handleCloseDrawer} title={"Supplier Master"}>
          <AddSupplier
            setShowDrawer={handleCloseDrawer}
            supplierId={currentSupplierId}
            action={action}
          />
        </Drawer>
      )}


      <main className="space-y-10">
        <div className="flex justify-between">
          <div className="justify-start text-darkPurple text-3xl font-medium leading-10">
            Supplier List
          </div>

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

          <div>
            <Button
              onClick={() => handleSupplierDrawer()}
              label="Add New Supplier"
              value=""
              className="w-52 bg-darkPurple text-white h-11 "
              icon={<Plus size={15} />}
            ></Button>
          </div>
          </div>
        </div>

        <Table
          data={filteredData}
          columns={columns}
          noDataMessage="No records found"
        />
      </main>
    </>
  );
};

export default Page;
