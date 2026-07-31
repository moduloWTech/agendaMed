import { User } from 'lucide-react';

interface Caregiver {
  id: string;
  name: string;
  phoneWhats?: string;
  role: string;
}

interface CaregiversListProps {
  caregivers: Caregiver[];
  currentUserId?: string;
  currentUserRole?: string;
  onToggleRole: (targetId: string, currentRole: string) => void;
}

export function CaregiversList({ caregivers, currentUserId, currentUserRole, onToggleRole }: CaregiversListProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden mb-2">
      {(caregivers || []).map((cg, idx) => (
        <div key={cg.id} className={`flex items-center justify-between px-4 py-3 ${idx !== (caregivers || []).length - 1 ? 'border-b border-gray-50 dark:border-slate-700' : ''}`}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-gray-500 dark:text-slate-300">
              <User className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-gray-800 dark:text-slate-100 text-sm">{cg.name || 'Sem nome'} {cg.id === currentUserId ? '(Você)' : ''}</span>
              <span className="text-xs text-gray-400 dark:text-slate-400">{cg.phoneWhats?.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')} • {cg.role === 'ADMIN' ? 'Administrador' : 'Cuidador'}</span>
            </div>
          </div>
          {currentUserRole === 'ADMIN' && cg.id !== currentUserId && (
            <button
              onClick={() => onToggleRole(cg.id, cg.role)}
              className={`text-xs font-bold px-3 py-1 rounded-full transition-colors ${
                cg.role === 'ADMIN' 
                  ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50' 
                  : 'bg-[var(--color-primary)]/10 dark:bg-slate-700 text-[var(--color-primary)] dark:text-slate-200 hover:bg-[var(--color-primary)]/20 dark:hover:bg-slate-600'
              }`}
            >
              {cg.role === 'ADMIN' ? 'Remover Admin' : 'Tornar Admin'}
            </button>
          )}
        </div>
      ))}
      {(!caregivers || caregivers.length === 0) && (
        <div className="px-4 py-3 text-sm text-gray-400 dark:text-slate-500 text-center">Nenhum cuidador encontrado.</div>
      )}
    </div>
  );
}
