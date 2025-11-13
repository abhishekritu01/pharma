import { StylesConfig, GroupBase } from "react-select";

export const dropdown = <
  T extends { label: string; value: string }
>(): StylesConfig<T, false, GroupBase<T>> => ({
  control: (provided, state) => ({
    ...provided,
    width: 288,
    height: 50,
    borderColor: state.isFocused ? "#4B0082" : "#9CA3AF",
    boxShadow: "none",
    borderRadius: "0.5rem",
    "&:hover": {
      borderColor: "#4B0082",
    },
    backgroundColor: "white",
  }),

  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? "#4B0082" // selected option bg
      : state.isFocused
      ? "#4B0082" // hover bg
      : "white",
    color: state.isSelected || state.isFocused ? "white" : "#111827",
    cursor: "pointer",
    borderRadius: "0.375rem",
    padding: "8px 12px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    "&:active": {
      backgroundColor: "#4B0082",
      color: "white",
    },
  }),

  singleValue: (provided) => ({
    ...provided,
    color: "#111827", // keep control text black
    fontWeight: 500,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  }),

  dropdownIndicator: (provided) => ({
    ...provided,
    color: "#6B7280",
    "&:hover": {
      color: "#6B7280",
    },
  }),

  indicatorSeparator: () => ({
    display: "none",
  }),

  menu: (provided) => ({
    ...provided,
    zIndex: 20,
    width: 288,
    borderRadius: "0.5rem",
    overflowX: "hidden",
    marginTop: "4px",
  }),

  menuList: (provided) => ({
    ...provided,
    padding: 0,
    overflowX: "hidden",
  }),
});
