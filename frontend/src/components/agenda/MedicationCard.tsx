import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Clock, CheckCircle2, X } from 'lucide-react';

interface MedicationCardProps {
  time: string;
  name: string;
  dosage: string;
  instructions?: string;
  frequency?: string;
  photoUrl?: string;
  status: 'pending' | 'completed' | 'late';
  onCheck?: () => void;
  onCardClick?: () => void;
}

export function MedicationCard({ time, name, dosage, instructions, frequency, photoUrl, status, onCheck, onCardClick }: MedicationCardProps) {
  const [isPhotoOpen, setIsPhotoOpen] = useState(false);
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

  const handlePhotoClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPhotoOpen(true);
  };

  return (
    <>
      <div className="flex gap-4 items-start relative w-full mb-6">

        {/* Linha do Tempo Visual */}
        <div className="flex flex-col items-center mt-1">
          <div className={`
            flex items-center justify-center rounded-full w-14 h-14 font-bold text-lg shadow-sm border-2
            ${isCompleted ? 'bg-[var(--color-success)] text-white border-[var(--color-success)]'
              : isLate ? 'bg-red-50 dark:bg-red-900/30 text-[var(--color-alert)] border-red-200 dark:border-red-800/50'
                : 'bg-blue-50 dark:bg-blue-900/30 text-[var(--color-primary)] dark:text-blue-400 border-blue-100 dark:border-blue-800/50'}
          `}>
            {time}
          </div>
          <div className="w-0.5 h-full bg-gray-200 dark:bg-slate-700 mt-2 absolute top-14 bottom-[-24px] left-7 -translate-x-1/2 -z-10 rounded-full"></div>
        </div>

        {/* Card do Medicamento */}
        <div 
          onClick={onCardClick}
          className={`
          flex-1 bg-white dark:bg-slate-800 p-5 rounded-[32px] flex items-center justify-between shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300
          ${onCardClick ? 'cursor-pointer hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]' : ''}
          ${isCompleted ? 'opacity-60' : isLate ? 'border border-red-100 dark:border-red-900/50 shadow-[0_8px_30px_rgba(225,29,72,0.1)]' : 'border border-transparent dark:border-slate-700'}
        `}>
          <div className="flex gap-3 sm:gap-4 items-center">
            {photoUrl && (
              <div 
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-[20px] overflow-hidden flex-shrink-0 cursor-pointer shadow-sm border border-gray-100 dark:border-slate-700 hover:opacity-90 transition-opacity"
                onClick={handlePhotoClick}
              >
                <img src={photoUrl} alt={name} className="w-full h-full object-cover" />
              </div>
            )}
            <div>
              <h3 className={`text-[19px] sm:text-xl font-bold flex items-center flex-wrap gap-2 ${isCompleted ? 'text-gray-400 dark:text-slate-500 line-through' : 'text-[var(--color-primary)] dark:text-slate-100'}`}>
                {name}
                {dosage && (
                  <span className="text-[11px] sm:text-xs font-bold bg-[var(--color-secondary)]/20 dark:bg-slate-700 text-[var(--color-primary)] dark:text-slate-200 px-2 py-1 rounded-full whitespace-nowrap line-through-none">
                    {dosage}
                  </span>
                )}
              </h3>
              
              {instructions && (
                <p className="text-gray-600 dark:text-slate-300 font-medium text-[14px] sm:text-[15px] mt-1 flex items-center gap-1.5 flex-wrap">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]/50 dark:bg-slate-500 flex-shrink-0"></span>
                  {instructions}
                  {frequency && <span className="text-[13px] sm:text-sm text-gray-400 dark:text-slate-400 ml-1 whitespace-nowrap">• {formatFrequency(frequency)}</span>}
                </p>
              )}

              {isLate && (
                <p className="text-[var(--color-alert)] text-sm font-bold flex items-center gap-1 mt-1.5">
                  <Clock className="w-4 h-4" /> Atrasado
                </p>
              )}
            </div>
          </div>

          {/* Botão de Check Grande (Estilo Premium) */}
          {!isCompleted && (
            <button
              onClick={(e) => { e.stopPropagation(); onCheck?.(); }}
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-[20px] sm:rounded-[22px] flex items-center justify-center bg-[var(--color-primary)] text-white hover:bg-[var(--color-accent)] active:scale-95 transition-all duration-300 shadow-xl shadow-[var(--color-primary)]/20 flex-shrink-0 ml-2 sm:ml-3"
              aria-label="Confirmar medicação"
            >
              <CheckCircle2 className="w-6 h-6 sm:w-7 sm:h-7" strokeWidth={2.5} />
            </button>
          )}

          {isCompleted && (
            <button
              onClick={(e) => { e.stopPropagation(); onCheck?.(); }}
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-[20px] sm:rounded-[22px] flex items-center justify-center bg-[var(--color-secondary)]/50 text-[var(--color-primary)] hover:bg-[var(--color-secondary)] active:scale-95 transition-all duration-300 flex-shrink-0 ml-2 sm:ml-3"
              aria-label="Desfazer medicação"
            >
              <CheckCircle2 className="w-6 h-6 sm:w-7 sm:h-7" strokeWidth={2.5} />
            </button>
          )}
        </div>
      </div>

      {/* Modal Fullscreen da Imagem */}
      {isPhotoOpen && photoUrl && createPortal(
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-300"
          onClick={() => setIsPhotoOpen(false)}
        >
          <button 
            className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
            onClick={() => setIsPhotoOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>
          <img 
            src={photoUrl} 
            alt={name} 
            className="w-full max-w-lg max-h-[85vh] object-contain rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()} 
          />
        </div>,
        document.body
      )}
    </>
  );
}
