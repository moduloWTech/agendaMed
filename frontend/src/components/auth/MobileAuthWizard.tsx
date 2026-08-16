import { useState } from 'react';
import { Sparkles, Phone, Mail, Lock, Eye, EyeOff, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import logoImg from '../../assets/logo.png';

interface MobileAuthWizardProps {
  onShowOnboarding: () => void;
}

export function MobileAuthWizard({ onShowOnboarding }: MobileAuthWizardProps) {
  const { login, register, loginWithGoogle } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3>(1);

  // Form Fields
  const [name, setName] = useState('');
  const [phoneWhats, setPhoneWhats] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Status & Feedback
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Formata telefone para exibição: (11) 99999-9999
  const formatPhone = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 11);
    if (raw.length <= 2) return raw;
    if (raw.length <= 6) return `(${raw.slice(0, 2)}) ${raw.slice(2)}`;
    if (raw.length <= 10) return `(${raw.slice(0, 2)}) ${raw.slice(2, 6)}-${raw.slice(6)}`;
    return `(${raw.slice(0, 2)}) ${raw.slice(2, 7)}-${raw.slice(7, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawDigits = e.target.value.replace(/\D/g, '').slice(0, 11);
    setPhoneWhats(rawDigits);
  };

  // Submissão do Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsLoading(true);
    setErrorMsg('');

    try {
      await login(email, password);
    } catch (err: any) {
      setErrorMsg(err.message || 'Falha no login. Verifique seu e-mail e senha.');
    } finally {
      setIsLoading(false);
    }
  };

  // Submissão do Cadastro (Final Step)
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phoneWhats || !email || !password) return;
    setIsLoading(true);
    setErrorMsg('');

    try {
      await register({ name, email, phoneWhats, password });
    } catch (err: any) {
      setErrorMsg(err.message || 'Falha ao criar conta. Verifique os dados informados.');
    } finally {
      setIsLoading(false);
    }
  };

  // Login com Google
  const handleGoogleSuccess = async (credentialResponse: any) => {
    if (!credentialResponse.credential) return;
    setIsLoading(true);
    setErrorMsg('');
    try {
      await loginWithGoogle(credentialResponse.credential);
    } catch (err: any) {
      setErrorMsg(err.message || 'Falha na autenticação com Google.');
    } finally {
      setIsLoading(false);
    }
  };

  // Avançar / Voltar no Wizard
  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (wizardStep === 1 && name.trim().length >= 2) {
      setWizardStep(2);
    } else if (wizardStep === 2 && phoneWhats.length >= 10) {
      setWizardStep(3);
    }
  };

  const handlePrevStep = () => {
    setErrorMsg('');
    if (wizardStep > 1) {
      setWizardStep((prev) => (prev - 1) as any);
    } else {
      setMode('login');
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-950 via-slate-900 to-[#0c1c2e] text-white flex flex-col justify-between p-5 sm:p-7 relative overflow-hidden">
      
      {/* Background ambient lighting */}
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-rose-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Progress Bar (Visible in Register Mode) */}
      {mode === 'register' && (
        <div className="fixed top-0 left-0 right-0 h-1.5 bg-slate-800 z-50">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 to-rose-500 transition-all duration-300 ease-out"
            style={{ width: `${(wizardStep / 3) * 100}%` }}
          />
        </div>
      )}

      {/* Header Navigation */}
      <div className="relative z-10 flex items-center justify-between pt-2">
        {mode === 'register' ? (
          <button
            type="button"
            onClick={handlePrevStep}
            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 active:scale-95 transition-all cursor-pointer"
            aria-label="Voltar etapa anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        ) : (
          <div className="w-10 h-10" />
        )}

        <div className="flex items-center gap-2">
          <img src={logoImg} alt="AgendaMed" className="w-8 h-8 rounded-xl object-contain shadow-lg shadow-cyan-500/20" />
          <span className="font-black tracking-tight text-white text-lg">AgendaMed</span>
        </div>

        {mode === 'register' ? (
          <span className="text-xs font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 rounded-full">
            {wizardStep}/3
          </span>
        ) : (
          <div className="w-10 h-10" />
        )}
      </div>

      {/* Main Form Content */}
      <div className="relative z-10 my-auto py-4 max-w-sm mx-auto w-full">
        
        {/* ============================================================ */}
        {/* 📱 FLUXO 1: LOGIN (Entrar)                                  */}
        {/* ============================================================ */}
        {mode === 'login' && (
          <div className="animate-in fade-in zoom-in-95 duration-300 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-xl shadow-cyan-500/10 mb-4">
              <Lock className="w-8 h-8" />
            </div>

            <h2 className="text-2xl font-black text-white tracking-tight">Acesse sua conta</h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-xs">
              Entre para acompanhar a rotina e os medicamentos da sua família.
            </p>

            {/* Google One-Tap / Button */}
            <div className="w-full mt-6 mb-4 flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setErrorMsg('Falha ao conectar com o Google.')}
                shape="pill"
                theme="filled_blue"
                size="large"
                text="signin_with"
                width="100%"
              />
            </div>

            <div className="relative flex py-2 items-center w-full">
              <div className="flex-grow border-t border-white/10"></div>
              <span className="flex-shrink-0 mx-4 text-slate-400 text-[11px] uppercase font-bold tracking-wider">
                ou com e-mail
              </span>
              <div className="flex-grow border-t border-white/10"></div>
            </div>

            <form onSubmit={handleLoginSubmit} className="w-full flex flex-col gap-3.5 mt-2">
              <div className="text-left">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">E-mail</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/80 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-sm transition-all"
                  />
                </div>
              </div>

              <div className="text-left">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Senha</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-11 py-3 rounded-xl bg-slate-900/80 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-sm transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs text-left leading-relaxed">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !email || !password}
                className="w-full mt-2 py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 active:scale-[0.98] text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>Acessar Conta</span>
                )}
              </button>
            </form>

            <div className="mt-5 flex flex-col items-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setWizardStep(1);
                  setErrorMsg('');
                }}
                className="text-xs text-slate-300 hover:text-cyan-300 font-medium transition-colors cursor-pointer"
              >
                Não tem uma conta? <span className="text-cyan-400 font-bold underline underline-offset-4">Criar conta familiar</span>
              </button>

              <button
                type="button"
                onClick={onShowOnboarding}
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors py-1 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Ver apresentação do app</span>
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* 📱 FLUXO 2: CADASTRO PASSO A PASSO (Wizard)                  */}
        {/* ============================================================ */}
        {mode === 'register' && (
          <div>
            {/* ETAPA 1: NOME */}
            {wizardStep === 1 && (
              <form onSubmit={handleNextStep} className="animate-in fade-in zoom-in-95 duration-300 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-xl shadow-cyan-500/10 mb-4">
                  <Sparkles className="w-8 h-8" />
                </div>

                <h2 className="text-2xl font-black text-white tracking-tight">Como você se chama?</h2>
                <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-xs">
                  Vamos começar com o seu nome completo.
                </p>

                {/* Google Quick Signup */}
                <div className="w-full mt-6 mb-4 flex justify-center">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => setErrorMsg('Falha ao conectar com o Google.')}
                    shape="pill"
                    theme="filled_blue"
                    size="large"
                    text="signup_with"
                    width="100%"
                  />
                </div>

                <div className="relative flex py-2 items-center w-full">
                  <div className="flex-grow border-t border-white/10"></div>
                  <span className="flex-shrink-0 mx-4 text-slate-400 text-[11px] uppercase font-bold tracking-wider">
                    ou digite seu nome
                  </span>
                  <div className="flex-grow border-t border-white/10"></div>
                </div>

                <div className="w-full text-left mt-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Nome Completo</label>
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="Ex: Maria Silva"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl bg-slate-900/80 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-sm transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={name.trim().length < 2}
                  className="w-full mt-6 py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 active:scale-[0.98] text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Continuar</span>
                  <ChevronRight className="w-4 h-4" />
                </button>

                <div className="mt-6 flex flex-col items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="text-xs text-slate-300 hover:text-cyan-300 font-medium transition-colors cursor-pointer"
                  >
                    Já tem uma conta? <span className="text-cyan-400 font-bold underline underline-offset-4">Fazer Login</span>
                  </button>
                </div>
              </form>
            )}

            {/* ETAPA 2: WHATSAPP */}
            {wizardStep === 2 && (
              <form onSubmit={handleNextStep} className="animate-in fade-in zoom-in-95 duration-300 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-500/10 mb-4">
                  <Phone className="w-8 h-8" />
                </div>

                <h2 className="text-2xl font-black text-white tracking-tight">Qual seu WhatsApp?</h2>
                <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-xs">
                  Usaremos para alertas importantes e comunicação da família.
                </p>

                <div className="w-full text-left mt-6">
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">WhatsApp (com DDD)</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      autoFocus
                      placeholder="(11) 99999-9999"
                      value={formatPhone(phoneWhats)}
                      onChange={handlePhoneChange}
                      maxLength={15}
                      className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-slate-900/80 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 text-sm transition-all tracking-wide font-medium"
                    />
                  </div>
                  <span className="text-[11px] text-slate-500 mt-1 block">Apenas números (DDD + 9 dígitos)</span>
                </div>

                <button
                  type="submit"
                  disabled={phoneWhats.length < 10}
                  className="w-full mt-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Continuar</span>
                  <ChevronRight className="w-4 h-4" />
                </button>

                <div className="mt-6 flex flex-col items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="text-xs text-slate-300 hover:text-emerald-300 font-medium transition-colors cursor-pointer"
                  >
                    Já tem uma conta? <span className="text-emerald-400 font-bold underline underline-offset-4">Fazer Login</span>
                  </button>
                </div>
              </form>
            )}

            {/* ETAPA 3: EMAIL E SENHA */}
            {wizardStep === 3 && (
              <form onSubmit={handleRegisterSubmit} className="animate-in fade-in zoom-in-95 duration-300 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-xl shadow-rose-500/10 mb-4">
                  <Mail className="w-8 h-8" />
                </div>

                <h2 className="text-2xl font-black text-white tracking-tight">Como você vai acessar?</h2>
                <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-xs">
                  Crie suas credenciais para entrar com total segurança.
                </p>

                <div className="w-full flex flex-col gap-3.5 mt-5">
                  <div className="text-left">
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">E-mail</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        autoFocus
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/80 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400 text-sm transition-all"
                      />
                    </div>
                  </div>

                  <div className="text-left">
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Criar Senha</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        placeholder="Mínimo 6 caracteres"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-11 py-3 rounded-xl bg-slate-900/80 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400 text-sm transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white cursor-pointer"
                        aria-label={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {errorMsg && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs text-left leading-relaxed">
                      {errorMsg}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading || !email || password.length < 6}
                    className="w-full mt-2 py-3.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-400 hover:to-pink-400 active:scale-[0.98] text-white font-bold text-sm shadow-lg shadow-rose-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Concluir Cadastro</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="mt-5 flex flex-col items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="text-xs text-slate-300 hover:text-rose-300 font-medium transition-colors cursor-pointer"
                  >
                    Já tem uma conta? <span className="text-rose-400 font-bold underline underline-offset-4">Fazer Login</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>

      {/* Footer Legal Terms */}
      <div className="relative z-10 pt-2 text-center">
        <p className="text-[10px] text-slate-500 leading-tight">
          Ao continuar, você concorda com nossos <span className="underline">Termos de Uso</span> e <span className="underline">Política de Privacidade</span>.
        </p>
      </div>
    </div>
  );
}
