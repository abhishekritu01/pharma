import Button from '@/app/components/common/Button';
import InputField from '@/app/components/common/InputField';
import { ItemData } from '@/app/types/ItemData';
import React, { useState } from 'react'

const AddItem = () => {

  const [formData, setFormData] = useState<ItemData>({
      itemId: 0,
      itemName: "",
      purchaseUnit:"",
      unitId: 0,
      variantId: 0,
      manufacturer: "",
      purchasePrice: 0,
      mrpSalePrice: 0,
      purchasePricePerUnit: 0,
      mrpSalePricePerUnit: 0,
      cgstPercentage: 0,
      sgstPercentage: 0,
      hsnNo: "",
      consumables: "",
    });
  
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { id, value } = e.target;
    
      setFormData((prev) => ({
        ...prev,
        [id as keyof ItemData]: ["unitId", "variantId", "purchasePrice", "mrp_sale_price", 
          "purchase_price_per_unit", "mrp_sale_price_per_unit", "cgst_percentage", "sgst_percentage"]
          .includes(id) ? Number(value) || 0 : value, 
      }));
    };
    

  function handleItemSave(): void {
    throw new Error('Function not implemented.');
  }

  return (
    <>
    <main className="space-y-6">
      <div>
        <div className="justify-start text-2xl font-medium">
          Add New Item
        </div>

        <div className="relative mt-8 grid grid-cols-2 gap-4">
          {[
            { id: "itemName", label: "Item Name" },
            { id: "purchaseUnit", label: "Purchase Unit" },
          ].map(({ id, label }) => (
            <InputField 
              key={id} 
              id={id} 
              label={label} 
              value={String(formData[id as keyof ItemData])}
              onChange={handleInputChange} 
            />
          ))}
        </div>

        <div className="relative mt-8 grid grid-cols-2 gap-4">
          {[
            { id: "unitId", label: "Unit Name" },
            { id: "variantId", label: "Variant Name" },
          ].map(({ id, label }) => (
            <InputField 
              key={id} 
              id={id} 
              label={label} 
              value={String(formData[id as keyof ItemData])} 
              onChange={handleInputChange} 
            />
          ))}
        </div>

        <div className="relative mt-8 grid grid-cols-2 gap-4">
          {[
            { id: "purchasePrice", label: "Purchase Price" },
            { id: "mrpSalePrice", label: "MRP"},
          ].map(({ id, label }) => (
            <InputField 
              key={id} 
              id={id} 
              label={label} 
              value={String(formData[id as keyof ItemData])} 
              onChange={handleInputChange} 
            />
          ))}
        </div>

        <div className="relative mt-8 grid grid-cols-2 gap-4">
          {[
            { id: "purchasePricePerUnit", label: "Purchase Price Per Unit" },
            { id: "mrpSalePricePerUnit", label: "MRP Per Unit" },
          ].map(({ id, label }) => (
            <InputField 
              key={id} 
              id={id} 
              label={label} 
              value={String(formData[id as keyof ItemData])} 
              onChange={handleInputChange} 
            />
          ))}
        </div>

        <div className="relative mt-8 grid grid-cols-2 gap-4">
          {[
            { id: "cgstPercentage", label: "CGST Percentage" },
            { id: "sgstPercentage", label: "SGST Percentage" },
          ].map(({ id, label }) => (
            <InputField 
              key={id} 
              id={id} 
              label={label} 
              value={String(formData[id as keyof ItemData])} 
              onChange={handleInputChange} 
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
              onChange={handleInputChange} 
            />
          ))}
        </div>
        
        
      </div>

      
      <div>
          <Button
            onClick={() => handleItemSave()}
            label="Add Item"
            value=""
            className="w-36 bg-darkPurple text-white"
          ></Button>
        </div>
    </main>
  </>
  )
}

export default AddItem