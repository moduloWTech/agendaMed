import { Clock, CheckCircle2 } from 'lucide-react';

interface MedicationCardProps {
  time: string;
  name: string;
  dosage: string;
  status: 'pending' | 'completed' | 'late';
  onCheck?: () => void;
}

export function MedicationCard({ time, name, dosage, status, onCheck }: MedicationCardProps) {
  const isCompleted = status === 'completed';
  const isLate = status === 'late';

  return (
    <div className="flex gap-4 items-start relative w-full mb-6">

      {/* Linha do Tempo Visual */}
      <div className="flex flex-col items-center mt-1">
        <div className={`
          flex items-center justify-center rounded-full w-14 h-14 font-bold text-lg shadow-sm border-2
          ${isCompleted ? 'bg-[var(--color-success)] text-white border-[var(--color-success)]'
            : isLate ? 'bg-red-50 text-[var(--color-alert)] border-red-200'
              : 'bg-blue-50 text-[var(--color-primary)] border-blue-100'}
        `}>
          {time}
        </div>
        <div className="w-0.5 h-full bg-gray-200 mt-2 absolute top-14 bottom-[-24px] left-7 -translate-x-1/2 -z-10 rounded-full"></div>
      </div>

      {/* Card do Medicamento */}
      <div className={`
        flex-1 bg-white p-5 rounded-2xl border flex items-center justify-between shadow-sm transition-all
        ${isCompleted ? 'border-green-100 opacity-75' : isLate ? 'border-red-200 shadow-red-100/50' : 'border-gray-100'}
      `}>
        <div>
          <h3 className={`text-xl font-bold ${isCompleted ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
            {name}
          </h3>
          <p className="text-gray-500 font-medium text-md mt-1">{dosage}</p>

          {isLate && (
            <p className="text-[var(--color-alert)] text-sm font-semibold flex items-center gap-1 mt-2">
              <Clock className="w-4 h-4" /> Atrasado
            </p>
          )}
        </div>

        {/* Botão de Check Grande */}
        {!isCompleted && (
          <button
            onClick={onCheck}
            className="w-16 h-16 rounded-full flex items-center justify-center bg-[var(--color-success)] text-white hover:bg-emerald-600 active:scale-95 transition-transform shadow-md flex-shrink-0"
            aria-label="Confirmar medicação"
          >
            <CheckCircle2 className="w-10 h-10" />
          </button>
        )}

        {isCompleted && (
          <div className="w-16 h-16 rounded-full flex items-center justify-center bg-green-50 text-[var(--color-success)] flex-shrink-0">
            <CheckCircle2 className="w-10 h-10" />
          </div>
        )}
      </div>
    </div>
  );
}
