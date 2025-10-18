
import React from "react";

interface ButtonProps {
  type?: "button" | "submit" | "reset";
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  label: string;
  value?: string;
  className?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  title?: string;
}

const Button: React.FC<ButtonProps> = ({type = "button", onClick, label, className = "", icon, disabled = false, title,}) => {

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-disabled={disabled}
      title={title}
      className={`flex justify-center items-center gap-2 h-11 disabled:cursor-not-allowed border rounded-3xl border-Gray font-medium text-sm cursor-pointer ${className}`}
    >
      {icon}
      {label}
    </button>
  );
};

export default Button;

