import { createPortal } from 'react-dom';
import { X, MessageSquareText, Pill } from 'lucide-react';

interface RecommendationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  medicationName: string;
  dosage?: string;
  instructions: string;
}

export function RecommendationsModal({
  isOpen,
  onClose,
  medicationName,
  dosage,
  instructions,
}: RecommendationsModalProps) {
  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[32px] p-6 shadow-2xl border border-gray-100 dark:border-slate-800 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[var(--color-primary)]/10 dark:bg-[var(--color-primary)]/20 flex items-center justify-center text-[var(--color-primary)]">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100 flex items-center gap-2">
                {medicationName}
                {dosage && (
                  <span className="text-xs font-bold bg-[var(--color-secondary)]/20 text-[var(--color-primary)] dark:text-slate-200 px-2 py-0.5 rounded-full">
                    {dosage}
                  </span>
                )}
              </h3>
              <p className="text-xs text-gray-500 dark:text-slate-400">Recomendações de uso</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="py-6">
          <div className="bg-[#F8FAFC] dark:bg-slate-800/60 p-5 rounded-[24px] border border-gray-100 dark:border-slate-700/60 flex items-start gap-3.5">
            <MessageSquareText className="w-6 h-6 text-[var(--color-primary)] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1">
                Orientação do Cuidador / Médico
              </p>
              <p className="text-base text-gray-900 dark:text-slate-100 font-medium leading-relaxed">
                {instructions || 'Nenhuma recomendação adicional cadastrada.'}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <button
          onClick={onClose}
          className="w-full py-3.5 px-6 rounded-2xl bg-[var(--color-primary)] text-white font-bold hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-[var(--color-primary)]/20 text-center"
        >
          Entendi
        </button>
      </div>
    </div>,
    document.body
  );
}
