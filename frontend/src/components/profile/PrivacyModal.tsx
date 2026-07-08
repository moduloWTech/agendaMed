import { useState } from 'react';
import { X, Fingerprint, ShieldAlert } from 'lucide-react';
import { Toggle } from '../ui/Toggle';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface PrivacyModalProps {
  onClose: () => void;
}

export function PrivacyModal({ onClose }: PrivacyModalProps) {
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 animate-in fade-in duration-300">
      
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Container */}
      <div className="relative w-full max-w-sm bg-white/95 backdrop-blur-xl rounded-[32px] shadow-2xl p-6 sm:p-8 border border-white flex flex-col gap-6 animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-2xl font-bold text-[var(--color-primary)]">Privacidade</h2>
          <button 
            onClick={onClose}
            className="p-2 bg-gray-100 rounded-full text-gray-500 hover:text-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col gap-6 overflow-y-auto max-h-[65vh] custom-scrollbar pb-2 pr-1">
          
          {/* Seção: Alterar Senha */}
          <section className="flex flex-col gap-3">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider px-1">Alterar Senha</h3>
            <Input 
              type="password"
              placeholder="Senha atual"
            />
            <Input 
              type="password"
              placeholder="Nova senha"
            />
            <Input 
              type="password"
              placeholder="Confirmar nova senha"
            />
          </section>

          {/* Seção: Segurança Avançada */}
          <section className="flex flex-col gap-3">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider px-1 mt-2">Segurança</h3>
            
            <div className="flex items-center justify-between bg-white p-4 rounded-[20px] shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 text-indigo-500 rounded-xl">
                  <Fingerprint className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-gray-800">Acesso Biométrico</span>
                  <span className="text-[11px] text-gray-400">Face ID ou Digital</span>
                </div>
              </div>
              <Toggle checked={biometricsEnabled} onChange={setBiometricsEnabled} />
            </div>
          </section>

          {/* Seção: Zona de Perigo */}
          <section className="flex flex-col gap-3 mt-4">
            <div className="bg-red-50/50 p-4 rounded-[24px] border border-red-100">
              <div className="flex items-center gap-2 mb-3">
                <ShieldAlert className="w-5 h-5 text-red-500" />
                <h4 className="font-bold text-red-600">Zona de Perigo</h4>
              </div>
              <p className="text-sm text-red-600/80 mb-4 font-medium">
                Ao excluir sua conta, você perderá acesso a todos os prontuários e agendamentos.
              </p>
              <Button variant="alert" fullWidth onClick={() => alert('Confirmação de exclusão não implementada')}>
                Excluir Conta
              </Button>
            </div>
          </section>

        </div>
        
        {/* Footer */}
        <div className="mt-2">
          <Button fullWidth onClick={onClose}>
            Salvar e Fechar
          </Button>
        </div>

      </div>
    </div>
  );
}
