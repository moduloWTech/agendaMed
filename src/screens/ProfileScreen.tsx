import { User } from 'lucide-react';

export function ProfileScreen() {
  return (
    <div className="flex flex-col w-full h-full min-h-screen bg-[#F4F7FA] items-center justify-center">
      <div className="w-24 h-24 rounded-full bg-white shadow-sm flex items-center justify-center text-[var(--color-primary)] mb-6">
        <User className="w-12 h-12" />
      </div>
      <h1 className="text-2xl font-bold text-[var(--color-primary)] mb-2">Meu Perfil</h1>
      <p className="text-gray-500 font-medium">Em breve</p>
    </div>
  );
}
