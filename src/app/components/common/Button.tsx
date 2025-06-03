
import React from "react";

interface ButtonProps {
  type?: "button" | "submit" | "reset";
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  label: string;
  value?: string;
  className?: string;
  icon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({type = "button", onClick, label, className = "", icon,}) => {

  return (
    <button
      type={type}
      onClick={onClick}
      className={`flex justify-center items-center gap-2  disabled:cursor-not-allowed  border rounded-3xl border-Gray font-medium text-sm cursor-pointer ${className}`}
      // className={`flex justify-center items-center gap-2  disabled:cursor-not-allowed  border rounded-3xl border-Gray font-medium text-sm h-11 cursor-pointer ${className}`}
    >
      {icon}
      {label}
    </button>
  );
};

export default Button;

