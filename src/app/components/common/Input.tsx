import React from "react";

interface InputProps {
  type?: string;
  value: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
  icon?: React.ReactNode;
}

const Input: React.FC<InputProps> = ({
  type = "text",
  value,
  onChange,
  placeholder = "",
  className = "",
  icon,
}) => {
  return (
    <div className={`flex items-center gap-2 border rounded-lg px-4 h-11 ${className}`}>
      {icon && <span className="text-gray-500">{icon}</span>}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="flex-1 outline-none border-none bg-transparent text-sm"
      />
    </div>
  );
};

export default Input;
