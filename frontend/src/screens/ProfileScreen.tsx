import { useState, useEffect } from 'react';
import { User, Settings, Lock, LogOut, Download } from 'lucide-react';
import HeaderImg from '../assets/login-header.png';
import { ProfileMenuItem } from '../components/profile/ProfileMenuItem';
import { UserDataModal } from '../components/profile/UserDataModal';
import { SettingsModal } from '../components/profile/SettingsModal';
import { PrivacyModal } from '../components/profile/PrivacyModal';
import { InviteCaregiverModal } from '../components/profile/InviteCaregiverModal';
import { InstallPwaModal } from '../components/profile/InstallPwaModal';
import { UserHeader } from '../components/profile/UserHeader';
import { CareTeamHeader } from '../components/profile/CareTeamHeader';
import { CaregiversList } from '../components/profile/CaregiversList';
import { EditPatientModal } from '../components/profile/EditPatientModal';
import { ActivePatientCard } from '../components/profile/ActivePatientCard';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { usePwaInstall } from '../hooks/usePwaInstall';
import { usePwaUpdate } from '../contexts/PwaUpdateContext';

interface ProfileScreenProps {
  onLogout?: () => void;
}

export function ProfileScreen({ onLogout }: ProfileScreenProps) {
  const { user, activePatient } = useAuth();
  const { isInstallable, isIOS, isInstalled, promptInstall } = usePwaInstall();
  const { needRefresh } = usePwaUpdate();
  const [isUserDataModalOpen, setIsUserDataModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);

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

  const handleToggleRole = async (targetId: string, currentRole: string) => {
    try {
      const newRole = currentRole === 'ADMIN' ? 'CARE_GIVER' : 'ADMIN';
      if (confirm(`Tem certeza que deseja alterar o cargo para ${newRole === 'ADMIN' ? 'Administrador' : 'Cuidador'}?`)) {
        await api.patch(`/api/users/${targetId}/role`, { role: newRole });
        loadCaregivers();
      }
    } catch (error: any) {
      alert(error.response?.data?.error || 'Erro ao alterar cargo');
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
    <div className="flex flex-col w-full min-h-screen bg-gray-50 dark:bg-slate-900 pb-24 relative animate-in fade-in slide-in-from-bottom-2 duration-500">

      {/* Fundo Decorativo com Imagem e Máscara Escura */}
      <div className="absolute top-0 left-0 right-0 h-72 rounded-b-[48px] overflow-hidden pointer-events-none z-0 shadow-lg">
        <img
          src={HeaderImg}
          alt="Profile Background"
          className="w-full h-full object-cover"
        />
        {/* Máscara escura com transparência para dar o efeito solicitado */}
        <div className="absolute inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-[2px]" />
      </div>

      <div className="w-full max-w-md mx-auto px-6 pt-10 z-10">

        {/* Header do Usuário */}
        <UserHeader user={user} displayPhone={displayPhone} activePatient={activePatient} />

        {/* Opções de Perfil */}
        <div className="flex flex-col gap-1 w-full mt-4">
          <h2 className="text-sm font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-2 px-2">Quem estamos cuidando</h2>

          <ActivePatientCard
            activePatient={activePatient}
            userRole={user?.role}
            onEditClick={(name) => {
              setNewPatientName(name);
              setIsEditPatientModalOpen(true);
            }}
          />

          {/* Nova Seção: Equipe de Cuidados */}
          <CareTeamHeader
            userRole={user?.role}
            onAddClick={() => setIsInviteModalOpen(true)}
          />

          <CaregiversList
            caregivers={caregivers}
            currentUserId={user?.id}
            currentUserRole={user?.role}
            onToggleRole={handleToggleRole}
          />

          <h2 className="text-sm font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-2 mt-6 px-2">Conta</h2>

          <ProfileMenuItem
            icon={<User />}
            title="Meus Dados"
            subtitle="Informações pessoais e contato"
            onClick={() => setIsUserDataModalOpen(true)}
          />

          {!isInstalled && (
            <div className="mt-4">
              <ProfileMenuItem
                icon={<Download />}
                title="Instalar Aplicativo"
                subtitle="Tenha acesso rápido na tela inicial"
                onClick={() => {
                  if (isIOS) {
                    setIsInstallModalOpen(true);
                  } else {
                    if (isInstallable) {
                      promptInstall();
                    } else {
                      alert('Para instalar, toque nos 3 pontinhos do menu do navegador e selecione "Instalar Aplicativo" ou "Adicionar à Tela Inicial".');
                    }
                  }
                }}
              />
            </div>
          )}

          <h2 className="text-sm font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-2 mt-4 px-2">Preferências</h2>

          <ProfileMenuItem
            icon={<Settings />}
            title="Configurações"
            subtitle="Notificações e aparência"
            showBadge={needRefresh}
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
                if (onLogout) onLogout();
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

      {isInstallModalOpen && (
        <InstallPwaModal onClose={() => setIsInstallModalOpen(false)} />
      )}

      {/* Modal de Edição de Paciente */}
      {isEditPatientModalOpen && (
        <EditPatientModal
          onClose={() => setIsEditPatientModalOpen(false)}
          newPatientName={newPatientName}
          setNewPatientName={setNewPatientName}
          isSavingPatient={isSavingPatient}
          onSave={handleRenamePatient}
        />
      )}
    </div>
  );
}
