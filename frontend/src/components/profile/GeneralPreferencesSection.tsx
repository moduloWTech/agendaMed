import {
  // Calendar, 
  Moon
} from 'lucide-react';
import { Toggle } from '../ui/Toggle';

interface GeneralPreferencesSectionProps {
  syncGoogle: boolean;
  setSyncGoogle: (val: boolean) => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

export function GeneralPreferencesSection({
  // syncGoogle,
  // setSyncGoogle,
  darkMode,
  setDarkMode
}: GeneralPreferencesSectionProps) {
  return (
    <section className="flex flex-col gap-4">
      <h3 className="text-sm font-bold text-gray-400 dark:text-slate-400 uppercase tracking-wider px-1">Gerais</h3>

      {/* esta feature será implementada mais tarde */}
      {/* <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-4 rounded-[20px] shadow-sm border border-gray-100 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-50 dark:bg-purple-900/30 text-purple-500 dark:text-purple-400 rounded-xl">
            <Calendar className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-gray-800 dark:text-slate-100">Sincronizar Agenda</span>
            <span className="text-[11px] text-gray-400 dark:text-slate-400">Google ou Apple Calendar</span>
          </div>
        </div>
        <Toggle checked={syncGoogle} onChange={setSyncGoogle} />
      </div> */}

      <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-4 rounded-[20px] shadow-sm border border-gray-100 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-50 dark:bg-slate-700 text-gray-600 dark:text-slate-300 rounded-xl">
            <Moon className="w-5 h-5" />
          </div>
          <span className="font-semibold text-gray-800 dark:text-slate-100">Modo Escuro</span>
        </div>
        <Toggle checked={darkMode} onChange={setDarkMode} />
      </div>
    </section>
  );
}
