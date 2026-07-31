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
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-2">
      {(caregivers || []).map((cg, idx) => (
        <div key={cg.id} className={`flex items-center justify-between px-4 py-3 ${idx !== (caregivers || []).length - 1 ? 'border-b border-gray-50' : ''}`}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
              <User className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-gray-800 text-sm">{cg.name || 'Sem nome'} {cg.id === currentUserId ? '(Você)' : ''}</span>
              <span className="text-xs text-gray-400">{cg.phoneWhats?.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')} • {cg.role === 'ADMIN' ? 'Administrador' : 'Cuidador'}</span>
            </div>
          </div>
          {currentUserRole === 'ADMIN' && cg.id !== currentUserId && (
            <button
              onClick={() => onToggleRole(cg.id, cg.role)}
              className={`text-xs font-bold px-3 py-1 rounded-full transition-colors ${
                cg.role === 'ADMIN' 
                  ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                  : 'bg-[var(--color-primary)]/10 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/20'
              }`}
            >
              {cg.role === 'ADMIN' ? 'Remover Admin' : 'Tornar Admin'}
            </button>
          )}
        </div>
      ))}
      {(!caregivers || caregivers.length === 0) && (
        <div className="px-4 py-3 text-sm text-gray-400 text-center">Nenhum cuidador encontrado.</div>
      )}
    </div>
  );
}
