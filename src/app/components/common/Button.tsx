// import React from 'react';

// interface ButtonProps {
//     text: string;
//     onClick: () => void;
//     className?: string;
//     type?: 'button' | 'submit' | 'reset';
//     disabled?: boolean;
//     children?: React.ReactNode;
//     }

// const Button = ({ text, onClick, className = '', type = 'button', disabled = false, children }: ButtonProps) => {   
//   return (
//     <button
//       type={type}
//       onClick={onClick}
//       className={`flex items-center p-1 disabled:cursor-not-allowed border-l ${className}`}
//       disabled={disabled}
//     >
//       {children}
//       <span>{text}</span>
//     </button>
//   );
// };

// export default Button;




import React from "react";

interface ButtonProps {
  type?: "button" | "submit" | "reset";
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  label: string;
  value: string;
  className?: string;
  icon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({type = "button", onClick, label, value, className = "", icon,}) => {

  return (
    <button
      type={type}
      onClick={onClick}
      className={`flex justify-center items-center gap-2  disabled:cursor-not-allowed  border rounded-3xl border-Gray font-medium text-sm h-11 cursor-pointer ${className}`}
    >
      {icon}
      {label}
    </button>
  );
};

export default Button;

