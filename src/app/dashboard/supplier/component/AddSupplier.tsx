import Button from "@/app/components/common/Button";
import InputField from "@/app/components/common/InputField";
import { supplierSchema } from "@/app/schema/SupplierSchema";
import { createSupplier } from "@/app/services/SupplierService";
import { SupplierData } from "@/app/types/SupplierData";
import React, { useState } from "react";
import { toast } from "react-toastify";
import { z, ZodError } from "zod";

interface SupplierProps {
  setShowDrawer: (value: boolean) => void;
}

const AddSupplier: React.FC<SupplierProps> = ({ setShowDrawer }) => {
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [formData, setFormData] = useState<SupplierData>({
    supplierId: undefined,
    supplierName: "",
    supplierMobile: 0,
    supplierEmail: "",
    supplierGstinNo: "",
    supplierGstType: "",
    supplierAddress: "",
  });

  // const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const { id, value } = e.target;

  //   setFormData((prev) => ({
  //     ...prev,
  //     [id as keyof SupplierData]:
  //       id === "supplierMobile" || id === "supplierId" ? Number(value) : value,
  //   }));
  // };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
  
    setFormData((prev) => ({
      ...prev,
      [id]: id === "supplierMobile" ? value.replace(/\D/g, "") : value, 
    }));
  
    // Ensure `id` is a valid key in supplierSchema.shape
    if (id in supplierSchema.shape) {
      const fieldKey = id as keyof typeof supplierSchema.shape;
  
      // Pick the field dynamically
      const singleFieldSchema = z.object({ [fieldKey]: supplierSchema.shape[fieldKey] });
  
      const result = singleFieldSchema.safeParse({ [fieldKey]: value });
  
      if (!result.success) {
        setValidationErrors((prev) => ({
          ...prev,
          [id]: result.error.errors[0].message,
        }));
      } else {
        setValidationErrors((prev) => {
          const { [id]: removed, ...rest } = prev;
          return rest;
        });
      }
    }
  };
  

  const addSupplier = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    setValidationErrors({});

    try {
      supplierSchema.parse(formData);
      await createSupplier(formData);
      toast.success("Supplier created successfully", {
        position: "top-right",
        autoClose: 3000,
      });

      setShowDrawer(false);
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
          <div className="justify-start text-2xl font-medium">
            Add New Supplier
          </div>


          <div className="relative mt-8 grid grid-cols-2 gap-4">
            {[
              { id: "supplierName", label: "Supplier Name", type: "text", maxLength: 50  },
              { id: "supplierMobile", label: "Mobile Number", type: "text", maxLength: 10 },
            ].map(({ id, label, type, maxLength }) => (
              <div key={id} className="flex flex-col">
                <InputField
                 type={type}
                  id={id}
                  label={label}
                  maxLength={maxLength} 
                  value={String(formData[id as keyof SupplierData] ?? "")}
                  onChange={(e) => handleChange(e)}
                />
                {validationErrors[id] && (
                  <span className="text-red-500 text-sm">
                    {validationErrors[id]}
                  </span>
                )}
              </div>
            ))}
          </div>

          <div className="relative mt-8 grid grid-cols-2 gap-4">
            {[
              { id: "supplierGstinNo", label: "GSTIN Number" },
              { id: "supplierGstType", label: "GST Type" },
            ].map(({ id, label }) => (
              <div key={id} className="flex flex-col">
              <InputField
                key={id}
                id={id}
                label={label}
                value={String(formData[id as keyof SupplierData])}
                onChange={(e) => handleChange(e)}
              />
              {validationErrors[id] && (
                  <span className="text-red-500 text-sm">
                    {validationErrors[id]}
                  </span>
                )}
              </div>
            ))}
          </div>

          <div className="relative mt-8 grid grid-cols-2 gap-4">
            {[
              { id: "supplierEmail", label: "Email" },
              { id: "supplierAddress", label: "Address" },
            ].map(({ id, label }) => (
              <InputField
                key={id}
                id={id}
                label={label}
                value={String(formData[id as keyof SupplierData])}
                onChange={(e) => handleChange(e)}
              />
            ))}
          </div>
        </div>

        <div>
          <Button
            onClick={addSupplier}
            label="Add Supplier"
            value=""
            className="w-36 bg-darkPurple text-white"
          ></Button>
        </div>
      </main>
    </>
  );
};

export default AddSupplier;
function setShowDrawer(arg0: boolean) {
  throw new Error("Function not implemented.");
}
