import { useState, useRef, useEffect } from 'react';
import { Pill, Users, Calendar, ShieldCheck, Heart, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import logoImg from '../../assets/logo.png';

interface MobileOnboardingProps {
  onComplete: () => void;
  onGoToLogin: () => void;
}

interface SlideData {
  id: number;
  icon: any;
  color: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  buttonBg: string;
  title: string;
  subtitle: string;
  highlight: string;
}

const SLIDES: SlideData[] = [
  {
    id: 0,
    icon: Pill,
    color: 'cyan',
    badgeBg: 'bg-cyan-500/10',
    badgeBorder: 'border-cyan-500/30',
    badgeText: 'text-cyan-400',
    buttonBg: 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/25',
    title: 'Medicamentos na hora certa',
    subtitle: 'Receba lembretes pontuais e confirme cada dose ministrada com facilidade e precisão.',
    highlight: 'Lembretes e Doses',
  },
  {
    id: 1,
    icon: Users,
    color: 'emerald',
    badgeBg: 'bg-emerald-500/10',
    badgeBorder: 'border-emerald-500/30',
    badgeText: 'text-emerald-400',
    buttonBg: 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/25',
    title: 'Toda a família sincronizada',
    subtitle: 'Acompanhe em tempo real quem ministrou o remédio e coordene cuidadores e parentes no mesmo app.',
    highlight: 'Cuidado em Equipe',
  },
  {
    id: 2,
    icon: Calendar,
    color: 'purple',
    badgeBg: 'bg-purple-500/10',
    badgeBorder: 'border-purple-500/30',
    badgeText: 'text-purple-400',
    buttonBg: 'bg-purple-500 hover:bg-purple-400 text-white shadow-purple-500/25',
    title: 'Tenha sua agenda sempre em dia',
    subtitle: 'Consultas médicas, exames e procedimentos com alertas para você não perder nenhum compromisso.',
    highlight: 'Consultas e Exames',
  },
  {
    id: 3,
    icon: ShieldCheck,
    color: 'amber',
    badgeBg: 'bg-amber-500/10',
    badgeBorder: 'border-amber-500/30',
    badgeText: 'text-amber-400',
    buttonBg: 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/25',
    title: 'Documentos e laudos protegidos',
    subtitle: 'Guarde receitas, receitas digitais, exames e cartões de vacina com total segurança e busca rápida.',
    highlight: 'Cofre de Saúde',
  },
  {
    id: 4,
    icon: Heart,
    color: 'rose',
    badgeBg: 'bg-rose-500/10',
    badgeBorder: 'border-rose-500/30',
    badgeText: 'text-rose-400',
    buttonBg: 'bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-400 hover:to-pink-400 text-white shadow-rose-500/30',
    title: 'Estamos prontos!',
    subtitle: 'Agora vamos criar seu perfil e organizar a rotina de cuidados da sua família no AgendaMed.',
    highlight: 'Cuidando de quem você ama',
  },
];

export function MobileOnboarding({ onComplete, onGoToLogin }: MobileOnboardingProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  const slide = SLIDES[currentSlide];
  const IconComponent = slide.icon;

  const handleNext = () => {
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide((prev) => prev + 1);
    } else {
      localStorage.setItem('agendamed_onboarding_completed', 'true');
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('agendamed_onboarding_completed', 'true');
    onComplete();
  };

  const handleLoginClick = () => {
    localStorage.setItem('agendamed_onboarding_completed', 'true');
    onGoToLogin();
  };

  // Touch swipe handling
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current - touchEndX.current > 60) {
      handleNext();
    } else if (touchEndX.current - touchStartX.current > 60) {
      handlePrev();
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
      window.scrollTo(0, 0);
    }
  }, [currentSlide]);

  return (
    <div 
      className="min-h-screen w-full bg-gradient-to-b from-slate-950 via-slate-900 to-[#0c1c2e] text-white flex flex-col justify-between p-5 sm:p-7 relative overflow-hidden select-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background ambient lighting */}
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-rose-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Bar */}
      <div className="relative z-10 flex items-center justify-between pt-2">
        {currentSlide > 0 ? (
          <button
            type="button"
            onClick={handlePrev}
            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 active:scale-95 transition-all cursor-pointer"
            aria-label="Voltar slide anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        ) : (
          <div className="w-10 h-10" />
        )}

        {/* Center Brand Identity */}
        <div className="flex items-center gap-2">
          <img src={logoImg} alt="AgendaMed" className="w-7 h-7 rounded-lg object-contain" />
          <span className="font-extrabold tracking-tight text-white text-base">AgendaMed</span>
        </div>

        {/* Skip button (visible on steps 0-3) */}
        {currentSlide < SLIDES.length - 1 ? (
          <button
            type="button"
            onClick={handleSkip}
            className="text-xs font-semibold text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 transition-colors cursor-pointer"
          >
            Pular
          </button>
        ) : (
          <div className="w-10 h-10" />
        )}
      </div>

      {/* Center Slide Content */}
      <div className="relative z-10 flex flex-col items-center text-center my-auto py-6 px-2">
        {/* Animated Badge Icon */}
        <div className="relative mb-8">
          <div className={`w-36 h-36 sm:w-44 sm:h-44 rounded-full ${slide.badgeBg} border-2 ${slide.badgeBorder} backdrop-blur-xl flex items-center justify-center shadow-2xl transition-all duration-500 animate-in zoom-in-75`}>
            <IconComponent className={`w-16 h-16 sm:w-20 sm:h-20 ${slide.badgeText} transition-transform duration-500`} />
          </div>
          
          {/* Subtle pulse ring around icon */}
          <div className={`absolute inset-0 rounded-full ${slide.badgeBg} animate-ping opacity-20 pointer-events-none`} />
        </div>

        {/* Highlight Pill */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[11px] font-bold text-slate-200 uppercase tracking-wider mb-4">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>{slide.highlight}</span>
        </div>

        {/* Slide Title */}
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-snug mb-3 max-w-sm">
          {slide.title}
        </h2>

        {/* Slide Subtitle */}
        <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xs sm:max-w-sm">
          {slide.subtitle}
        </p>
      </div>

      {/* Bottom Controls Area */}
      <div className="relative z-10 flex flex-col gap-4 pb-2">
        {/* Step Indicators (Pill Dots) */}
        <div className="flex items-center justify-center gap-2 mb-2" role="tablist" aria-label="Progresso do onboarding">
          {SLIDES.map((s, idx) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setCurrentSlide(idx)}
              aria-label={`Ir para etapa ${idx + 1}`}
              aria-selected={currentSlide === idx}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                currentSlide === idx
                  ? 'w-7 bg-cyan-400 shadow-md shadow-cyan-400/50'
                  : 'w-2 bg-white/20 hover:bg-white/40'
              }`}
            />
          ))}
        </div>

        {/* Main Action Button */}
        <button
          type="button"
          onClick={handleNext}
          className={`w-full py-4 rounded-2xl font-bold text-base shadow-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer ${slide.buttonBg}`}
        >
          <span>{currentSlide === SLIDES.length - 1 ? 'Vamos começar!' : 'Continuar'}</span>
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Secondary Login Link */}
        <div className="flex flex-col items-center gap-2 pt-1">
          <button
            type="button"
            onClick={handleLoginClick}
            className="text-xs text-slate-400 hover:text-cyan-300 font-medium transition-colors py-1 cursor-pointer"
          >
            Já tem uma conta? <span className="text-cyan-400 font-bold underline underline-offset-4">Fazer Login</span>
          </button>

          <p className="text-[10px] text-slate-500 text-center leading-tight">
            Ao continuar, você concorda com nossos <span className="underline">Termos de Uso</span> e <span className="underline">Política de Privacidade</span>.
          </p>
        </div>
      </div>
    </div>
  );
}
