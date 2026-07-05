import { LoginForm } from '../components/auth/LoginForm';
import LoginHeaderImg from '../assets/login-header.png';

export function LoginScreen() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center relative overflow-hidden animate-in fade-in duration-500">

      {/* Imagem de Fundo/Cabeçalho */}
      <div className="absolute top-0 w-full max-w-lg h-[40vh] flex justify-center items-end overflow-hidden pb-8 opacity-90 pointer-events-none">
        <img
          src={LoginHeaderImg}
          alt="Família e Saúde"
          className="w-full h-full object-cover rounded-b-[40px] shadow-sm mask-image-gradient"
          style={{ maskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)' }}
        />
      </div>

      {/* Container Principal */}
      <div className="w-full max-w-md px-4 pt-[28vh] pb-8 z-10 flex flex-col items-center">

        {/* Título de Boas-Vindas */}
        <div className="mb-8 text-center bg-white/60 backdrop-blur-md px-6 py-3 rounded-2xl shadow-sm border border-white/50">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">AgendaMed</h1>
          <p className="text-gray-700 text-lg mt-1 font-medium">Cuidando de quem você ama</p>
        </div>

        {/* Card do Formulário */}
        <div className="bg-white w-full p-6 sm:p-8 rounded-3xl shadow-md border border-gray-100 flex flex-col items-center">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 self-start">Acesse sua conta</h2>
          <LoginForm />
        </div>

      </div>
    </div>
  );
}
