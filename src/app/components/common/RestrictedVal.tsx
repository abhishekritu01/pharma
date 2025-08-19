import React from "react";
import { toast } from "react-toastify";

export const restrictInvalidNumberKeys = (
  e: React.KeyboardEvent<HTMLInputElement>
) => {
  const allowedKeys = [
    "Backspace",
    "Tab",
    "Delete",
    "ArrowLeft",
    "ArrowRight",
    "Home",
    "End",
    ".", 
  ];

  if (!allowedKeys.includes(e.key) && !/^\d$/.test(e.key)) {
    e.preventDefault();
    toast.error("Only numbers and decimals are allowed", {
      position: "top-right",
      autoClose: 2000,
      pauseOnHover: false,
    });
  }

  if (e.key === "." && e.currentTarget.value.includes(".")) {
    e.preventDefault();
    toast.error("Only one decimal point is allowed", {
      position: "top-right",
      autoClose: 2000,
      pauseOnHover: false,
    });
  }
};

export const handleNumericChange =
  (callback: (e: React.ChangeEvent<HTMLInputElement>) => void) =>
  (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (/^\d*\.?\d*$/.test(value)) {
      callback(e);
    }
  };
