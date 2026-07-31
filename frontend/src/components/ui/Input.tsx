import React, { forwardRef, useId } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-gray-700 dark:text-slate-300 font-medium text-[16px] ml-1">
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={`
            w-full min-h-[56px] px-6 py-3 bg-[#F8FAFC] dark:bg-slate-800 text-gray-900 dark:text-slate-100 text-lg
            border-2 rounded-[24px] transition-all duration-300
            focus:outline-none focus:ring-4 focus:ring-[var(--color-secondary)] placeholder:text-gray-400 dark:placeholder:text-slate-500
            ${error ? 'border-[var(--color-alert)]' : 'border-transparent focus:border-[var(--color-primary)] dark:focus:border-slate-500 hover:border-gray-200 dark:hover:border-slate-700'}
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
