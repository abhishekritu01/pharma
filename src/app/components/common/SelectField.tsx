import React from "react";
import AsyncSelect from "react-select/async";
import { StylesConfig } from "react-select";

type OptionType = {
  label: string;
  value: string;
};

interface SelectFieldProps {
  value: OptionType | null;
  onChange: (value: OptionType | null) => void;
  label: string;
  loadOptions: (inputValue: string, callback: (options: OptionType[]) => void) => void;
  isClearable?: boolean;
  isDisabled?: boolean;
}

const customStyles: StylesConfig<OptionType, false> = {
  control: (base, state) => ({
    ...base,
    height: "49px",
    padding: "0.375rem 0.75rem",
    borderRadius: "0.5rem",
    borderColor: state.isFocused ? "#6B21A8" : "#B5B3B3",
    boxShadow: state.isFocused ? "#6B21A8" : "none",
    backgroundColor: "transparent",
    "&:hover": {
      borderColor: "#4B0082",
    },
  }),
  placeholder: (base) => ({
    ...base,
    color: "#6B7280",
    fontSize: "0.875rem",
  }),
  input: (base) => ({
    ...base,
    color: "#000",
  }),
  singleValue: (base) => ({
    ...base,
    color: "#000",
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? "#4B0082"
      : state.isFocused
      ? "#E5D2F4"
      : "#fff",
    color: state.isSelected ? "#fff" : "#000",
    cursor: "pointer",
    borderRadius: "0.5rem",
    margin: "2px",
    ":active": {
      backgroundColor: state.isSelected ? "#4B0082" : "#E5D2F4",
    },
  }),
};

const SelectField: React.FC<SelectFieldProps> = ({
  value,
  onChange,
  label,
  loadOptions,
  isClearable = true,
  isDisabled = false,
}) => {
  return (
    <div className="relative w-full">
      <AsyncSelect
        cacheOptions
        loadOptions={loadOptions}
        defaultOptions={false} // disables showing options on click
        value={value}
        onChange={onChange}
        isClearable={isClearable}
        isDisabled={isDisabled}
        placeholder=" "
        styles={customStyles}
        className="w-full peer"
        getOptionLabel={(e) => e.label}
        formatOptionLabel={(data, { context }) =>
          context === "value" ? data.value : data.label
        }
      />
      <label
        className={`absolute left-3 top-0 -translate-y-1/2 bg-white px-1 text-gray-500 text-xs transition-all
          ${
            value
              ? "top-0 -translate-y-1/2 text-xs px-1 text-purple-950"
              : "peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-xs"
          }
        `}
      >
        {label}
      </label>
    </div>
  );
};

export default SelectField;
