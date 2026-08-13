import { useState } from 'react';
import { X } from 'lucide-react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';

interface UserDataModalProps {
  onClose: () => void;
}

export function UserDataModal({ onClose }: UserDataModalProps) {
  const { user } = useAuth();
  
  // Estados para edição (MVP, só visual)
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const phone = user?.phoneWhats || '';
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleSave = async () => {
    if (!user) return;
    setIsLoading(true);
    setError('');
    try {
      await api.put(`/api/users/${user.id}`, { name, email });
      window.location.reload();
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar os dados.');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 animate-in fade-in duration-300">

      {/* Overlay escurecido e desfocado */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Container do Modal */}
      <div className="relative w-full max-w-sm bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-[32px] shadow-2xl p-6 sm:p-8 border border-white dark:border-slate-700 flex flex-col gap-5 animate-in zoom-in-95 duration-300">

        {/* Header do Modal */}
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-[var(--color-primary)] dark:text-slate-100">Meus Dados</h2>
          <button
            onClick={onClose}
            className="p-2 bg-gray-100 dark:bg-slate-800 rounded-full text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs font-semibold rounded-xl border border-red-100">
            {error}
          </div>
        )}

        {/* Formulário com Dados Reais */}
        <div className="flex flex-col gap-4 overflow-y-auto max-h-[60vh] pb-2 custom-scrollbar">
          <Input
            label="Nome Completo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Digite seu nome"
          />
          <Input
            label="E-mail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Digite seu e-mail"
          />

          <Input
            label="Telefone do WhatsApp"
            type="tel"
            value={phone}
            readOnly
            className="opacity-70 cursor-not-allowed"
            title="O telefone não pode ser alterado pois é a sua chave de login"
          />
        </div>

        {/* Botões de Ação */}
        <div className="flex flex-col gap-3 mt-4">
          <Button fullWidth onClick={handleSave} disabled={isLoading}>
            {isLoading ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
          <Button variant="outline" fullWidth onClick={onClose}>
            Cancelar
          </Button>
        </div>

      </div>
    </div>
  );
}
