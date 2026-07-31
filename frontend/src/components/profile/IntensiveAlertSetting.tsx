import { CalendarHeart } from 'lucide-react';
import { Toggle } from '../ui/Toggle';

interface IntensiveAlertSettingProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function IntensiveAlertSetting({ checked, onChange }: IntensiveAlertSettingProps) {
  return (
    <div className="flex items-start justify-between bg-white dark:bg-slate-800 p-5 rounded-[24px] shadow-sm border border-gray-100 dark:border-slate-700 gap-4">
      <div className="flex items-start gap-4 flex-1">
        <div className="p-2.5 bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400 rounded-[14px] shrink-0">
          <CalendarHeart className="w-5 h-5" />
        </div>
        <div className="flex flex-col gap-1 mt-0.5">
          <span className="font-bold text-gray-800 dark:text-slate-100 text-[15px]">Alerta Intensivo Padrão</span>
          <span className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed pr-2">
            Sugere avisos progressivos em todas as novas consultas
          </span>
        </div>
      </div>
      <div className="shrink-0 mt-1">
        <Toggle checked={checked} onChange={onChange} />
      </div>
    </div>
  );
}
