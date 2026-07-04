import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'success' | 'alert' | 'outline';
  fullWidth?: boolean;
}

export function Button({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  className = '', 
  ...props 
}: ButtonProps) {
  
  const baseStyles = "min-h-[48px] rounded-xl font-semibold text-lg transition-all duration-200 flex items-center justify-center px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-[var(--color-primary)] text-white hover:opacity-90 active:scale-[0.98] shadow-sm",
    success: "bg-[var(--color-success)] text-white hover:opacity-90 active:scale-[0.98] shadow-sm",
    alert: "bg-[var(--color-alert)] text-white hover:opacity-90 active:scale-[0.98] shadow-sm",
    outline: "bg-transparent border-2 border-gray-300 text-gray-700 hover:bg-gray-50 active:bg-gray-100",
  };

  const widthStyle = fullWidth ? "w-full" : "w-auto";

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${widthStyle} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
