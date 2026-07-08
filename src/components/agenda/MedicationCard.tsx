import { Clock, CheckCircle2 } from 'lucide-react';

interface MedicationCardProps {
  time: string;
  name: string;
  dosage: string;
  instructions?: string;
  frequency?: string;
  status: 'pending' | 'completed' | 'late';
  onCheck?: () => void;
}

export function MedicationCard({ time, name, dosage, instructions, frequency, status, onCheck }: MedicationCardProps) {
  const isCompleted = status === 'completed';
  const isLate = status === 'late';

  const formatFrequency = (freq?: string) => {
    if (!freq) return '';
    if (freq === '8h') return 'De 8 em 8 horas';
    if (freq === '12h') return 'De 12 em 12 horas';
    if (freq === 'daily') return '1 vez ao dia';
    if (freq === 'manual') return 'Horários manuais';
    return 'Uso único';
  };

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
        flex-1 bg-white p-6 rounded-[32px] flex items-center justify-between shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300
        ${isCompleted ? 'opacity-60' : isLate ? 'border border-red-100 shadow-[0_8px_30px_rgba(225,29,72,0.1)]' : 'border border-transparent'}
      `}>
        <div>
          <h3 className={`text-xl font-bold flex items-center gap-2 ${isCompleted ? 'text-gray-400 line-through' : 'text-[var(--color-primary)]'}`}>
            {name}
            {dosage && (
              <span className="text-xs font-bold bg-[var(--color-secondary)]/20 text-[var(--color-primary)] px-2 py-1 rounded-full whitespace-nowrap line-through-none">
                {dosage}
              </span>
            )}
          </h3>
          
          {instructions && (
            <p className="text-gray-600 font-medium text-[15px] mt-2 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]/50"></span>
              {instructions}
              {frequency && <span className="text-sm text-gray-400 ml-1">• {formatFrequency(frequency)}</span>}
            </p>
          )}

          {isLate && (
            <p className="text-[var(--color-alert)] text-sm font-bold flex items-center gap-1 mt-2">
              <Clock className="w-4 h-4" /> Atrasado
            </p>
          )}
        </div>

        {/* Botão de Check Grande (Estilo Premium) */}
        {!isCompleted && (
          <button
            onClick={onCheck}
            className="w-16 h-16 rounded-[24px] flex items-center justify-center bg-[var(--color-primary)] text-white hover:bg-[var(--color-accent)] active:scale-95 transition-all duration-300 shadow-xl shadow-[var(--color-primary)]/20 flex-shrink-0"
            aria-label="Confirmar medicação"
          >
            <CheckCircle2 className="w-8 h-8" strokeWidth={2.5} />
          </button>
        )}

        {isCompleted && (
          <div className="w-16 h-16 rounded-[24px] flex items-center justify-center bg-[var(--color-secondary)]/50 text-[var(--color-primary)] flex-shrink-0">
            <CheckCircle2 className="w-8 h-8" strokeWidth={2.5} />
          </div>
        )}
      </div>
    </div>
  );
}
