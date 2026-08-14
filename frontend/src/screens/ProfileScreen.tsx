import { useState, useEffect } from 'react';
import { User, Settings, Lock, LogOut, Download, FileText, Users, UserPlus } from 'lucide-react';
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
import { MedicalReportModal } from '../components/reports/MedicalReportModal';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { usePwaInstall } from '../hooks/usePwaInstall';
import { usePwaUpdate } from '../contexts/PwaUpdateContext';
import { ConfirmCaregiverModal } from '../components/profile/ConfirmCaregiverModal';

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
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Estados para o Modal de Edição de Paciente
  const [isEditPatientModalOpen, setIsEditPatientModalOpen] = useState(false);
  const [newPatientName, setNewPatientName] = useState('');
  const [isSavingPatient, setIsSavingPatient] = useState(false);

  // Estado para o Modal de Confirmação de Ações de Cuidadores (Remover / Cargo)
  const [caregiverActionModal, setCaregiverActionModal] = useState<{
    type: 'REMOVE' | 'TOGGLE_ROLE';
    targetId: string;
    caregiverName: string;
    currentRole?: string;
  } | null>(null);

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

  const handleConfirmAction = async () => {
    if (!caregiverActionModal) return;
    const { type, targetId, currentRole } = caregiverActionModal;

    try {
      if (type === 'REMOVE') {
        await api.delete(`/api/users/${targetId}`);
      } else if (type === 'TOGGLE_ROLE') {
        const newRole = currentRole === 'ADMIN' ? 'CARE_GIVER' : 'ADMIN';
        await api.patch(`/api/users/${targetId}/role`, { role: newRole });
      }
      loadCaregivers();
    } catch (error: any) {
      throw error;
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
    }
  };

  return (
    <div className="w-full">
      {/* ============================================================ */}
      {/* 📱 MODO MOBILE HOMOLOGADO (Visível exclusivamente em < md)     */}
      {/* ============================================================ */}
      <div className="flex flex-col w-full min-h-screen bg-gray-50 dark:bg-slate-900 pb-24 relative md:hidden animate-in fade-in duration-300">
        
        {/* Fundo Decorativo com Imagem e Máscara Escura */}
        <div className="absolute top-0 left-0 right-0 h-72 rounded-b-[48px] overflow-hidden pointer-events-none z-0 shadow-lg">
          <img
            src={HeaderImg}
            alt="Profile Background"
            className="w-full h-full object-cover"
          />
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

            {activePatient && (
              <div className="my-1">
                <ProfileMenuItem
                  icon={<FileText className="text-[var(--color-primary)] dark:text-slate-300" />}
                  title="Relatório Médico em PDF"
                  subtitle="Histórico de adesão e medicações para a consulta"
                  onClick={() => setIsReportModalOpen(true)}
                />
              </div>
            )}

            {/* Seção: Equipe de Cuidados */}
            <CareTeamHeader
              userRole={user?.role}
              onAddClick={() => setIsInviteModalOpen(true)}
            />

            <CaregiversList
              caregivers={caregivers}
              currentUserId={user?.id}
              currentUserRole={user?.role}
              onToggleRole={(id, role, name) => setCaregiverActionModal({ type: 'TOGGLE_ROLE', targetId: id, currentRole: role, caregiverName: name })}
              onRemoveCaregiver={(id, name) => setCaregiverActionModal({ type: 'REMOVE', targetId: id, caregiverName: name })}
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
                    if (isIOS || !isInstallable) {
                      setIsInstallModalOpen(true);
                    } else {
                      promptInstall();
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
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 🖥️ MODO DESKTOP & TABLET DEDICADO (Visível a partir de md:)    */}
      {/* ============================================================ */}
      <div className="hidden md:flex flex-col gap-8 w-full pt-2 animate-in fade-in duration-300">
        
        {/* Hero Banner Desktop */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-[#0A2540] rounded-3xl p-6 lg:p-8 text-white shadow-xl relative overflow-hidden flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 border border-slate-800">
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Users className="w-4 h-4" />
              <span>Gestão Familiar & Configurações</span>
            </div>
            
            <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-white">
              Equipe de Cuidados & Perfil
            </h1>
            
            <p className="text-sm text-slate-300 mt-1 max-w-xl">
              Gerencie os dados de <strong className="text-cyan-300 font-bold">{activePatient?.name || 'seu paciente'}</strong>, convide familiares e personalize notificações e privacidade.
            </p>
          </div>

          <div className="relative z-10 flex flex-wrap items-center gap-3 shrink-0">
            {activePatient && (
              <button
                onClick={() => setIsReportModalOpen(true)}
                className="flex items-center gap-2.5 px-5 py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-sm rounded-2xl backdrop-blur-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <FileText className="w-4 h-4 text-cyan-400" />
                <span>Relatório Médico PDF</span>
              </button>
            )}

            <button
              onClick={() => setIsInviteModalOpen(true)}
              className="flex items-center gap-2.5 px-6 py-3.5 bg-[var(--color-primary)] hover:bg-[var(--color-accent)] text-white font-bold text-sm rounded-2xl shadow-lg shadow-[var(--color-primary)]/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <UserPlus className="w-5 h-5" />
              <span>Convidar Familiar</span>
            </button>
          </div>

          {/* Glow decorativo de fundo */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--color-primary)]/15 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Split Grid Desktop: 2 Colunas (7/12 e 5/12) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Coluna Esquerda: Paciente & Equipe de Cuidados (7 / 12 colunas) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* Card Quem Estamos Cuidando */}
            <div className="bg-white dark:bg-slate-800 p-6 lg:p-7 rounded-3xl border border-slate-200/80 dark:border-slate-700 shadow-xs">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-700/60">
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Quem estamos cuidando
                </span>
              </div>

              <ActivePatientCard
                activePatient={activePatient}
                userRole={user?.role}
                onEditClick={(name) => {
                  setNewPatientName(name);
                  setIsEditPatientModalOpen(true);
                }}
              />
            </div>

            {/* Card Equipe de Cuidados */}
            <div className="bg-white dark:bg-slate-800 p-6 lg:p-7 rounded-3xl border border-slate-200/80 dark:border-slate-700 shadow-xs">
              <CareTeamHeader
                userRole={user?.role}
                onAddClick={() => setIsInviteModalOpen(true)}
              />

              <div className="mt-4">
                <CaregiversList
                  caregivers={caregivers}
                  currentUserId={user?.id}
                  currentUserRole={user?.role}
                  onToggleRole={(id, role, name) => setCaregiverActionModal({ type: 'TOGGLE_ROLE', targetId: id, currentRole: role, caregiverName: name })}
                  onRemoveCaregiver={(id, name) => setCaregiverActionModal({ type: 'REMOVE', targetId: id, caregiverName: name })}
                />
              </div>
            </div>

          </div>

          {/* Coluna Direita: Meu Perfil, Configurações & Segurança (5 / 12 colunas) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Meu Perfil Resumo */}
            <div className="bg-white dark:bg-slate-800 p-6 lg:p-7 rounded-3xl border border-slate-200/80 dark:border-slate-700 shadow-xs">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-700/60">
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Minha Conta
                </span>
                <span className="px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  {user?.role === 'ADMIN' ? 'Administrador' : 'Cuidador'}
                </span>
              </div>

              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-slate-700 to-slate-900 text-white flex items-center justify-center font-black text-xl shadow-md">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-slate-900 dark:text-white text-base truncate">{user?.name || 'Cuidador'}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{displayPhone}</p>
                  {user?.email && <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{user.email}</p>}
                </div>
              </div>

              <ProfileMenuItem
                icon={<User />}
                title="Editar Meus Dados"
                subtitle="Atualize nome e e-mail de acesso"
                onClick={() => setIsUserDataModalOpen(true)}
              />
            </div>

            {/* Preferências & Sistema */}
            <div className="bg-white dark:bg-slate-800 p-6 lg:p-7 rounded-3xl border border-slate-200/80 dark:border-slate-700 shadow-xs flex flex-col gap-2">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                Preferências do Sistema
              </span>

              <ProfileMenuItem
                icon={<Settings />}
                title="Configurações de Alertas"
                subtitle="Avisos sonoros, antecedência e tema"
                showBadge={needRefresh}
                onClick={() => setIsSettingsModalOpen(true)}
              />
              
              <ProfileMenuItem
                icon={<Lock />}
                title="Privacidade & Segurança"
                subtitle="Termos LGPD e proteção criptografada"
                onClick={() => setIsPrivacyModalOpen(true)}
              />

              {!isInstalled && (
                <div className="mt-2">
                  <ProfileMenuItem
                    icon={<Download />}
                    title="Instalar Aplicativo (PWA)"
                    subtitle="Acesso offline e tela cheia"
                    onClick={() => {
                      if (isIOS || !isInstallable) {
                        setIsInstallModalOpen(true);
                      } else {
                        promptInstall();
                      }
                    }}
                  />
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/60">
                <ProfileMenuItem
                  icon={<LogOut />}
                  title="Sair da Conta"
                  danger
                  onClick={() => {
                    if (onLogout) onLogout();
                  }}
                />
              </div>
            </div>

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

      {/* Modal de Relatório Médico */}
      {isReportModalOpen && activePatient && (
        <MedicalReportModal
          patientId={activePatient.id}
          patientName={activePatient.name}
          onClose={() => setIsReportModalOpen(false)}
        />
      )}

      {/* Modal de Confirmação de Ações na Equipe de Cuidadores */}
      {caregiverActionModal && (
        <ConfirmCaregiverModal
          type={caregiverActionModal.type}
          caregiverName={caregiverActionModal.caregiverName}
          currentRole={caregiverActionModal.currentRole}
          onClose={() => setCaregiverActionModal(null)}
          onConfirm={handleConfirmAction}
        />
      )}
    </div>
  );
}

