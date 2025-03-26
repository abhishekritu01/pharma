import Button from "@/app/components/common/Button";
import InputField from "@/app/components/common/InputField";
import { itemSchema } from "@/app/schema/ItemSchema";
import { createItem } from "@/app/services/ItemService";
import { ItemData } from "@/app/types/ItemData";
import React, { useState } from "react";
import { toast } from "react-toastify";
import { ZodError } from "zod";

interface SupplierProps {
  setShowDrawer: (value: boolean) => void; 
}

const AddItem : React.FC<SupplierProps> = ({setShowDrawer}) =>{

  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  const [formData, setFormData] = useState<ItemData>({
    itemId: undefined,
    itemName: "",
    purchaseUnit: 0,
    unitId: 0,
    variantId: 0,
    manufacturer: "",
    purchasePrice: 0,
    mrpSalePrice: 0,
    purchasePricePerUnit: 0,
    mrpSalePricePerUnit: 0,
    cgstPercentage: 0,
    sgstPercentage: 0,
    gstPercentage: 0,
    hsnNo: "",
    consumables: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [id as keyof ItemData]: [
        "unitId",
        "variantId",
        "purchaseUnit",
        "purchasePrice",
        "mrpSalePrice",
        "purchasePricePerUnit",
        "mrpSalePricePerUnit",
        "cgstPercentage",
        "sgstPercentage",
      ].includes(id)
        ? Number(value)
        : value,
    }));
  };

  const addItem = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setValidationErrors({});
    try {
      itemSchema.parse(formData);

      await createItem(formData);
      toast.success("Item created successfully", {
        position: "top-right",
        autoClose: 3000,
      });

      setShowDrawer(false)
    } catch (error) {
      console.error("Error:", error);
      if (error instanceof ZodError) {
        // Collect all validation errors and store them in state
        const formattedErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          const field = err.path[0] as string;
          formattedErrors[field] = err.message;
        });

        setValidationErrors(formattedErrors); // Update state to show messages
      } else if (error instanceof Error) {
        console.error("Unexpected Error:", error.message);
      } else {
        console.error("Unknown error occurred", error);
      }
    }
  };

  return (
    <>
      <main className="space-y-6">
        <div>

          <div className="relative mt-4 grid grid-cols-2 gap-4">
            {[
              { id: "itemName", label: "Item Name", type: "text" },
              { id: "purchaseUnit", label: "Purchase Unit", type: "number" },
            ].map(({ id, label, type }) => (
              <InputField
                key={id}
                id={id}
                label={label}
                type={type} 
                value={String(formData[id as keyof ItemData] ?? "")} 
                onChange={(e) => handleChange(e)}
              />
            ))}
          </div>

          <div className="relative mt-8 grid grid-cols-2 gap-4">
            {[
              { id: "unitId", label: "Unit Name" },
              { id: "variantId", label: "Variant Name" },
            ].map(({ id, label }) => (
              <InputField
                type={"number"}
                key={id}
                id={id}
                label={label}
                value={String(formData[id as keyof ItemData])}
                onChange={(e) => handleChange(e)}
              />
            ))}
          </div>

          <div className="relative mt-8 grid grid-cols-2 gap-4">
            {[
              { id: "purchasePrice", label: "Purchase Price" },
              { id: "mrpSalePrice", label: "MRP" },
            ].map(({ id, label }) => (
              <InputField
                type={"number"}
                key={id}
                id={id}
                label={label}
                value={String(formData[id as keyof ItemData])}
                onChange={(e) => handleChange(e)}
              />
            ))}
          </div>

          <div className="relative mt-8 grid grid-cols-2 gap-4">
            {[
              { id: "purchasePricePerUnit", label: "Purchase Price Per Unit" },
              { id: "mrpSalePricePerUnit", label: "MRP Per Unit" },
            ].map(({ id, label }) => (
              <InputField
                type={"number"}
                key={id}
                id={id}
                label={label}
                value={String(formData[id as keyof ItemData])}
                onChange={(e) => handleChange(e)}
              />
            ))}
          </div>

          <div className="relative mt-8 grid grid-cols-2 gap-4">
            {[
              { id: "cgstPercentage", label: "CGST Percentage" },
              { id: "sgstPercentage", label: "SGST Percentage" },
            ].map(({ id, label }) => (
              <InputField
                type={"number"}
                key={id}
                id={id}
                label={label}
                value={String(formData[id as keyof ItemData])}
                onChange={(e) => handleChange(e)}
              />
            ))}
          </div>

          <div className="relative mt-8 grid grid-cols-2 gap-4">
            {[
              { id: "manufacturer", label: "Manufacturer" },
              { id: "hsnNo", label: "HSN Number" },
            ].map(({ id, label }) => (
              <InputField
                key={id}
                id={id}
                label={label}
                value={String(formData[id as keyof ItemData])}
                onChange={(e) => handleChange(e)}
              />
            ))}
          </div>
        </div>

        <div>
          <Button
            onClick={addItem}
            label="Add Item"
            value=""
            className="w-36 bg-darkPurple text-white"
          ></Button>
        </div>
      </main>
    </>
  );
};

export default AddItem;
