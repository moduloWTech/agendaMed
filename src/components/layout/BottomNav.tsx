import { CalendarHeart, FolderHeart, User } from 'lucide-react';

interface BottomNavProps {
  currentTab?: 'agenda' | 'cofre' | 'perfil';
}

export function BottomNav({ currentTab = 'agenda' }: BottomNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 w-full bg-white border-t border-gray-200 shadow-[0_-4px_10px_rgba(0,0,0,0.02)] z-50 pb-safe">
      <nav className="flex justify-between items-center max-w-md mx-auto px-6 h-20">

        <button className="flex flex-col items-center justify-center min-h-[48px] min-w-[48px] gap-1 group w-20">
          <CalendarHeart
            className={`w-7 h-7 transition-colors ${currentTab === 'agenda' ? 'text-[var(--color-primary)]' : 'text-gray-400 group-hover:text-gray-600'}`}
            strokeWidth={currentTab === 'agenda' ? 2.5 : 2}
          />
          <span className={`text-[11px] font-semibold mt-1 transition-colors ${currentTab === 'agenda' ? 'text-[var(--color-primary)]' : 'text-gray-400'}`}>
            Agenda
          </span>
        </button>

        <button className="flex flex-col items-center justify-center min-h-[48px] min-w-[48px] gap-1 group w-20">
          <FolderHeart
            className={`w-7 h-7 transition-colors ${currentTab === 'cofre' ? 'text-[var(--color-primary)]' : 'text-gray-400 group-hover:text-gray-600'}`}
            strokeWidth={currentTab === 'cofre' ? 2.5 : 2}
          />
          <span className={`text-[11px] font-semibold mt-1 transition-colors ${currentTab === 'cofre' ? 'text-[var(--color-primary)]' : 'text-gray-400'}`}>
            Prontuário
          </span>
        </button>

        <button className="flex flex-col items-center justify-center min-h-[48px] min-w-[48px] gap-1 group w-20">
          <User
            className={`w-7 h-7 transition-colors ${currentTab === 'perfil' ? 'text-[var(--color-primary)]' : 'text-gray-400 group-hover:text-gray-600'}`}
            strokeWidth={currentTab === 'perfil' ? 2.5 : 2}
          />
          <span className={`text-[11px] font-semibold mt-1 transition-colors ${currentTab === 'perfil' ? 'text-[var(--color-primary)]' : 'text-gray-400'}`}>
            Perfil
          </span>
        </button>

      </nav>
    </div>
  );
}
