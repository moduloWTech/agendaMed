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
  
  const baseStyles = "min-h-[56px] rounded-[32px] font-bold text-lg transition-all duration-300 flex items-center justify-center px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-[var(--color-primary)] text-white hover:bg-[var(--color-accent)] active:scale-[0.98] shadow-xl shadow-[var(--color-primary)]/20",
    success: "bg-[var(--color-success)] text-white hover:opacity-90 active:scale-[0.98] shadow-lg shadow-[var(--color-success)]/20",
    alert: "bg-[var(--color-alert)] text-white hover:opacity-90 active:scale-[0.98] shadow-lg shadow-[var(--color-alert)]/20",
    outline: "bg-transparent border-2 border-gray-200 text-gray-700 hover:bg-gray-50 active:bg-gray-100",
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
