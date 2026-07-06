interface ToggleProps {
  checked: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
}

export function Toggle({ checked, onChange, disabled = false }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => {
        if (!disabled && onChange) {
          onChange(!checked);
        }
      }}
      className={`
        relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2
        ${disabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}
        ${checked ? 'bg-[var(--color-primary)]' : 'bg-gray-200'}
      `}
    >
      <span className="sr-only">Toggle</span>
      <span
        aria-hidden="true"
        className={`
          pointer-events-none absolute left-0.5 inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-300 ease-in-out
          ${checked ? 'translate-x-5' : 'translate-x-0'}
        `}
      />
    </button>
  );
}
