import { StylesConfig, GroupBase } from "react-select";

export const customSelectStyles = <
  T extends { label: string; value: string }
>(): StylesConfig<T, false, GroupBase<T>> => ({
  control: (provided, state) => ({
    ...provided,
    width: 288, // fixed width (same as Tailwind's w-72)
    borderColor: state.isFocused ? "#4B0082" : "#D1D5DB",
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
      ? "#F3F4F6"
      : state.isFocused
      ? "#4B0082"
      : "white",
    color: state.isSelected
      ? "#111827"
      : state.isFocused
      ? "white"
      : "#111827",
    cursor: "pointer",
    borderRadius: "0.375rem",
    margin: "2px 8px",
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
    color: "#111827",
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
  }),
});
