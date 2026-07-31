import { UserPlus } from 'lucide-react';

interface CareTeamHeaderProps {
  userRole?: string;
  onAddClick: () => void;
}

export function CareTeamHeader({ userRole, onAddClick }: CareTeamHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-2 mt-6 px-2">
      <h2 className="text-sm font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">Equipe de Cuidados</h2>
      {userRole === 'ADMIN' && (
        <button 
          onClick={onAddClick}
          className="flex items-center gap-1 text-sm font-bold text-[var(--color-primary)] dark:text-slate-200 hover:text-[var(--color-accent)] dark:hover:text-white transition-colors"
        >
          <UserPlus className="w-4 h-4" /> Adicionar
        </button>
      )}
    </div>
  );
}
