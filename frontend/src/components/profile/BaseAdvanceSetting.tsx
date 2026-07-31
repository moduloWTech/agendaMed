interface BaseAdvanceSettingProps {
  value: string;
  onChange: (value: string) => void;
}

export function BaseAdvanceSetting({ value, onChange }: BaseAdvanceSettingProps) {
  return (
    <div className="flex flex-col gap-2 px-1">
      <label className="text-gray-700 dark:text-slate-300 font-medium text-[15px]">Antecedência Base</label>
      <select 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#F8FAFC] dark:bg-slate-900 border-2 border-transparent hover:border-gray-200 dark:hover:border-slate-700 focus:border-[var(--color-primary)] dark:focus:border-slate-500 rounded-[20px] px-4 py-3 text-gray-800 dark:text-slate-200 text-base outline-none transition-all cursor-pointer"
      >
        <option value="1h">1 hora antes</option>
        <option value="24h">24 horas antes</option>
        <option value="48h">48 horas antes</option>
      </select>
    </div>
  );
}
