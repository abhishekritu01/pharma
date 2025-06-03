import React from 'react';
import { toast } from 'react-toastify';

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
    ];

    if (!allowedKeys.includes(e.key) && !/^\d$/.test(e.key)) {
      e.preventDefault();
      toast.error("Only whole numbers are allowed", {
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
        if (/^\d*$/.test(value)) {
          callback(e);
        }
      };