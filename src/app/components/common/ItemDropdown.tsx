import React, { useEffect, useState } from "react";
import { getInventoryDetails } from "@/app/services/InventoryService";
import { getItemById } from "@/app/services/ItemService";
import AsyncSelect from "react-select/async";
import { StylesConfig } from "react-select";
import { BillingItemData } from "@/app/types/BillingData";
import { customSelectStyles } from "./DropdownStyle";

type OptionType = {
  label: string;
  value: string;
  batchNo?: string;
  itemId?: string;
  packageQty?: number;
};

interface ItemDropdownProps {
  selectedOption: OptionType | null;
  onChange: (value: OptionType | null) => void;
}

const ItemDropdown: React.FC<ItemDropdownProps> = ({
  selectedOption,
  onChange,
}) => {
  const [option, setOption] = useState<OptionType | null>(selectedOption);

  useEffect(() => {
    const fetchLabelIfMissing = async () => {
      if (
        selectedOption?.value &&
        (!selectedOption.label || selectedOption.label === "")
      ) {
        const inventory = await getInventoryDetails();
        const found = inventory.find(
          (inv: OptionType) => inv.itemId === selectedOption.value
        );
        if (found) {
          const item = await getItemById(found.itemId);
          const newOption = {
            label: item.itemName,
            value: found.itemId,
            batchNo: found.batchNo,
          };
          setOption(newOption);
          onChange(newOption);
        } else {
          setOption(null);
          onChange(null);
        }
      } else {
        setOption(selectedOption);
      }
    };

    fetchLabelIfMissing();
  }, [selectedOption, onChange]);

  const loadOptions = async (inputValue: string): Promise<OptionType[]> => {
    const response = await getInventoryDetails();
    const inventory = response.data || [];

    const options = await Promise.all(
      inventory.map(async (inv: BillingItemData) => {
        try {
          const item = await getItemById(inv.itemId);
          return {
            label: item.itemName,
            value: inv.itemId,
            batchNo: inv.batchNo,
            packageQty: inv.packageQuantity, // ✅ Add this
          };
        } catch (err) {
          console.error("Failed to fetch item for ID:", inv.itemId, err);
          return null;
        }
      })
    );

    const filtered = options.filter(
      (opt): opt is OptionType =>
        opt !== null &&
        (inputValue.trim() === "" ||
          opt.label.toLowerCase().includes(inputValue.toLowerCase()))
    );

    return filtered;
  };

  return (
    <AsyncSelect
      cacheOptions
      loadOptions={loadOptions}
      isClearable={true}
      value={option}
      onChange={(value) => {
        setOption(value);
        onChange(value);
      }}
      getOptionLabel={(e) => e.label}
      getOptionValue={(e) => e.value}
      placeholder="Search item..."
      className="w-full"
      styles={customSelectStyles<OptionType>()}
      formatOptionLabel={(data, { context }) =>
        context === "menu" ? (
          <div className="flex flex-col font-medium leading-5">
            <span>{data.label}</span>
            <span className="text-sm text-gray-500">
              Batch: {data.batchNo || "N/A"} | Qty: {data.packageQty ?? "N/A"}
            </span>
          </div>
        ) : (
          <span>{data.label}</span>
        )
      }
    />
  );
};

export default ItemDropdown;
