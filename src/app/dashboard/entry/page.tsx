"use client";

import Button from "@/app/components/common/Button";
import Input from "@/app/components/common/Input";
import { Plus, Filter, Search } from "lucide-react";
import React, { useState } from "react";
import PurchaseEntry from "./components/PurchaseEntry";

const page = () => {
  const [showPurchasEntry, setShowPurchasEntry] = useState(false);

  const handlePurchesEntry = () => {
    setShowPurchasEntry(true);
  };

  return (
    <>
      {!showPurchasEntry && (
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
                  className="w-52 bg-darkPurple text-white"
                  icon={<Plus size={15} />}
                ></Button>
              </div>
            </div>
          </div>
      
      </div>
        )}



      {showPurchasEntry && (
        <PurchaseEntry

          setShowPurchaseEntry={setShowPurchasEntry}
        />
      )}
    </>
  );
};

export default page;
