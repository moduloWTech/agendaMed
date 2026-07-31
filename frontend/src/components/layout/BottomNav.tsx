import { CalendarHeart, FolderHeart, User, Stethoscope } from 'lucide-react';
import { usePwaUpdate } from '../../contexts/PwaUpdateContext';

interface BottomNavProps {
  currentTab?: 'agenda' | 'consultas' | 'cofre' | 'perfil';
  onChangeTab?: (tab: 'agenda' | 'consultas' | 'cofre' | 'perfil') => void;
}

export function BottomNav({ currentTab = 'agenda', onChangeTab }: BottomNavProps) {
  const { needRefresh } = usePwaUpdate();

  return (
    <div className="fixed bottom-0 left-0 right-0 w-full bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 shadow-[0_-4px_10px_rgba(0,0,0,0.02)] z-40 pb-safe">
      <nav className="flex justify-between items-center max-w-md mx-auto px-6 h-20">

        <button 
          onClick={() => onChangeTab?.('agenda')}
          className="flex flex-col items-center justify-center min-h-[48px] min-w-[48px] gap-1 group w-20"
        >
          <CalendarHeart
            className={`w-7 h-7 transition-colors ${currentTab === 'agenda' ? 'text-[var(--color-primary)] dark:text-slate-200' : 'text-gray-400 dark:text-slate-500 group-hover:text-gray-600 dark:group-hover:text-slate-400'}`}
            strokeWidth={currentTab === 'agenda' ? 2.5 : 2}
          />
          <span className={`text-[11px] font-semibold mt-1 transition-colors ${currentTab === 'agenda' ? 'text-[var(--color-primary)] dark:text-slate-200' : 'text-gray-400 dark:text-slate-500'}`}>
            Agenda
          </span>
        </button>

        <button 
          onClick={() => onChangeTab?.('consultas')}
          className="flex flex-col items-center justify-center min-h-[48px] min-w-[48px] gap-1 group w-20"
        >
          <Stethoscope
            className={`w-7 h-7 transition-colors ${currentTab === 'consultas' ? 'text-[var(--color-primary)] dark:text-slate-200' : 'text-gray-400 dark:text-slate-500 group-hover:text-gray-600 dark:group-hover:text-slate-400'}`}
            strokeWidth={currentTab === 'consultas' ? 2.5 : 2}
          />
          <span className={`text-[11px] font-semibold mt-1 transition-colors ${currentTab === 'consultas' ? 'text-[var(--color-primary)] dark:text-slate-200' : 'text-gray-400 dark:text-slate-500'}`}>
            Consultas
          </span>
        </button>

        <button 
          onClick={() => onChangeTab?.('cofre')}
          className="flex flex-col items-center justify-center min-h-[48px] min-w-[48px] gap-1 group w-20"
        >
          <FolderHeart
            className={`w-7 h-7 transition-colors ${currentTab === 'cofre' ? 'text-[var(--color-primary)] dark:text-slate-200' : 'text-gray-400 dark:text-slate-500 group-hover:text-gray-600 dark:group-hover:text-slate-400'}`}
            strokeWidth={currentTab === 'cofre' ? 2.5 : 2}
          />
          <span className={`text-[11px] font-semibold mt-1 transition-colors ${currentTab === 'cofre' ? 'text-[var(--color-primary)] dark:text-slate-200' : 'text-gray-400 dark:text-slate-500'}`}>
            Prontuário
          </span>
        </button>

        <button 
          onClick={() => onChangeTab?.('perfil')}
          className="flex flex-col items-center justify-center min-h-[48px] min-w-[48px] gap-1 group w-20 relative"
        >
          <div className="relative">
            <User
              className={`w-7 h-7 transition-colors ${currentTab === 'perfil' ? 'text-[var(--color-primary)] dark:text-slate-200' : 'text-gray-400 dark:text-slate-500 group-hover:text-gray-600 dark:group-hover:text-slate-400'}`}
              strokeWidth={currentTab === 'perfil' ? 2.5 : 2}
            />
            {needRefresh && (
              <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900 shadow-sm" />
            )}
          </div>
          <span className={`text-[11px] font-semibold mt-1 transition-colors ${currentTab === 'perfil' ? 'text-[var(--color-primary)] dark:text-slate-200' : 'text-gray-400 dark:text-slate-500'}`}>
            Perfil
          </span>
        </button>

      </nav>
    </div>
  );
}
