import React, { useEffect, useState } from "react";
import { getInventoryDetails } from "@/app/services/InventoryService";
import { getItemById } from "@/app/services/ItemService"; 
import AsyncSelect from "react-select/async";
import {StylesConfig } from "react-select";
import { BillingItemData } from "@/app/types/BillingData";


type OptionType = {
  label: string;
  value: string;
  batchNo?: string;
  itemId?: string;
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

  // const customStyles = {
  //   control: (base: any, state: any) => ({
  //     ...base,
  //     borderColor: state.isFocused ? "#6B21A8" : "#D1D5DB",
  //     boxShadow: state.isFocused ? "#6B21A8" : "none",
  //     "&:hover": {
  //       borderColor: "#4B0082",
  //     },
  //     borderRadius: "0.5rem",
  //   }),
  //   option: (base: any, state: any) => ({
  //     ...base,
  //     backgroundColor: state.isSelected
  //       ? "#4B0082"
  //       : state.isFocused
  //       ? "#E5D2F4"
  //       : "white",
  //     color: state.isSelected ? "white" : "black",
  //     cursor: "pointer",
  //     borderRadius: "0.5rem",
  //     margin: "2px",
  //     ":active": {
  //       backgroundColor: state.isSelected ? "#4B0082" : "#E5D2F4",
  //     },
  //   }),
  //   singleValue: (base: any) => ({
  //     ...base,
  //     color: "#000",
  //   }),
  // };

  const customStyles: StylesConfig<OptionType, false> = {
  control: (base, state) => ({
    ...base,
    borderColor: state.isFocused ? "#6B21A8" : "#D1D5DB",
    boxShadow: state.isFocused ? "#6B21A8" : "none",
    "&:hover": {
      borderColor: "#4B0082",
    },
    borderRadius: "0.5rem",
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? "#4B0082"
      : state.isFocused
      ? "#E5D2F4"
      : "white",
    color: state.isSelected ? "white" : "black",
    cursor: "pointer",
    borderRadius: "0.5rem",
    margin: "2px",
    ":active": {
      backgroundColor: state.isSelected ? "#4B0082" : "#E5D2F4",
    },
  }),
  singleValue: (base) => ({
    ...base,
    color: "#000",
  }),
};

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
      defaultOptions
      loadOptions={loadOptions}
      value={option}
      onChange={(value) => {
        setOption(value);
        onChange(value);
      }}
      getOptionLabel={(e) => e.label}
      getOptionValue={(e) => e.value}
      placeholder="Search item..."
      className="w-full"
      styles={customStyles}
      formatOptionLabel={(data, { context }) =>
        context === "menu" ? (
          <div className="flex font-medium">
            <span>{data.label} </span>
            {data.batchNo && <span> - {data.batchNo}</span>}
          </div>
        ) : (
          <span>{data.label}</span>
        )
      }
    />
  );
};

export default ItemDropdown;
