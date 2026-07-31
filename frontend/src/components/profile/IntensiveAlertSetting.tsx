import { CalendarHeart } from 'lucide-react';
import { Toggle } from '../ui/Toggle';

interface IntensiveAlertSettingProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function IntensiveAlertSetting({ checked, onChange }: IntensiveAlertSettingProps) {
  return (
    <div className="flex items-center justify-between bg-white p-4 rounded-[20px] shadow-sm border border-gray-100">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-red-50 text-red-500 rounded-xl">
          <CalendarHeart className="w-5 h-5" />
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-gray-800">Alerta Intensivo Padrão</span>
          <span className="text-[11px] text-gray-400 leading-tight">Sugere avisos progressivos em todas novas consultas</span>
        </div>
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}
