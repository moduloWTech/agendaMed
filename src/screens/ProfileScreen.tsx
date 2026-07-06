import { useState } from 'react';
import { User, Users, Settings, Lock, LogOut } from 'lucide-react';
import { ProfileMenuItem } from '../components/profile/ProfileMenuItem';
import { UserDataModal } from '../components/profile/UserDataModal';

interface ProfileScreenProps {
  onLogout?: () => void;
}

export function ProfileScreen({ onLogout }: ProfileScreenProps) {
  const [isUserDataModalOpen, setIsUserDataModalOpen] = useState(false);

  return (
    <div className="flex flex-col w-full min-h-screen bg-gray-50 pb-24 relative animate-in fade-in slide-in-from-bottom-2 duration-500">
      
      {/* Fundo Decorativo */}
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] opacity-10 rounded-b-[48px] pointer-events-none" />

      <div className="w-full max-w-md mx-auto px-6 pt-12 z-10">
        
        {/* Header do Usuário */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-4">
            <div className="w-28 h-28 rounded-[32px] bg-white/80 backdrop-blur-xl shadow-lg border border-white/60 flex items-center justify-center text-[var(--color-primary)] rotate-3 transition-transform hover:rotate-0">
              <User className="w-14 h-14" />
            </div>
            {/* Status Indicator */}
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-white shadow-sm" />
          </div>
          
          <h1 className="text-2xl font-extrabold text-gray-800 tracking-tight">João Silva</h1>
          <p className="text-gray-500 font-medium">joao.silva@email.com</p>
        </div>

        {/* Opções de Perfil */}
        <div className="flex flex-col gap-1 w-full mt-4">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">Conta</h2>
          
          <ProfileMenuItem 
            icon={<User />}
            title="Meus Dados"
            subtitle="Informações pessoais e contato"
            onClick={() => setIsUserDataModalOpen(true)}
          />
          <ProfileMenuItem 
            icon={<Users />}
            title="Familiares"
            subtitle="Gerenciar perfis dependentes"
          />
          
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2 mt-4 px-2">Preferências</h2>
          
          <ProfileMenuItem 
            icon={<Settings />}
            title="Configurações"
            subtitle="Notificações e aparência"
          />
          <ProfileMenuItem 
            icon={<Lock />}
            title="Privacidade"
            subtitle="Senhas e segurança da conta"
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

      {/* Modal Renderizado Condicionalmente */}
      {isUserDataModalOpen && (
        <UserDataModal onClose={() => setIsUserDataModalOpen(false)} />
      )}
    </div>
  );
}
