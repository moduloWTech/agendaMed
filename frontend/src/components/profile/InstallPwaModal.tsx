import { X, Share, PlusSquare } from 'lucide-react';

interface InstallPwaModalProps {
  onClose: () => void;
}

export function InstallPwaModal({ onClose }: InstallPwaModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-[32px] w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95 duration-300">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-gray-100 text-gray-500 rounded-full hover:bg-gray-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center mt-4">
          <div className="w-16 h-16 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-2xl flex items-center justify-center mb-4">
            <Share className="w-8 h-8" />
          </div>

          <h3 className="text-xl font-extrabold text-gray-800 mb-2">Instale o AgendaMed</h3>
          <p className="text-gray-500 text-sm mb-6">
            Instale nosso aplicativo no seu iPhone para ter uma experiência completa e receber Notificações Push!
          </p>

          <div className="bg-gray-50 rounded-2xl p-4 w-full mb-6 border border-gray-100 text-left">
            <ol className="flex flex-col gap-4 text-sm text-gray-700">
              <li className="flex gap-3 items-start">
                <span className="font-bold text-[var(--color-primary)]">1.</span>
                <span>Toque no botão <span className="font-bold">Compartilhar</span> na barra inferior do Safari.</span>
                <Share className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
              </li>
              <li className="flex gap-3 items-start">
                <span className="font-bold text-[var(--color-primary)]">2.</span>
                <span>Role para baixo e selecione <br /><span className="font-bold">Adicionar à Tela de Início</span>.</span>
                <PlusSquare className="w-4 h-4 text-gray-800 flex-shrink-0 mt-0.5" />
              </li>
              <li className="flex gap-3 items-start">
                <span className="font-bold text-[var(--color-primary)]">3.</span>
                <span>Confirme tocando em <span className="font-bold">Adicionar</span> no canto superior direito.</span>
              </li>
            </ol>
          </div>

          <button
            className="w-full py-4 bg-[var(--color-primary)] text-white font-bold rounded-2xl shadow-lg shadow-[var(--color-primary)]/30 hover:bg-[var(--color-accent)] transition-all"
            onClick={onClose}
          >
            Entendi
          </button>
        </div>
      </div>
    </div>
  );
}
