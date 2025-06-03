import React from 'react';

const TextareaField: React.FC<{
  id: string;
  name?: string;
  label: string;
  value: string;
  rows?: number;
  cols?: number;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}> = ({ id, name, label, value, onChange, rows, cols }) => (
  <div className="relative w-full">
    <textarea
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      placeholder=" "
      required
      rows={rows}
      cols={cols}
      className="peer w-full px-3 py-3 border border-gray-400 rounded-md bg-transparent text-black outline-none focus:border-purple-900 focus:ring-0 resize-none"
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

export default TextareaField;
