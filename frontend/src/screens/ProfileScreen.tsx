import { useState, useEffect } from 'react';
import { User, Settings, Lock, LogOut, Users, UserPlus } from 'lucide-react';
import HeaderImg from '../assets/login-header.png';
import { ProfileMenuItem } from '../components/profile/ProfileMenuItem';
import { UserDataModal } from '../components/profile/UserDataModal';
import { SettingsModal } from '../components/profile/SettingsModal';
import { PrivacyModal } from '../components/profile/PrivacyModal';
import { InviteCaregiverModal } from '../components/profile/InviteCaregiverModal';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';

interface ProfileScreenProps {
  onLogout?: () => void;
}

export function ProfileScreen({ onLogout }: ProfileScreenProps) {
  const { user, activePatient } = useAuth();
  const [isUserDataModalOpen, setIsUserDataModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  
  // Estados para o Modal de Edição de Paciente
  const [isEditPatientModalOpen, setIsEditPatientModalOpen] = useState(false);
  const [newPatientName, setNewPatientName] = useState('');
  const [isSavingPatient, setIsSavingPatient] = useState(false);

  // Formata telefone se disponível
  const displayPhone = user?.phoneWhats || 'Sem telefone';

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [caregivers, setCaregivers] = useState<any[]>([]);

  const loadCaregivers = async () => {
    if (!activePatient) return;
    try {
      const response = await api.get(`/api/users/family/${activePatient.id}`);
      setCaregivers(response || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadCaregivers();
  }, [activePatient]);
  const handleRenamePatient = async () => {
    if (!activePatient || !newPatientName.trim()) return;
    setIsSavingPatient(true);
    try {
      await api.put(`/api/patients/${activePatient.id}`, { name: newPatientName });
      window.location.reload();
    } catch (error) {
      console.error('Erro ao renomear', error);
      setIsSavingPatient(false);
      alert('Erro ao renomear. Tente novamente.');
    }
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-gray-50 pb-24 relative animate-in fade-in slide-in-from-bottom-2 duration-500">
      
      {/* Fundo Decorativo com Imagem e Máscara Escura */}
      <div className="absolute top-0 left-0 right-0 h-72 rounded-b-[48px] overflow-hidden pointer-events-none z-0 shadow-lg">
        <img 
          src={HeaderImg} 
          alt="Profile Background" 
          className="w-full h-full object-cover"
        />
        {/* Máscara escura com transparência para dar o efeito solicitado */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
      </div>

      <div className="w-full max-w-md mx-auto px-6 pt-10 z-10">
        
        {/* Header do Usuário */}
        <div className="flex flex-col items-center mb-8 relative">
          <div className="relative mb-4">
            <div className="w-28 h-28 rounded-[32px] bg-white/20 backdrop-blur-md shadow-xl border border-white/30 flex items-center justify-center text-white rotate-3 transition-transform hover:rotate-0">
              <User className="w-14 h-14" />
            </div>
            {/* Status Indicator */}
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-4 border-black/20 shadow-sm" />
          </div>
          
          <h1 className="text-2xl font-extrabold text-white tracking-tight drop-shadow-md">{user?.name || 'Administrador'}</h1>
          <p className="text-gray-200 font-medium drop-shadow-md">{displayPhone}</p>
          {activePatient && (
             <span className="mt-3 px-4 py-1.5 bg-white/20 text-white rounded-full text-xs font-bold border border-white/30 backdrop-blur-md shadow-sm">
               Paciente Ativo: {activePatient.name}
             </span>
          )}
        </div>

        {/* Opções de Perfil */}
        <div className="flex flex-col gap-1 w-full mt-4">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">Quem estamos cuidando</h2>
          
          <div className="flex items-center justify-between bg-white px-4 py-4 rounded-2xl shadow-sm border border-gray-100 mb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[var(--color-primary)]/10 rounded-xl text-[var(--color-primary)]">
                <User className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-gray-800">{activePatient?.name || 'Carregando...'}</span>
                <span className="text-sm text-gray-500">Paciente Ativo</span>
              </div>
            </div>
            {user?.role === 'ADMIN' && activePatient && (
              <button 
                onClick={() => {
                   setNewPatientName(activePatient.name);
                   setIsEditPatientModalOpen(true);
                }}
                className="text-sm font-bold text-[var(--color-primary)] px-3 py-1 bg-[var(--color-primary)]/10 rounded-full hover:bg-[var(--color-primary)]/20 transition-colors"
              >
                Editar
              </button>
            )}
          </div>

          {/* Nova Seção: Equipe de Cuidados */}
          <div className="flex items-center justify-between mb-2 mt-6 px-2">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Equipe de Cuidados</h2>
            {user?.role === 'ADMIN' && (
              <button 
                onClick={() => setIsInviteModalOpen(true)}
                className="flex items-center gap-1 text-sm font-bold text-[var(--color-primary)] hover:text-[var(--color-accent)] transition-colors"
              >
                <UserPlus className="w-4 h-4" /> Adicionar
              </button>
            )}
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-2">
            {(caregivers || []).map((cg, idx) => (
              <div key={cg.id} className={`flex items-center justify-between px-4 py-3 ${idx !== (caregivers || []).length - 1 ? 'border-b border-gray-50' : ''}`}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-800 text-sm">{cg.name || 'Sem nome'} {cg.id === user?.id ? '(Você)' : ''}</span>
                    <span className="text-xs text-gray-400">{cg.phoneWhats?.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')} • {cg.role === 'ADMIN' ? 'Administrador' : 'Cuidador'}</span>
                  </div>
                </div>
              </div>
            ))}
            {(!caregivers || caregivers.length === 0) && (
              <div className="px-4 py-3 text-sm text-gray-400 text-center">Nenhum cuidador encontrado.</div>
            )}
          </div>

          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2 mt-6 px-2">Conta</h2>
          
          <ProfileMenuItem 
            icon={<User />}
            title="Meus Dados"
            subtitle="Informações pessoais e contato"
            onClick={() => setIsUserDataModalOpen(true)}
          />
          
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2 mt-4 px-2">Preferências</h2>
          
          <ProfileMenuItem 
            icon={<Settings />}
            title="Configurações"
            subtitle="Notificações e aparência"
            onClick={() => setIsSettingsModalOpen(true)}
          />
          <ProfileMenuItem 
            icon={<Lock />}
            title="Privacidade"
            subtitle="Senhas e segurança da conta"
            onClick={() => setIsPrivacyModalOpen(true)}
          />

          <div className="mt-8 mb-4">
            <ProfileMenuItem 
              icon={<LogOut />}
              title="Sair da Conta"
              danger
              onClick={() => {
                if(onLogout) onLogout();
                else alert("Logout não configurado.");
              }}
            />
          </div>
        </div>

      </div>

      {/* Modais Renderizados Condicionalmente */}
      {isUserDataModalOpen && (
        <UserDataModal onClose={() => setIsUserDataModalOpen(false)} />
      )}
      {isSettingsModalOpen && (
        <SettingsModal onClose={() => setIsSettingsModalOpen(false)} />
      )}
      {isPrivacyModalOpen && (
        <PrivacyModal onClose={() => setIsPrivacyModalOpen(false)} />
      )}

      {isInviteModalOpen && (
        <InviteCaregiverModal 
          onClose={() => setIsInviteModalOpen(false)} 
          onSuccess={() => {
            setIsInviteModalOpen(false);
            loadCaregivers();
          }}
        />
      )}

      {/* Modal de Edição de Paciente */}
      {isEditPatientModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !isSavingPatient && setIsEditPatientModalOpen(false)} />
          <div className="relative bg-white rounded-[32px] w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95 duration-300">
            <h3 className="text-xl font-bold text-gray-800 mb-2">Editar Nome</h3>
            <p className="text-sm text-gray-500 mb-6">Como vocês chamam o familiar que estão cuidando?</p>
            
            <input 
              type="text" 
              value={newPatientName}
              onChange={(e) => setNewPatientName(e.target.value)}
              className="w-full bg-[#F8FAFC] border-2 border-transparent hover:border-gray-200 focus:border-[var(--color-primary)] rounded-[24px] px-4 py-4 text-gray-800 text-base outline-none transition-all mb-6"
              placeholder="Ex: Dona Maria, Vovô João..."
              autoFocus
            />

            <div className="flex gap-3">
              <button 
                className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-2xl transition-colors"
                onClick={() => setIsEditPatientModalOpen(false)}
                disabled={isSavingPatient}
              >
                Cancelar
              </button>
              <button 
                className="flex-1 py-3 bg-[var(--color-primary)] text-white font-bold rounded-2xl shadow-lg shadow-[var(--color-primary)]/30 hover:bg-[var(--color-accent)] transition-all disabled:opacity-50"
                onClick={handleRenamePatient}
                disabled={isSavingPatient || !newPatientName.trim()}
              >
                {isSavingPatient ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
