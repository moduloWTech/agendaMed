
import { MessageCircle } from 'lucide-react';
import ProfileImg from '../../assets/login-header.png';

export function ProfileHeader() {
  return (
    <div className="w-full relative h-[45vh] flex flex-col justify-end pb-12 pt-8 px-5 overflow-hidden z-0">
      
      {/* Imagem de Fundo */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none -z-10">
        <img 
          src={ProfileImg} 
          alt="Família e Saúde" 
          className="w-full h-full object-cover object-center opacity-95"
        />
        {/* Gradiente escuro sutil para garantir transição suave */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-[var(--color-primary)]/70"></div>
      </div>

      {/* Painel Vitral 1: Ações Rápidas (Apenas Mensagem) */}
      <div className="w-full flex items-center justify-end mb-4 pr-2">
        <button className="w-14 h-14 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-[var(--color-primary)] shadow-[0_8px_30px_rgb(0,0,0,0.1)] hover:scale-105 active:scale-95 transition-transform border border-white/50">
          <MessageCircle className="w-6 h-6" />
        </button>
      </div>

    </div>
  );
}
