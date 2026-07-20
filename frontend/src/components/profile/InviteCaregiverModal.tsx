import { useState } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { Users, Phone, User, Loader2 } from 'lucide-react';

interface InviteCaregiverModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function InviteCaregiverModal({ onClose, onSuccess }: InviteCaregiverModalProps) {
  const { activePatient } = useAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Formatação de telefone (Brasil)
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 11) val = val.slice(0, 11);
    
    // Máscara (XX) XXXXX-XXXX
    let formatted = val;
    if (val.length > 2) formatted = `(${val.slice(0, 2)}) ${val.slice(2)}`;
    if (val.length > 7) formatted = `(${val.slice(0, 2)}) ${val.slice(2, 7)}-${val.slice(7)}`;
    
    setPhone(formatted);
  };

  const handleInvite = async () => {
    if (!activePatient) return;
    
    const unformattedPhone = phone.replace(/\D/g, '');
    if (unformattedPhone.length < 10) {
      setError('Telefone inválido');
      return;
    }
    if (name.length < 2) {
      setError('Nome muito curto');
      return;
    }

    setIsLoading(true);
    setError('');

    // Cria a janela antes da requisição assíncrona para não ser barrada pelo bloqueador de popups
    const newWindow = window.open('about:blank', '_blank');

    try {
      const response = await api.post('/api/users/invite', {
        phoneWhats: unformattedPhone,
        name: name,
        patientId: activePatient.id,
        patientName: activePatient.name
      });
      
      if (response.data && response.data.inviteLink) {
        if (newWindow) {
           newWindow.location.href = response.data.inviteLink;
        } else {
           // Fallback se o navegador ainda assim bloqueou
           window.location.href = response.data.inviteLink;
        }
      } else {
        if (newWindow) newWindow.close();
      }
      
      onSuccess();
    } catch (err: any) {
      if (newWindow) newWindow.close();
      setError(err.response?.data?.error || 'Erro ao enviar convite');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !isLoading && onClose()} />
      <div className="relative bg-white rounded-[32px] w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="flex items-center gap-3 mb-2 text-[var(--color-primary)]">
          <Users className="w-6 h-6" />
          <h3 className="text-xl font-bold text-gray-800">Convidar Cuidador</h3>
        </div>
        <p className="text-sm text-gray-500 mb-6">
          Adicione alguém da família ou equipe para ajudar nos cuidados de {activePatient?.name}. Eles receberão um convite no WhatsApp.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm font-medium rounded-xl border border-red-100">
            {error}
          </div>
        )}

        <div className="space-y-4 mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400">
              <User className="w-5 h-5" />
            </div>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#F8FAFC] border-2 border-transparent focus:border-[var(--color-primary)] rounded-[20px] pl-12 pr-4 py-4 text-gray-800 text-sm outline-none transition-all"
              placeholder="Nome do cuidador"
              disabled={isLoading}
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400">
              <Phone className="w-5 h-5" />
            </div>
            <input 
              type="tel" 
              value={phone}
              onChange={handlePhoneChange}
              className="w-full bg-[#F8FAFC] border-2 border-transparent focus:border-[var(--color-primary)] rounded-[20px] pl-12 pr-4 py-4 text-gray-800 text-sm outline-none transition-all"
              placeholder="(DD) 9XXXX-XXXX"
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button 
            className="flex-1 py-3.5 text-gray-500 font-bold hover:bg-gray-100 rounded-2xl transition-colors"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button 
            className="flex-[1.5] flex items-center justify-center gap-2 py-3.5 bg-[var(--color-primary)] text-white font-bold rounded-2xl shadow-lg shadow-[var(--color-primary)]/30 hover:bg-[var(--color-accent)] transition-all disabled:opacity-50"
            onClick={handleInvite}
            disabled={isLoading || !name || !phone}
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Enviar Convite'}
          </button>
        </div>
      </div>
    </div>
  );
}
