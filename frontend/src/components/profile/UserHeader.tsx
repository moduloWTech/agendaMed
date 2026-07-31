import { User } from 'lucide-react';

interface UserHeaderProps {
  user: any;
  displayPhone: string;
  activePatient: any;
}

export function UserHeader({ user, displayPhone, activePatient }: UserHeaderProps) {
  return (
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
  );
}
