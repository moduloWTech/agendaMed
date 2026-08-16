import logoImg from '../assets/logo.png';

export function SplashScreen() {
  return (
    <div className="fixed inset-0 z-50 min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-[#0c243c] flex flex-col items-center justify-center relative overflow-hidden transition-all duration-700 ease-out">
      {/* Ambient background glow */}
      <div className="absolute top-[-10%] right-[-20%] w-72 h-72 bg-[var(--color-primary)]/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-20%] w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* Conteúdo Central */}
      <div className="flex flex-col items-center animate-in fade-in zoom-in-95 duration-700">
        <div className="w-36 h-36 sm:w-44 sm:h-44 mb-6 rounded-3xl overflow-hidden shadow-2xl shadow-cyan-500/20 bg-white/10 backdrop-blur-md border border-white/20 p-2 flex items-center justify-center">
          <img
            src={logoImg}
            alt="AgendaMed Logo"
            className="w-full h-full object-contain drop-shadow-md"
          />
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight drop-shadow-md">
          AgendaMed
        </h1>
        <p className="text-cyan-200/90 text-sm sm:text-base mt-2 font-medium tracking-wide">
          Cuidando de quem você ama
        </p>

        {/* Loading indicator */}
        <div className="mt-10 flex items-center gap-1.5" aria-hidden="true">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:-0.3s]" />
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:-0.15s]" />
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-bounce" />
        </div>
      </div>
    </div>
  );
}
