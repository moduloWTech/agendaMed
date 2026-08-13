import { useState } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { Users, Phone, User, Loader2, CheckCircle2, Copy, Check, ExternalLink } from 'lucide-react';

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
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

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

  const handleGenerateInvite = async () => {
    if (!activePatient) return;
    
    const unformattedPhone = phone.replace(/\D/g, '');
    if (unformattedPhone.length < 10) {
      setError('Telefone inválido (mínimo 10 dígitos com DDD)');
      return;
    }
    if (name.length < 2) {
      setError('Nome muito curto');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await api.post('/api/users/invite', {
        phoneWhats: unformattedPhone,
        name: name,
        patientId: activePatient.id,
        patientName: activePatient.name
      });
      
      if (response.data && response.data.inviteLink) {
        setInviteLink(response.data.inviteLink);
        onSuccess();
      } else {
        setError('Não foi possível gerar o link de convite.');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao enviar convite');
    } finally {
      setIsLoading(false);
    }
  };

  // Abre diretamente o WhatsApp com o toque do dedo do usuário (100% livre de bloqueio de popup)
  const handleOpenWhatsApp = () => {
    if (!inviteLink) return;
    window.location.href = inviteLink;
  };

  // Copia o link para a área de transferência
  const handleCopyLink = () => {
    if (!inviteLink) return;
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !isLoading && onClose()} />
      <div className="relative bg-white dark:bg-slate-900 rounded-[32px] w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95 duration-300">
        
        {/* TELA DE SUCESSO / CONFIRMAÇÃO DO CONVITE */}
        {inviteLink ? (
          <div className="text-center py-2">
            <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            
            <h3 className="text-xl font-bold text-gray-800 dark:text-slate-100 mb-2">Convite Criado!</h3>
            <p className="text-xs text-gray-500 dark:text-slate-400 mb-6 leading-relaxed">
              O convite para <strong className="text-gray-800 dark:text-slate-200">{name}</strong> está pronto. Toque no botão abaixo para abrir o WhatsApp e enviar.
            </p>

            <div className="space-y-3">
              {/* Botão Verde Oficial do WhatsApp */}
              <button
                onClick={handleOpenWhatsApp}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-sm rounded-2xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-5 h-5" />
                <span>Enviar Convite no WhatsApp</span>
              </button>

              {/* Botão Secundário para Copiar Link */}
              <button
                onClick={handleCopyLink}
                className="w-full py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-2xl transition-all flex items-center justify-center gap-2"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Link Copiado!' : 'Copiar Link do Convite'}</span>
              </button>

              {/* Botão de Fechar */}
              <button
                onClick={onClose}
                className="w-full py-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-medium text-xs rounded-xl transition-all"
              >
                Concluir
              </button>
            </div>
          </div>
        ) : (
          /* FORMULÁRIO DE PREENCHIMENTO */
          <>
            <div className="flex items-center gap-3 mb-2 text-[var(--color-primary)] dark:text-slate-100">
              <Users className="w-6 h-6" />
              <h3 className="text-xl font-bold text-gray-800 dark:text-slate-100">Convidar Cuidador</h3>
            </div>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">
              Adicione alguém da família ou equipe para ajudar nos cuidados de {activePatient?.name}.
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm font-medium rounded-xl border border-red-100">
                {error}
              </div>
            )}

            <div className="space-y-4 mb-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400 dark:text-slate-500">
                  <User className="w-5 h-5" />
                </div>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#F8FAFC] dark:bg-slate-800 border-2 border-transparent focus:border-[var(--color-primary)] dark:focus:border-slate-500 rounded-[20px] pl-12 pr-4 py-4 text-gray-800 dark:text-slate-100 text-sm outline-none transition-all"
                  placeholder="Nome do cuidador"
                  disabled={isLoading}
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400 dark:text-slate-500">
                  <Phone className="w-5 h-5" />
                </div>
                <input 
                  type="tel" 
                  value={phone}
                  onChange={handlePhoneChange}
                  className="w-full bg-[#F8FAFC] dark:bg-slate-800 border-2 border-transparent focus:border-[var(--color-primary)] dark:focus:border-slate-500 rounded-[20px] pl-12 pr-4 py-4 text-gray-800 dark:text-slate-100 text-sm outline-none transition-all"
                  placeholder="(DD) 9XXXX-XXXX"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                className="flex-1 py-3.5 text-gray-500 dark:text-slate-400 font-bold hover:bg-gray-100 dark:hover:bg-slate-800 rounded-2xl transition-colors"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancelar
              </button>
              <button 
                className="flex-[1.5] flex items-center justify-center gap-2 py-3.5 bg-[var(--color-primary)] text-white font-bold rounded-2xl shadow-lg shadow-[var(--color-primary)]/30 hover:bg-[var(--color-accent)] transition-all disabled:opacity-50"
                onClick={handleGenerateInvite}
                disabled={isLoading || !name || !phone}
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Gerar Convite'}
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
