import Button from '@/app/components/common/Button';
import InputField from '@/app/components/common/InputField'
import { supplierSchema } from '@/app/schema/SupplierSchema';
import { createSupplier } from '@/app/services/SupplierService';
import { SupplierData } from '@/app/types/SupplierData';
import React, { useState } from 'react'
import { toast } from 'react-toastify';
import { ZodError } from 'zod';

const AddSupplier = () => {

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<SupplierData>({
    supplierId: undefined,
    supplierName: "",
    supplierMobile: 0,
    supplierEmail: "",
    supplierGstinNo: "",
    supplierGstType: "",
    supplierAddress: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    
    setFormData((prev) => ({
      ...prev,
      [id as keyof SupplierData]: id === "supplierMobile" || id === "supplierId" ? Number(value) : value, 
    }));
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
              { id: "supplierName", label: "Supplier Name" },
              { id: "supplierMobile", label: "Mobile Number" },
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

          <div className="relative mt-8 grid grid-cols-2 gap-4">
            {[
              { id: "supplierGstinNo", label: "GSTIN Number" },
              { id: "supplierGstType", label: "GST Type" },
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
}

export default AddSupplier;
