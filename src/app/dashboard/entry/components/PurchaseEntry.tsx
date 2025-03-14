"use client"
import Button from "@/app/components/common/Button";
import React from "react";

interface PurchaseEntryProps {
  setShowPurchaseEntry: (value: boolean) => void;
}

const PurchaseEntry: React.FC<PurchaseEntryProps> = ({
  setShowPurchaseEntry,
}) => {
  const handleClose = () => {
    setShowPurchaseEntry(false);
  };

  return (
    <>
    <main className="space-y-6">
    <div className="flex justify-between">
      <div className="justify-start text-darkPurple text-3xl font-medium leading-10 ">
        Purchase Entry
      </div>

      <div>
        <Button
          onClick={() => handleClose()}
          label="Close"
          value=""
          className="w-20 bg-darkRed text-white"
        ></Button>
      </div>
    </div>

    <div className="border border-Gray max-w-7xl h-80 rounded-lg p-5">
    
        <div className="justify-start text-black text-lg font-normal leading-7">Basic details</div>
        
        

    </div>
    </main>
    </>
  );
};

export default PurchaseEntry;
