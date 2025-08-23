import Button from "@/app/components/common/Button";
import InputField from "@/app/components/common/InputField";
import { itemSchema } from "@/app/schema/ItemSchema";
import {
  checkDuplicateItem,
  createItem,
  getItemById,
  itemDelete,
  updateItem,
} from "@/app/services/ItemService";
import { getVariant } from "@/app/services/VariantService";
import { ItemData } from "@/app/types/ItemData";
import { VariantData } from "@/app/types/VariantData";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { z, ZodError } from "zod";

interface ItemProps {
  setShowDrawer: (value: boolean) => void;
  itemId?: string | null;
  action?: "edit" | "delete";
  onSuccess?: () => void;
}

const AddItem: React.FC<ItemProps> = ({ setShowDrawer, itemId, action,onSuccess }) => {
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  const [variant, setVariant] = useState<VariantData[]>([]);

  const [formData, setFormData] = useState<ItemData>({
    itemId: "",
    itemName: "",
    purchaseUnit: 0,
    variantId: "",
    unitId: "",
    variantName: "",
    unitName: "",
    manufacturer: "",
    purchasePrice: 0,
    mrpSalePrice: 0,
    purchasePricePerUnit: 0,
    mrpSalePricePerUnit: 0,
    gstPercentage: 0,
    genericName: "",
    hsnNo: "",
    consumables: "",
  });

  useEffect(() => {
    async function fetch() {
      try {
        const data = await getVariant();
        setVariant(data);
      } catch (e) {
        console.error(e);
      }
    }
    fetch();
  }, []);

  const unitOptions = React.useMemo(() => {
    const chosen = variant.find((v) => v.variantId === formData.variantId);
    return chosen
      ? chosen.unitDtos.map((u) => ({ id: u.unitId, name: u.unitName }))
      : [];
  }, [variant, formData.variantId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { id, value } = e.target;

    const numericFields = [
      "purchaseUnit",
      "purchasePrice",
      "mrpSalePrice",
      "purchasePricePerUnit",
      "mrpSalePricePerUnit",
      "gstPercentage",
    ];

    const formattedValue = numericFields.includes(id)
      ? Number(value) || 0
      : value;

    setFormData((prev) => {
      const next = { ...prev, [id]: formattedValue };

      const purchaseUnit =
        id === "purchaseUnit" ? Number(value) : prev.purchaseUnit;
      const purchasePrice =
        id === "purchasePrice" ? Number(value) : prev.purchasePrice;
      const mrpSalePrice =
        id === "mrpSalePrice" ? Number(value) : prev.mrpSalePrice;

      const safeUnit = purchaseUnit || 1;

      next.purchasePricePerUnit = purchasePrice / safeUnit;
      next.mrpSalePricePerUnit = mrpSalePrice / safeUnit;

      if (id === "variantId") {
        const chosen = variant.find((v) => v.variantId === value);
        if (chosen) {
          next.variantId = chosen.variantId;
          next.variantName = chosen.variantName; // <- add this
          const unit = chosen.unitDtos[0];
          if (unit) {
            next.unitId = unit.unitId;
            next.unitName = unit.unitName; // <- and this
          } else {
            next.unitId = "";
            next.unitName = "";
          }
        }
      }

      if (id === "unitId") {
        const selectedUnit = unitOptions.find((u) => u.id === value);
        if (selectedUnit) {
          next.unitId = selectedUnit.id;
          next.unitName = selectedUnit.name; // <- set name
        }
      }

      return next;
    });

    if (id in itemSchema.shape) {
      const fieldKey = id as keyof typeof itemSchema.shape;
      const singleFieldSchema = z.object({
        [fieldKey]: itemSchema.shape[fieldKey],
      });

      const result = singleFieldSchema.safeParse({
        [fieldKey]: formattedValue,
      });

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

  const addItem = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setValidationErrors({});

    try {
      itemSchema.parse(formData);

      if (formData.mrpSalePrice <= formData.purchasePrice) {
        toast.error("MRP must be greater than Purchase Price", {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }

      if (!itemId) {
        const duplicateCheck = await checkDuplicateItem({
          itemName: formData.itemName,
          manufacturer: formData.manufacturer,
        });

        if (duplicateCheck.duplicate) {
          setValidationErrors({
            itemName:
              "Item with the same name and manufacturer already exists.",
          });
          return;
        }
      }

      if (itemId) {
        await updateItem(itemId, formData);
        toast.success("Item updated successfully", {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        await createItem(formData);
        toast.success("Item created successfully", {
          position: "top-right",
          autoClose: 3000,
        });
      }

      setShowDrawer(false);
      onSuccess?.();
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
        console.error("Unexpected Error:", error.message);
      } else {
        console.error("Unknown error occurred", error);
      }
    }
  };

  useEffect(() => {
  if (!itemId) return;

  async function fetchItemDetails() {
    try {
      const data = await getItemById(itemId!);

      const matchingVariant = variant.find(
        (v) => v.variantName === data.variantName 
      );

      const matchingUnit = matchingVariant?.unitDtos.find(
        (u) => u.unitName === data.unitName 
      );

      setFormData({
        ...data,
        variantId: matchingVariant?.variantId || "", 
        unitId: matchingUnit?.unitId || "",        
        purchasePricePerUnit: data.purchaseUnit
          ? data.purchasePrice / data.purchaseUnit
          : 0,
        mrpSalePricePerUnit: data.purchaseUnit
          ? data.mrpSalePrice / data.purchaseUnit
          : 0,
      });
    } catch (error) {
      console.error("Failed to fetch item details:", error);
      toast.error("Failed to fetch item data.", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  }

  fetchItemDetails();
}, [itemId, variant]);


  const handleDeleteItem = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (!itemId) return;

    try {
      await itemDelete(itemId);
      toast.success("Item deleted successfully", {
        position: "top-right",
        autoClose: 3000,
      });
      setShowDrawer(false);
      window.location.reload();
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error("Failed to delete item", { position: "top-right" });
    }
  };

  return (
    <>
      <main className="space-y-6">
        <div>
          <div className="relative mt-4 grid grid-cols-2 gap-4">
            {[
              {
                id: "itemName",
                label: "Item Name",
                type: "text",
                maxLength: 50,
              },
              {
                id: "purchaseUnit",
                label: "Purchase Unit",
                type: "text",
              },
            ].map(({ id, label, type, maxLength }) => (
              <div key={id} className="flex flex-col w-full relative">
                <InputField
                  type={type}
                  id={id}
                  label={
                    <>
                      {label} <span className="text-tertiaryRed">*</span>
                    </>
                  }
                  maxLength={maxLength}
                  value={String(formData[id as keyof ItemData] ?? "")}
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
              {
                id: "variantId",
                label: "Variant Type",
                type: "select" as const,
                options: variant.map((v) => ({
                  id: v.variantId,
                  name: v.variantName,
                })),
              },
              {
                id: "unitId",
                label: "Unit Type",
                type: "select" as const,
                options: unitOptions,
              },
            ].map(({ id, label, type, options }) => (
              <div key={id} className="flex flex-col w-full relative">
                {type === "select" ? (
                  <>
                    <label
                      htmlFor={id}
                      className="absolute left-3 top-0 -translate-y-1/2 bg-white px-1 text-gray-500 text-xs transition-all"
                    >
                      {label} <span className="text-tertiaryRed">*</span>
                    </label>

                    <select
                      id={id}
                      value={String(formData[id as keyof ItemData] ?? "")}
                      onChange={handleChange}
                      className="peer w-full px-3 py-3 border border-gray-400 rounded-md bg-transparent text-black outline-none focus:border-purple-900 focus:ring-0"
                    >
                      <option value="" disabled>
                        Select {label}
                      </option>
                      {options.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.name}
                        </option>
                      ))}
                    </select>
                  </>
                ) : (
                  <InputField
                    type={type}
                    id={id}
                    label={label}
                    value={String(formData[id as keyof ItemData] ?? "")}
                    onChange={handleChange}
                  />
                )}
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
              {
                id: "purchasePrice",
                label: "Purchase Price",
                type: "text",
              },
              {
                id: "mrpSalePrice",
                label: "MRP",
                type: "text",
              },
            ].map(({ id, label, type }) => (
              <div key={id} className="flex flex-col w-full relative">
                <InputField
                  type={type}
                  id={id}
                  label={
                    <>
                      {label} <span className="text-tertiaryRed">*</span>
                    </>
                  }
                  value={String(formData[id as keyof ItemData] ?? "")}
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
              { id: "purchasePricePerUnit", label: "Purchase Price Per Unit" },
              { id: "mrpSalePricePerUnit", label: "MRP Per Unit" },
            ].map(({ id, label }) => (
              <InputField
                type={"number"}
                key={id}
                id={id}
                label={
                  <>
                    {label} <span className="text-tertiaryRed">*</span>
                  </>
                }
                value={String(formData[id as keyof ItemData])}
                onChange={(e) => handleChange(e)}
                readOnly
              />
            ))}
          </div>

          <div className="relative mt-8 grid grid-cols-2 gap-4">
            {[
              {
                id: "gstPercentage",
                label: "GST Percentage",
                type: "text",
              },
              {
                id: "hsnNo",
                label: "HSN Number",
                type: "text",
              },
            ].map(({ id, label, type }) => (
              <div key={id} className="flex flex-col w-full relative">
                <InputField
                  type={type}
                  id={id}
                  label={
                    <>
                      {label} <span className="text-tertiaryRed">*</span>
                    </>
                  }
                  value={String(formData[id as keyof ItemData] ?? "")}
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
              { id: "genericName", label: "Generic Name", type: "text" },
              { id: "manufacturer", label: "Manufacturer", type: "text" },
            ].map(({ id, label, type }) => (
              <div key={id} className="flex flex-col w-full relative">
                <InputField
                  type={type}
                  id={id}
                  label={label}
                  value={String(formData[id as keyof ItemData] ?? "")}
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
        </div>

        <div>
          <Button
            onClick={action === "delete" ? handleDeleteItem : addItem}
            label={
              action === "delete" ? "Delete" : itemId ? "Save" : "Add Item"
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

export default AddItem;
