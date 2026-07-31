import { useState, useEffect } from 'react';
import { Plus, Stethoscope, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
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

  const fetchAppointments = async () => {
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
  };

  useEffect(() => {
    fetchAppointments();
  }, [activePatient]);

  return (
    <div className="flex flex-col w-full min-h-screen bg-gray-50 dark:bg-slate-900 pb-24 relative animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Header */}
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
          <div className="w-14 h-14 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Plus className="w-7 h-7 text-[var(--color-primary)]" />
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
                  {/* Date Badge */}
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
