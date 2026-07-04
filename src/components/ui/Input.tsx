import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-gray-700 font-medium text-[16px] ml-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`
            w-full min-h-[52px] px-4 py-3 bg-white text-gray-900 text-lg
            border-2 rounded-xl transition-colors duration-200
            focus:outline-none focus:ring-4 focus:ring-blue-100 placeholder:text-gray-400
            ${error ? 'border-[var(--color-alert)]' : 'border-gray-200 focus:border-[var(--color-primary)]'}
            ${className}
          `}
          {...props}
        />
        {error && (
          <span className="text-[var(--color-alert)] text-sm ml-1 mt-1 font-medium">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
