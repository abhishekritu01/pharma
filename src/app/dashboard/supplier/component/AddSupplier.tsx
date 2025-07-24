import Button from "@/app/components/common/Button";
import InputField from "@/app/components/common/InputField";
import TextareaField from "@/app/components/common/TextareaFeild";
import { supplierSchema } from "@/app/schema/SupplierSchema";
import {
  checkSupplierDuplicate,
  createSupplier,
  getSupplierById,
  supplierDelete,
  updateSupplier,
} from "@/app/services/SupplierService";
import { SupplierData } from "@/app/types/SupplierData";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { z, ZodError } from "zod";

interface SupplierProps {
  setShowDrawer: (value: boolean) => void;
  supplierId?: string | null;
  action?: "edit" | "delete";
}

const AddSupplier: React.FC<SupplierProps> = ({
  setShowDrawer,
  supplierId,
  action,
}) => {
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [formData, setFormData] = useState<SupplierData>({
    supplierId: "",
    supplierName: "",
    supplierMobile: 0,
    supplierEmail: "",
    supplierGstinNo: "",
    supplierGstType: "",
    supplierAddress: "",
  });


  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { id, value } = e.target;

    let updatedValue: string | number = value;

    if (id === "supplierMobile") {
      updatedValue = Number(value.replace(/\D/g, ""));
    }

    setFormData((prev) => ({
      ...prev,
      [id]: updatedValue,
    }));

    if (id in supplierSchema.shape) {
      const fieldKey = id as keyof typeof supplierSchema.shape;

      const singleFieldSchema = z.object({
        [fieldKey]: supplierSchema.shape[fieldKey],
      });

      const result = singleFieldSchema.safeParse({ [fieldKey]: updatedValue });

      if (!result.success) {
        setValidationErrors((prev) => ({
          ...prev,
          [id]: result.error.errors[0].message,
        }));
      } else {
        setValidationErrors((prev) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { [id]: _, ...rest } = prev;
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
      const exists = await checkSupplierDuplicate({
        supplierName: formData.supplierName,
        supplierMobile: String(formData.supplierMobile),
        supplierGstinNo: formData.supplierGstinNo,
      });

      if (
        exists.supplierName ||
        exists.supplierMobile ||
        exists.supplierGstinNo
      ) {
        const newErrors: Record<string, string> = {};
        if (exists.supplierName)
          newErrors.supplierName = "Supplier name already exists";
        if (exists.supplierMobile)
          newErrors.supplierMobile = "Mobile number already exists";
        if (exists.supplierGstinNo)
          newErrors.supplierGstinNo = "GSTIN number already exists";
        setValidationErrors(newErrors);
        return;
      }

      if (formData.supplierId) {
        await updateSupplier(formData.supplierId, formData);
        toast.success("Supplier updated successfully", {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        await createSupplier(formData);
        toast.success("Supplier created successfully", {
          position: "top-right",
          autoClose: 3000,
        });
      }

      setShowDrawer(false);
      // window.location.reload();
    } catch (error) {
      console.error("Error:", error);
      if (error instanceof ZodError) {
        const formattedErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          const field = err.path[0] as string;
          formattedErrors[field] = err.message;
        });
        setValidationErrors(formattedErrors);
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Unknown error occurred");
      }
    }
  };

  useEffect(() => {
    const fetchSupplier = async () => {
      if (!supplierId) return;
      try {
        const data = await getSupplierById(supplierId);
        setFormData(data);
      } catch (error) {
        console.error("Error fetching supplier for edit:", error);
        toast.error("Failed to load supplier details", {
          position: "top-right",
        });
      }
    };

    fetchSupplier();
  }, [supplierId]);

  const handleDeleteSupplier = async (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();

    if (!supplierId) return;

    try {
      await supplierDelete(supplierId);
      toast.success("Supplier deleted successfully", {
        position: "top-right",
        autoClose: 3000,
      });
      setShowDrawer(false);
      window.location.reload();
    } catch (error) {
      console.error("Error deleting supplier:", error);
      toast.error("Failed to delete supplier", { position: "top-right" });
    }
  };

  return (
    <>
      <main className="space-y-4">
        <div>
          <div className="relative mt-4 grid grid-cols-2 gap-4">
            {[
              {
                id: "supplierName",
                label: "Supplier Name",
                type: "text",
                maxLength: 50,
              },
              {
                id: "supplierMobile",
                label: "Mobile Number",
                type: "text",
                maxLength: 10,
              },
            ].map(({ id, label, type, maxLength }) => (
              <div key={id} className="flex flex-col">
                <InputField
                  type={type}
                  id={id}
                  label={
                    <>
                      {label} <span className="text-tertiaryRed">*</span>
                    </>
                  }
                  maxLength={maxLength}
                  value={String(formData[id as keyof SupplierData] ?? "")}
                  onChange={(e) => handleChange(e)}
                />
                {validationErrors[id] && (
                  <span className="text-tertiaryRed text-sm">
                    {validationErrors[id]}
                  </span>
                )}
              </div>
            ))}
          </div>

          <div className="relative mt-8 grid grid-cols-2 gap-4">
            {[
              { id: "supplierGstinNo", label: "GSTIN Number", maxLength: 15 },
              { id: "supplierGstType", label: "GST Type", type: "select" }, // ✅ Mark as a dropdown
            ].map(({ id, label, maxLength }) => (
              <div key={id} className="relative w-72">
                {id === "supplierGstType" ? (
                  <>
                    {/* Floating Label for Dropdown */}
                    <label
                      htmlFor={id}
                      className="absolute left-3 top-0 -translate-y-1/2 bg-white px-1 text-gray-500 text-xs transition-all"
                    >
                      {label} <span className="text-tertiaryRed">*</span>
                    </label>

                    <select
                      id={id}
                      value={formData[id as keyof SupplierData] || ""}
                      onChange={(e) => handleChange(e)}
                      className="peer w-full px-3 py-3 border border-gray-400 rounded-md bg-transparent text-black outline-none focus:border-purple-900 focus:ring-0"
                    >
                      <option value="" disabled>
                        Select
                      </option>
                      <option value="CGST">CGST</option>
                      <option value="SGST">SGST</option>
                      <option value="CGST+SGST">CGST+SGST</option>
                    </select>
                  </>
                ) : (
                  <InputField
                    id={id}
                    label={
                      <>
                        {label} <span className="text-tertiaryRed">*</span>
                      </>
                    }
                    maxLength={maxLength}
                    value={String(formData[id as keyof SupplierData] ?? "")}
                    onChange={(e) => handleChange(e)}
                  />
                )}
                {validationErrors[id] && (
                  <span className="text-tertiaryRed">
                    {validationErrors[id]}
                  </span>
                )}
              </div>
            ))}
          </div>

          
          <div className="relative mt-8 grid grid-cols-2 gap-4">
            {[{ id: "supplierEmail", label: "Email" }].map(({ id, label }) => (
              <div key={id} className="relative w-72">
                <InputField
                  id={id}
                  label={
                    <>
                      {label} <span className="text-tertiaryRed">*</span>
                    </>
                  }
                  value={String(formData[id as keyof SupplierData] ?? "")}
                  onChange={(e) => handleChange(e)}
                />
                {validationErrors[id] && (
                  <span className="text-tertiaryRed text-sm">
                    {validationErrors[id]}
                  </span>
                )}
              </div>
            ))}
          </div>

          <div className="mt-8">
            <TextareaField
              id="supplierAddress"
              label="Address"
              value={String(formData.supplierAddress)}
              rows={2}
              cols={40}
              onChange={(e) => handleChange(e)}
            />
          </div>
        </div>

        <div>
          <Button
            onClick={action === "delete" ? handleDeleteSupplier : addSupplier}
            label={
              action === "delete"
                ? "Delete"
                : supplierId
                ? "Save"
                : "Add Supplier"
            }
            value=""
            className={`w-36 h-11 text-white ${
              action === "delete" ? "bg-darkRed" : "bg-darkPurple"
            }`}
          />
        </div>
      </main>
    </>
  );
};

export default AddSupplier;
