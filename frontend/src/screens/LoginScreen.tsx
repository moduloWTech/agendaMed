import { LoginForm } from '../components/auth/LoginForm';
import LoginHeaderImg from '../assets/login-header.png';

interface LoginScreenProps {
  onLogin?: () => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center relative overflow-hidden animate-in fade-in duration-500">
      
      {/* Imagem de Fundo/Cabeçalho */}
      <div className="absolute top-0 w-full max-w-lg h-[45vh] flex justify-center items-end overflow-hidden pb-8 pointer-events-none">
        <img
          src={LoginHeaderImg}
          alt="Família e Saúde"
          className="w-full h-full object-cover rounded-b-[48px] shadow-sm mask-image-gradient opacity-95"
          style={{ maskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)' }}
        />
      </div>

      {/* Container Principal */}
      <div className="w-full max-w-md px-4 pt-[28vh] pb-8 z-10 flex flex-col items-center">
        
        {/* Título de Boas-Vindas */}
        <div className="mb-10 text-center bg-white/40 backdrop-blur-xl px-8 py-4 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60">
          <h1 className="text-4xl font-extrabold text-[var(--color-primary)] tracking-tight">AgendaMed</h1>
          <p className="text-gray-700 text-lg mt-1 font-medium">Cuidando de quem você ama</p>
        </div>

        {/* Card do Formulário */}
        <div className="bg-white/90 backdrop-blur-md w-full p-6 sm:p-8 rounded-[40px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-white flex flex-col items-center">
          <h2 className="text-2xl font-bold text-[var(--color-primary)] mb-8 self-start px-2">Acesse sua conta</h2>
          <LoginForm onLogin={onLogin} />
        </div>
        
      </div>
    </div>
  );
}
