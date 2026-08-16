import { useState, useEffect } from 'react';
import { LoginForm } from '../components/auth/LoginForm';
import { MobileOnboarding } from '../components/onboarding/MobileOnboarding';
import { MobileAuthWizard } from '../components/auth/MobileAuthWizard';
import { Pill, Users, FileText, ShieldCheck, CheckCircle2, Heart } from 'lucide-react';

export function LoginScreen() {
  const [mobileView, setMobileView] = useState<'onboarding' | 'auth'>('auth');

  useEffect(() => {
    const isCompleted = localStorage.getItem('agendamed_onboarding_completed') === 'true';
    if (!isCompleted) {
      setMobileView('onboarding');
    }
  }, []);

  return (
    <div className="min-h-screen w-full bg-slate-900 overflow-x-hidden">
      
      {/* ============================================================ */}
      {/* 📱 MOBILE EXCLUSIVE VIEW (< md:)                             */}
      {/* ============================================================ */}
      <div className="block md:hidden min-h-screen w-full">
        {mobileView === 'onboarding' ? (
          <MobileOnboarding
            onComplete={() => setMobileView('auth')}
            onGoToLogin={() => setMobileView('auth')}
          />
        ) : (
          <MobileAuthWizard
            onShowOnboarding={() => setMobileView('onboarding')}
          />
        )}
      </div>

      {/* ============================================================ */}
      {/* 🖥️ DESKTOP & TABLET VIEW (Visible on md:)                    */}
      {/* ============================================================ */}
      <div className="hidden md:flex min-h-screen w-full flex-row">
        
        {/* Left Hero Panel */}
        <div className="md:w-1/2 lg:w-3/5 bg-gradient-to-br from-slate-950 via-slate-900 to-[#0c243c] text-white p-8 lg:p-14 flex flex-col justify-between relative overflow-hidden shrink-0">
          {/* Glow ambient backgrounds */}
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-[var(--color-primary)]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-cyan-600/20 rounded-full blur-3xl pointer-events-none" />

          {/* Top Logo Branding */}
          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[var(--color-primary)] to-cyan-400 flex items-center justify-center shadow-lg shadow-[var(--color-primary)]/30">
                <Heart className="w-6 h-6 text-white fill-white/20" />
              </div>
              <div>
                <span className="text-2xl font-black tracking-tight text-white block">AgendaMed</span>
                <span className="text-[11px] font-bold text-cyan-300 uppercase tracking-widest block">Plataforma de Cuidados em Saúde</span>
              </div>
            </div>
          </div>

          {/* Center Hero Content & Value Prop */}
          <div className="relative z-10 my-auto py-8 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-cyan-200 mb-6">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <span>Rotina de saúde 100% sob controle</span>
            </div>

            <h1 className="text-3xl lg:text-5xl font-black tracking-tight text-white leading-tight mb-4">
              Cuidado e carinho em família com <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-[var(--color-accent)]">tecnologia e precisão.</span>
            </h1>

            <p className="text-slate-300 text-sm lg:text-base leading-relaxed mb-8">
              Acompanhe a administração de medicamentos no horário exato, coordene cuidadores e familiares na mesma escala e gere laudos clínicos para médicos.
            </p>

            {/* 4 Feature Badges Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 flex items-start gap-3 hover:bg-white/10 transition-colors">
                <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 shrink-0">
                  <Pill className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Alertas de Medicação</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Notificações no minuto exato para cada remédio.</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 flex items-start gap-3 hover:bg-white/10 transition-colors">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Equipe Multidisciplinar</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Plantonistas e familiares sincronizados.</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 flex items-start gap-3 hover:bg-white/10 transition-colors">
                <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Relatórios em PDF</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Laudos prontos com taxa de adesão clínica.</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 flex items-start gap-3 hover:bg-white/10 transition-colors">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Segurança & LGPD</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Acesso restrito com permissões de administrador.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Footer Assurance */}
          <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
            <span>© {new Date().getFullYear()} AgendaMed • Todos os direitos reservados</span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Ambiente Criptografado
            </span>
          </div>
        </div>

        {/* Right Auth Panel */}
        <div className="md:w-1/2 lg:w-2/5 flex items-center justify-center bg-slate-950/40 backdrop-blur-xl p-8 lg:p-12 relative z-10">
          <LoginForm />
        </div>

      </div>

    </div>
  );
}
