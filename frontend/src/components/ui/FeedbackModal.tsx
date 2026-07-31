import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { Button } from './Button';

export interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  onConfirm?: () => void;
  confirmText?: string;
}

export function FeedbackModal({ isOpen, onClose, title, message, type = 'info', onConfirm, confirmText = 'Confirmar' }: FeedbackModalProps) {
  if (!isOpen) return null;

  const icons = {
    success: <CheckCircle2 className="w-12 h-12 text-green-500" />,
    error: <AlertCircle className="w-12 h-12 text-red-500" />,
    warning: <AlertTriangle className="w-12 h-12 text-amber-500" />,
    info: <Info className="w-12 h-12 text-blue-500" />
  };

  const bgColors = {
    success: 'bg-green-50 dark:bg-green-900/30',
    error: 'bg-red-50 dark:bg-red-900/30',
    warning: 'bg-amber-50 dark:bg-amber-900/30',
    info: 'bg-blue-50 dark:bg-blue-900/30'
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 animate-in fade-in duration-200">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl p-6 flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className={`p-4 rounded-full ${bgColors[type]} mb-4 mt-2`}>
          {icons[type]}
        </div>
        
        <h3 className="text-xl font-bold text-gray-800 dark:text-slate-100 mb-2">{title}</h3>
        <p className="text-gray-500 dark:text-slate-400 mb-6 leading-relaxed">{message}</p>
        
        <div className="w-full flex gap-3">
          <Button onClick={onClose} variant={onConfirm ? 'outline' : 'primary'} className="flex-1">
            {onConfirm ? 'Cancelar' : 'Entendi'}
          </Button>
          {onConfirm && (
            <Button onClick={onConfirm} className="flex-1">
              {confirmText}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
