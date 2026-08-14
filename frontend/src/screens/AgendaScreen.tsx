import { useState } from 'react';
import { Plus, Sparkles, Pill, Calendar } from 'lucide-react';
import { WeeklyCarousel } from '../components/agenda/WeeklyCarousel';
import { MedicationList } from '../components/agenda/MedicationList';
import { ProfileHeader } from '../components/agenda/ProfileHeader';
import { AddMedicationWizard } from '../components/agenda/AddMedicationWizard';
import { useAuth } from '../contexts/AuthContext';

export function AgendaScreen() {
  const { activePatient, user } = useAuth();
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const formattedDateHeader = selectedDate.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  });

  return (
    <div className="w-full">
      {/* ============================================================ */}
      {/* 📱 MODO MOBILE HOMOLOGADO (Visível exclusivamente em < md)     */}
      {/* ============================================================ */}
      <div className="flex flex-col w-full h-full min-h-screen bg-[var(--color-primary)] md:hidden">
        <ProfileHeader />
        
        {/* Container Branco Inferior (Sobrepõe a imagem) */}
        <div className="flex-1 bg-[#F4F7FA] dark:bg-slate-900 rounded-t-[40px] -mt-8 relative z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] pt-2 pb-28">
          <div className="w-12 h-1.5 bg-gray-300 dark:bg-slate-700 rounded-full mx-auto mt-4 mb-2"></div>
          <WeeklyCarousel selectedDate={selectedDate} onDateSelect={setSelectedDate} />
          <MedicationList selectedDate={selectedDate} />
        </div>

        {/* Floating Action Button (FAB Mobile) */}
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-md flex justify-end px-6 z-40 pointer-events-none">
          <button 
            onClick={() => setIsWizardOpen(true)}
            className="w-16 h-16 bg-[var(--color-primary)] text-white rounded-[24px] shadow-lg shadow-[var(--color-primary)]/40 flex items-center justify-center hover:bg-[var(--color-accent)] hover:scale-105 active:scale-95 transition-all duration-300 pointer-events-auto"
          >
            <Plus className="w-8 h-8" />
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 🖥️ MODO DESKTOP & TABLET DEDICADO (Visível a partir de md:)    */}
      {/* ============================================================ */}
      <div className="hidden md:flex flex-col gap-8 w-full pt-2 animate-in fade-in duration-300">
        
        {/* Hero Banner Desktop */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-[#0A2540] rounded-3xl p-6 lg:p-8 text-white shadow-xl relative overflow-hidden flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 border border-slate-800">
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4" />
              <span>Painel de Cuidados Diários</span>
            </div>
            
            <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-white capitalize">
              Agenda de {formattedDateHeader}
            </h1>
            
            <p className="text-sm text-slate-300 mt-1 max-w-xl">
              Acompanhamento em tempo real para <strong className="text-cyan-300 font-bold">{activePatient?.name || 'seu paciente'}</strong>. Confirme as doses administradas e mantenha a família informada.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsWizardOpen(true)}
              className="flex items-center gap-2.5 px-6 py-3.5 bg-[var(--color-primary)] hover:bg-[var(--color-accent)] text-white font-bold text-sm rounded-2xl shadow-lg shadow-[var(--color-primary)]/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="w-5 h-5" />
              <span>Cadastrar Novo Medicamento</span>
            </button>
          </div>

          {/* Efeito luminoso de fundo */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--color-primary)]/15 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Split Grid Desktop: Coluna Lateral (4/12) e Coluna Principal (8/12) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Coluna Esquerda: Calendário & Resumo do Paciente */}
          <div className="lg:col-span-4 flex flex-col gap-6 sticky top-28">
            
            {/* Widget do Calendário */}
            <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-700 shadow-xs">
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> Seleção de Data
                </span>
              </div>
              <WeeklyCarousel selectedDate={selectedDate} onDateSelect={setSelectedDate} />
            </div>

            {/* Widget do Paciente Ativo */}
            {activePatient && (
              <div className="bg-gradient-to-br from-blue-500/5 to-cyan-500/5 dark:from-slate-800/90 dark:to-slate-800/90 p-5 rounded-3xl border border-blue-200/60 dark:border-slate-700 shadow-xs">
                <div className="flex items-center gap-3.5 mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[var(--color-primary)] to-cyan-400 text-white flex items-center justify-center font-black text-lg shadow-md shadow-[var(--color-primary)]/20">
                    {activePatient.name.charAt(0)}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Paciente Ativo</span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">{activePatient.name}</h3>
                  </div>
                </div>
                <div className="pt-3 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Cuidador logado:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{user?.name || 'Cuidador'}</span>
                </div>
              </div>
            )}

          </div>

          {/* Coluna Direita: Linha do Tempo e Lista de Remédios */}
          <div className="lg:col-span-8 bg-white dark:bg-slate-800 p-6 lg:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-700 shadow-xs">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-700/60">
              <div className="flex items-center gap-2">
                <Pill className="w-5 h-5 text-[var(--color-primary)] dark:text-cyan-400" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Prescrições do Dia</h2>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Clique no card para editar ou no círculo para confirmar
              </span>
            </div>

            <MedicationList selectedDate={selectedDate} />
          </div>

        </div>

      </div>

      {/* Modal Wizard de Adicionar Medicamento */}
      {isWizardOpen && (
        <AddMedicationWizard onClose={() => setIsWizardOpen(false)} />
      )}
    </div>
  );
}
