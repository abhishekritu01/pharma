import React from 'react';

interface ButtonProps {
    text: string;
    onClick: () => void;
    className?: string;
    type?: 'button' | 'submit' | 'reset';
    disabled?: boolean;
    children?: React.ReactNode;
    }

const Button = ({ text, onClick, className = '', type = 'button', disabled = false, children }: ButtonProps) => {   
  return (
    <button
      type={type}
      onClick={onClick}
      className={`flex items-center p-1 disabled:cursor-not-allowed ${className}`}
      disabled={disabled}
    >
      {children}
      <span>{text}</span>
    </button>
  );
};

export default Button;
