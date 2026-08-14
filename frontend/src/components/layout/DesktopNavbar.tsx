import { CalendarHeart, FolderHeart, User, Stethoscope, Sun, Moon, LogOut, Heart, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface DesktopNavbarProps {
  currentTab: 'agenda' | 'consultas' | 'cofre' | 'perfil';
  onChangeTab?: (tab: 'agenda' | 'consultas' | 'cofre' | 'perfil') => void;
}

export function DesktopNavbar({ currentTab, onChangeTab }: DesktopNavbarProps) {
  const { user, activePatient, logout, updateUserPreferences } = useAuth();

  const navItems = [
    { id: 'agenda', label: 'Agenda Diária', icon: CalendarHeart },
    { id: 'consultas', label: 'Consultas Médicas', icon: Stethoscope },
    { id: 'cofre', label: 'Prontuário & Cofre', icon: FolderHeart },
    { id: 'perfil', label: 'Equipe & Perfil', icon: User },
  ] as const;

  const toggleDarkMode = () => {
    updateUserPreferences({ darkMode: !user?.darkMode });
  };

  return (
    <header className="hidden md:block w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 sticky top-0 z-50 transition-colors shadow-xs">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 h-20 flex items-center justify-between gap-6">
        
        {/* Lado Esquerdo: Logo & Paciente Ativo */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onChangeTab?.('agenda')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[var(--color-primary)] to-cyan-400 flex items-center justify-center shadow-md shadow-[var(--color-primary)]/25 text-white">
              <Heart className="w-5 h-5 fill-white/20" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white block leading-none">AgendaMed</span>
              <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider block mt-0.5">Gestão de Cuidados</span>
            </div>
          </div>

          {activePatient && (
            <div className="hidden lg:flex items-center gap-2 pl-6 border-l border-slate-200 dark:border-slate-800">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950/70 text-[var(--color-primary)] dark:text-cyan-400 flex items-center justify-center font-bold text-xs">
                {activePatient.name.charAt(0)}
              </div>
              <div className="text-left">
                <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block leading-none">Paciente Ativo</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block truncate max-w-[160px] mt-0.5">
                  {activePatient.name}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Centro: Navegação Desktop */}
        <nav className="flex items-center gap-1.5 bg-slate-100/80 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200/50 dark:border-slate-700/50">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onChangeTab?.(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-white dark:bg-slate-900 text-[var(--color-primary)] dark:text-cyan-400 shadow-xs scale-100'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[var(--color-primary)] dark:text-cyan-400' : 'text-slate-400 dark:text-slate-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Lado Direito: Ações de Usuário & Dark Mode */}
        <div className="flex items-center gap-3">
          
          {/* Botão Dark Mode */}
          <button
            onClick={toggleDarkMode}
            title={user?.darkMode ? 'Modo Claro' : 'Modo Escuro'}
            aria-label="Alternar tema de cores"
            className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors border border-slate-200/50 dark:border-slate-700/50"
          >
            {user?.darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Perfil Resumido */}
          <div className="flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-slate-800">
            <div className="text-right hidden xl:block">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block leading-tight">
                {user?.name || user?.email || 'Cuidador'}
              </span>
              <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1 justify-end mt-0.5">
                <CheckCircle className="w-3 h-3" /> {user?.role === 'ADMIN' ? 'Administrador' : 'Cuidador'}
              </span>
            </div>

            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-xs border border-slate-200 dark:border-slate-700">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>

            {/* Botão de Sair */}
            <button
              onClick={logout}
              title="Sair da Conta"
              aria-label="Sair da Conta"
              className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/60 flex items-center justify-center transition-colors border border-red-100 dark:border-red-900/30 ml-1"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </header>
  );
}
