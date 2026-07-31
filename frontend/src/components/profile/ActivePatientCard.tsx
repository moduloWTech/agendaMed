import { User } from 'lucide-react';

interface ActivePatientCardProps {
  activePatient: any;
  userRole?: string;
  onEditClick: (currentName: string) => void;
}

export function ActivePatientCard({ activePatient, userRole, onEditClick }: ActivePatientCardProps) {
  return (
    <div className="flex items-center justify-between bg-white px-4 py-4 rounded-2xl shadow-sm border border-gray-100 mb-2">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-[var(--color-primary)]/10 rounded-xl text-[var(--color-primary)]">
          <User className="w-6 h-6" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-gray-800">{activePatient?.name || 'Carregando...'}</span>
          <span className="text-sm text-gray-500">Paciente Ativo</span>
        </div>
      </div>
      {userRole === 'ADMIN' && activePatient && (
        <button
          onClick={() => onEditClick(activePatient.name)}
          className="text-sm font-bold text-[var(--color-primary)] px-3 py-1 bg-[var(--color-primary)]/10 rounded-full hover:bg-[var(--color-primary)]/20 transition-colors"
        >
          Editar
        </button>
      )}
    </div>
  );
}
