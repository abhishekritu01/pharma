import React from "react";

const InputField: React.FC<{
  type?: string;
  id: string;
  name?: string;
  maxLength?: number;
  label: React.ReactNode;
  value?: string;
  readOnly?: boolean;
  max?: string;
  min?: string;
  disabled?: boolean;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
}> = ({
  type,
  id,
  label,
  value,
  onChange,
  maxLength,
  readOnly,
  max,
  min,
  onKeyDown,
  onBlur,
  disabled,
}) => (
  <div className="relative">
    <input
      type={type}
      id={id}
      value={value}
      onChange={onChange}
      maxLength={maxLength}
      readOnly={readOnly}
      required
      placeholder=" "
      max={max}
      min={min}
      onKeyDown={onKeyDown}
      onBlur={onBlur}
      disabled={disabled}
      className="peer w-full px-3 py-3 border border-gray-400 rounded-md bg-transparent text-black outline-none focus:border-purple-900 focus:ring-0"
      data-has-value={value ? "true" : "false"}
    />
    <label
      htmlFor={id}
      className="absolute left-3 top-0 -translate-y-1/2 bg-white px-1 text-gray-500 text-xs transition-all 
        peer-placeholder-shown:top-0 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-xs 
        peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-xs peer-focus:text-purple-950 peer-focus:px-1
        peer-[data-has-value=true]:top-0 peer-[data-has-value=true]:-translate-y-1/2 peer-[data-has-value=true]:text-xs"
    >
      {label}
    </label>
  </div>
);

export default InputField;
