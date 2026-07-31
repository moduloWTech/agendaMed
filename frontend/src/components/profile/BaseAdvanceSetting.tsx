export function BaseAdvanceSetting() {
  return (
    <div className="flex flex-col gap-2 px-1">
      <label className="text-gray-700 font-medium text-[15px]">Antecedência Base</label>
      <select className="w-full bg-[#F8FAFC] border-2 border-transparent hover:border-gray-200 focus:border-[var(--color-primary)] rounded-[20px] px-4 py-3 text-gray-800 text-base outline-none transition-all cursor-pointer">
        <option value="1h">1 hora antes</option>
        <option value="24h">24 horas antes</option>
        <option value="48h">48 horas antes</option>
      </select>
    </div>
  );
}
