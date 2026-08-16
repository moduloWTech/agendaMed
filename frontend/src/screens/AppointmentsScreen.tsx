import { useState, useEffect, useCallback } from 'react';
import { Plus, Stethoscope, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { useRealtimeSync } from '../services/supabase';
import { AddAppointmentModal } from '../components/appointments/AddAppointmentModal';

interface Appointment {
  id: string;
  specialty: string;
  doctorName?: string;
  date: string;
  time: string;
  location?: string;
  notes?: string;
  alertEnabled: boolean;
  alertHoursBefore: number;
  intensiveAlerts: boolean;
}

export function AppointmentsScreen() {
  const { activePatient } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  const fetchAppointments = useCallback(async () => {
    if (!activePatient) return;
    try {
      setIsLoading(true);
      const data = await api.get(`/api/patients/${activePatient.id}/appointments`);
      setAppointments(data);
    } catch (error) {
      console.error('Erro ao buscar consultas', error);
    } finally {
      setIsLoading(false);
    }
  }, [activePatient]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Sincronização em tempo real multi-dispositivo para Consultas
  useRealtimeSync(['Appointment'], fetchAppointments);

  return (
    <div className="w-full">
      {/* ============================================================ */}
      {/* 📱 MODO MOBILE HOMOLOGADO (Visível exclusivamente em < md)     */}
      {/* ============================================================ */}
      <div className="flex flex-col w-full min-h-screen bg-gray-50 dark:bg-slate-900 pb-24 relative md:hidden animate-in fade-in duration-300">
        {/* Header Mobile */}
        <div className="w-full bg-[var(--color-primary)] pt-12 pb-6 px-6 rounded-b-[40px] shadow-lg sticky top-0 z-20">
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">Consultas</h1>
          <p className="text-white/80 font-medium">Agende e acompanhe os exames de {activePatient?.name || 'seu familiar'}.</p>
        </div>

        <div className="w-full max-w-md mx-auto px-6 pt-6 z-10 flex-1">
          {/* Adicionar Nova Consulta Button */}
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="w-full bg-white dark:bg-slate-800 border-2 border-dashed border-[var(--color-primary)]/30 dark:border-[var(--color-primary)]/40 rounded-3xl p-5 flex flex-col items-center justify-center gap-3 text-[var(--color-primary)] dark:text-slate-200 hover:bg-[var(--color-primary)]/5 dark:hover:bg-slate-700 hover:border-[var(--color-primary)]/50 transition-all shadow-sm hover:shadow-md mb-8 group"
          >
            <div className="w-14 h-14 rounded-full bg-[var(--color-primary)]/10 dark:bg-slate-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Plus className="w-7 h-7 text-[var(--color-primary)] dark:text-slate-200" />
            </div>
            <span className="font-bold text-lg">Nova Consulta</span>
          </button>

          <h2 className="text-sm font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-4 px-2">Próximos Agendamentos</h2>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-10 opacity-60">
              <div className="w-10 h-10 border-4 border-[var(--color-primary)]/30 border-t-[var(--color-primary)] rounded-full animate-spin mb-4" />
              <p className="text-gray-500 dark:text-slate-400 font-medium">Carregando consultas...</p>
            </div>
          ) : appointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white dark:bg-slate-800 rounded-[32px] border border-gray-100 dark:border-slate-700 shadow-sm">
              <div className="w-20 h-20 bg-gray-50 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4">
                <Stethoscope className="w-10 h-10 text-gray-300 dark:text-slate-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-slate-100 mb-2">Nenhuma consulta agendada</h3>
              <p className="text-gray-500 dark:text-slate-400 text-sm">Todas as consultas e exames marcados aparecerão aqui.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {appointments.map(apt => {
                const aptDate = new Date(apt.date);
                const day = aptDate.getDate().toString().padStart(2, '0');
                const month = aptDate.toLocaleString('pt-BR', { month: 'short' }).replace('.', '');
                const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1);
                
                return (
                  <div 
                    key={apt.id} 
                    onClick={() => setSelectedAppointment(apt)}
                    className="bg-white dark:bg-slate-800 rounded-[32px] p-5 shadow-sm border border-gray-100 dark:border-slate-700 flex gap-4 hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="w-16 h-20 rounded-2xl bg-[var(--color-primary)]/10 flex flex-col items-center justify-center shrink-0">
                      <span className="text-2xl font-black text-[var(--color-primary)] leading-none">{day}</span>
                      <span className="text-xs font-bold text-[var(--color-primary)]/80 uppercase mt-1">{capitalizedMonth}</span>
                    </div>

                    <div className="flex-1 min-w-0 py-1">
                      <h3 className="text-lg font-bold text-gray-800 dark:text-slate-100 truncate mb-1">{apt.specialty}</h3>
                      {apt.doctorName && <p className="text-gray-600 dark:text-slate-300 font-medium text-sm truncate mb-2">Dr(a). {apt.doctorName}</p>}
                      
                      <div className="flex items-center gap-4 mt-auto">
                        <div className="flex items-center gap-1.5 text-gray-500 dark:text-slate-400">
                          <Clock className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                          <span className="text-sm font-semibold">{apt.time}</span>
                        </div>
                        {apt.intensiveAlerts && (
                          <span className="px-2 py-0.5 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/50 rounded-full text-[10px] font-bold uppercase tracking-wider">
                            Alerta Intensivo
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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
              <Stethoscope className="w-4 h-4" />
              <span>Painel de Especialidades Médicas</span>
            </div>
            
            <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-white">
              Consultas & Exames • {activePatient?.name || 'Paciente'}
            </h1>
            
            <p className="text-sm text-slate-300 mt-1 max-w-xl">
              Organize consultas especializadas, locais de atendimento e configure alertas intensivos com antecedência para toda a equipe.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2.5 px-6 py-3.5 bg-[var(--color-primary)] hover:bg-[var(--color-accent)] text-white font-bold text-sm rounded-2xl shadow-lg shadow-[var(--color-primary)]/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="w-5 h-5" />
              <span>Agendar Nova Consulta</span>
            </button>
          </div>

          {/* Glow decorativo de fundo */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--color-primary)]/15 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Content Container */}
        <div className="w-full">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              Próximos Compromissos Agendados ({appointments.length})
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Clique em qualquer card para ver detalhes ou editar
            </span>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700">
              <div className="w-10 h-10 border-4 border-[var(--color-primary)]/30 border-t-[var(--color-primary)] rounded-full animate-spin mb-4" />
              <p className="text-gray-500 dark:text-slate-400 font-medium">Carregando consultas...</p>
            </div>
          ) : appointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700 shadow-xs">
              <div className="w-20 h-20 bg-blue-50 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4 text-[var(--color-primary)] dark:text-cyan-400">
                <Stethoscope className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Nenhuma consulta agendada</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mb-6">
                Todas as consultas com médicos, exames laboratoriais e retornos aparecerão organizados aqui.
              </p>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-6 py-3 bg-[var(--color-primary)] text-white font-bold text-sm rounded-xl shadow-md hover:bg-[var(--color-accent)] transition-all cursor-pointer"
              >
                + Agendar a Primeira Consulta
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {appointments.map(apt => {
                const aptDate = new Date(apt.date);
                const day = aptDate.getDate().toString().padStart(2, '0');
                const month = aptDate.toLocaleString('pt-BR', { month: 'short' }).replace('.', '');
                const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1);
                const weekday = aptDate.toLocaleDateString('pt-BR', { weekday: 'long' });

                return (
                  <div 
                    key={apt.id} 
                    onClick={() => setSelectedAppointment(apt)}
                    className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-xs hover:shadow-lg border border-slate-200/80 dark:border-slate-700 flex flex-col justify-between transition-all duration-300 cursor-pointer group hover:-translate-y-1"
                  >
                    <div>
                      {/* Top Header Card: Date Badge & Specialty */}
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/40 flex flex-col items-center justify-center shrink-0">
                          <span className="text-2xl font-black text-[var(--color-primary)] dark:text-cyan-400 leading-none">{day}</span>
                          <span className="text-[11px] font-bold text-[var(--color-primary)]/80 dark:text-cyan-300 uppercase mt-0.5">{capitalizedMonth}</span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block capitalize">{weekday}</span>
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate group-hover:text-[var(--color-primary)] dark:group-hover:text-cyan-400 transition-colors">
                            {apt.specialty}
                          </h3>
                          {apt.doctorName && (
                            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 truncate mt-0.5">
                              Dr(a). {apt.doctorName}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Info Pills */}
                      <div className="space-y-2.5 pt-3 border-t border-slate-100 dark:border-slate-700/60 text-xs">
                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold">
                          <Clock className="w-4 h-4 text-blue-500 dark:text-cyan-400 shrink-0" />
                          <span>Horário: {apt.time}</span>
                        </div>

                        {apt.location && (
                          <div className="flex items-start gap-2 text-slate-600 dark:text-slate-400">
                            <span className="shrink-0 text-sm">📍</span>
                            <span className="truncate">{apt.location}</span>
                          </div>
                        )}

                        {apt.notes && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 line-clamp-2 italic">
                            "{apt.notes}"
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Bottom Status Badge */}
                    <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                      {apt.intensiveAlerts ? (
                        <span className="px-2.5 py-1 bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/40 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" /> Alerta Intensivo
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                          Alerta Padrão
                        </span>
                      )}

                      <span className="text-xs font-bold text-[var(--color-primary)] dark:text-cyan-400 group-hover:underline">
                        Ver Detalhes ➔
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* Modal de Adicionar/Editar Consulta */}
      {(isAddModalOpen || selectedAppointment) && (
        <AddAppointmentModal 
          appointment={selectedAppointment}
          onClose={() => {
            setIsAddModalOpen(false);
            setSelectedAppointment(null);
          }} 
          onSaved={() => {
            setIsAddModalOpen(false);
            setSelectedAppointment(null);
            fetchAppointments();
          }} 
        />
      )}
    </div>
  );
}
