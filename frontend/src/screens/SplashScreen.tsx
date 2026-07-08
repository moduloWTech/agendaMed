import LoginHeaderImg from '../assets/login-header.png';

export function SplashScreen() {
  return (
    <div className="min-h-screen bg-[var(--color-primary)] flex flex-col items-center justify-center relative overflow-hidden transition-opacity duration-700 ease-out">
      {/* Círculos de Fundo para dar textura nativa */}
      <div className="absolute top-[-10%] right-[-20%] w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-10%] left-[-20%] w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>

      {/* Conteúdo Central */}
      <div className="flex flex-col items-center animate-pulse duration-[2000ms]">
        <div className="w-48 h-48 sm:w-56 sm:h-56 mb-8 rounded-full overflow-hidden border-4 border-white shadow-2xl bg-white flex items-center justify-center">
          <img
            src={LoginHeaderImg}
            alt="AgendaMed Splash"
            className="w-full h-full object-cover"
          />
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight drop-shadow-md">
          AgendaMed
        </h1>
        <p className="text-blue-100 text-lg mt-3 font-medium drop-shadow-sm">
          Cuidando de quem você ama
        </p>
      </div>
    </div>
  );
}
