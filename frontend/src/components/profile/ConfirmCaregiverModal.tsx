import { useState } from 'react';
import { Trash2, ShieldAlert, Loader2 } from 'lucide-react';

interface ConfirmCaregiverModalProps {
  type: 'REMOVE' | 'TOGGLE_ROLE';
  caregiverName: string;
  currentRole?: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export function ConfirmCaregiverModal({
  type,
  caregiverName,
  currentRole,
  onClose,
  onConfirm,
}: ConfirmCaregiverModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
      onClose();
    } catch (e) {
      setIsLoading(false);
    }
  };

  const isRemove = type === 'REMOVE';
  const isGrantingAdmin = type === 'TOGGLE_ROLE' && currentRole !== 'ADMIN';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      {/* Overlay Escuro com Blur */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !isLoading && onClose()} />

      {/* Container do Modal */}
      <div className="relative bg-white dark:bg-slate-900 rounded-[32px] w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95 duration-300 text-center">
        
        {/* Ícone */}
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
          isRemove 
            ? 'bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400' 
            : isGrantingAdmin 
              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
              : 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
        }`}>
          {isRemove ? <Trash2 className="w-8 h-8" /> : <ShieldAlert className="w-8 h-8" />}
        </div>

        {/* Título */}
        <h3 className="text-xl font-bold text-gray-800 dark:text-slate-100 mb-2">
          {isRemove 
            ? 'Remover Cuidador' 
            : isGrantingAdmin 
              ? 'Promover a Administrador' 
              : 'Remover Permissão de Admin'
          }
        </h3>

        {/* Mensagem Explicativa */}
        <p className="text-xs text-gray-500 dark:text-slate-400 mb-6 leading-relaxed">
          {isRemove ? (
            <>
              Tem certeza que deseja remover <strong className="text-gray-800 dark:text-slate-200">{caregiverName}</strong> da equipe? Esta pessoa perderá o acesso aos dados do paciente.
            </>
          ) : isGrantingAdmin ? (
            <>
              Deseja conceder permissões de <strong className="text-gray-800 dark:text-slate-200">Administrador</strong> para <strong className="text-gray-800 dark:text-slate-200">{caregiverName}</strong>?
            </>
          ) : (
            <>
              Deseja alterar o acesso de <strong className="text-gray-800 dark:text-slate-200">{caregiverName}</strong> para apenas <strong className="text-gray-800 dark:text-slate-200">Cuidador</strong>?
            </>
          )}
        </p>

        {/* Botões de Ação */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 py-3.5 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 font-bold rounded-2xl hover:bg-gray-200 dark:hover:bg-slate-700 transition-all text-xs"
          >
            Cancelar
          </button>

          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className={`flex-[1.5] flex items-center justify-center gap-2 py-3.5 text-white font-bold rounded-2xl shadow-lg transition-all text-xs active:scale-95 disabled:opacity-50 ${
              isRemove
                ? 'bg-red-600 hover:bg-red-700 shadow-red-600/30'
                : isGrantingAdmin
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30'
                  : 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/30'
            }`}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isRemove ? (
              'Sim, Remover'
            ) : isGrantingAdmin ? (
              'Sim, Promover'
            ) : (
              'Sim, Alterar'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
