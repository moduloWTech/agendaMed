import { useState } from 'react';
import { X, Calendar, Clock, MapPin, BellRing, Stethoscope, User, AlignLeft } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { Toggle } from '../ui/Toggle';

interface AddAppointmentModalProps {
  onClose: () => void;
  onSaved: () => void;
  appointment?: any;
}

export function AddAppointmentModal({ onClose, onSaved, appointment }: AddAppointmentModalProps) {
  const { activePatient, user } = useAuth();
  
  const [specialty, setSpecialty] = useState(appointment?.specialty || '');
  const [doctorName, setDoctorName] = useState(appointment?.doctorName || '');
  const [date, setDate] = useState(appointment?.date ? new Date(appointment.date).toISOString().split('T')[0] : '');
  const [time, setTime] = useState(appointment?.time || '');
  const [location, setLocation] = useState(appointment?.location || '');
  const [notes, setNotes] = useState(appointment?.notes || '');
  const [intensiveAlerts, setIntensiveAlerts] = useState(appointment ? appointment.intensiveAlerts : (user?.defaultIntensiveAlerts ?? true));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!activePatient || !specialty || !date || !time) return;
    setIsSaving(true);
    setError('');
    try {
      const payload = {
        patientId: activePatient.id,
        specialty,
        doctorName,
        date,
        time,
        location,
        notes,
        intensiveAlerts,
        alertHoursBefore: parseInt(user?.defaultAlertAdvance?.replace('h', '') || '24')
      };

      if (appointment) {
        await api.put(`/api/appointments/${appointment.id}`, payload);
      } else {
        await api.post('/api/appointments', payload);
      }
      onSaved();
    } catch (error: any) {
      console.error('Erro ao salvar consulta', error);
      setError(error.message || 'Não foi possível salvar a consulta. Verifique os dados.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!appointment) return;
    setIsSaving(true);
    setError('');
    try {
      await api.delete(`/api/appointments/${appointment.id}`);
      onSaved();
    } catch (error: any) {
      console.error('Erro ao excluir consulta', error);
      setError(error.message || 'Não foi possível excluir a consulta.');
      setIsSaving(false);
    }
  };

  const isFormValid = specialty.trim() !== '' && date !== '' && time !== '';

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-4 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white dark:bg-slate-900 w-full max-w-md h-[90vh] sm:h-auto sm:max-h-[90vh] rounded-t-[32px] sm:rounded-[32px] shadow-2xl flex flex-col animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 z-10">
          <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100">{appointment ? 'Detalhes da Consulta' : 'Nova Consulta'}</h2>
          <button onClick={onClose} className="p-2 bg-gray-50 dark:bg-slate-800 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 scrollbar-hide">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs font-semibold rounded-xl border border-red-100">
              {error}
            </div>
          )}
          <div className="space-y-6">
            
            {/* Especialidade */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Especialidade / Exame *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Stethoscope className="w-5 h-5 text-gray-400 dark:text-slate-500" />
                </div>
                <input
                  type="text"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  placeholder="Ex: Cardiologista, Hemograma..."
                  className="w-full bg-[#F8FAFC] dark:bg-slate-800 border-2 border-transparent focus:border-[var(--color-primary)] dark:focus:border-slate-500 rounded-[20px] pl-12 pr-4 py-4 text-gray-800 dark:text-slate-100 font-medium outline-none transition-all"
                />
              </div>
            </div>

            {/* Nome do Médico */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Médico (Opcional)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="w-5 h-5 text-gray-400 dark:text-slate-500" />
                </div>
                <input
                  type="text"
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  placeholder="Nome do profissional"
                  className="w-full bg-[#F8FAFC] dark:bg-slate-800 border-2 border-transparent focus:border-[var(--color-primary)] dark:focus:border-slate-500 rounded-[20px] pl-12 pr-4 py-4 text-gray-800 dark:text-slate-100 font-medium outline-none transition-all"
                />
              </div>
            </div>

            {/* Data e Hora */}
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Data *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Calendar className="w-5 h-5 text-gray-400 dark:text-slate-500" />
                  </div>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-[#F8FAFC] dark:bg-slate-800 border-2 border-transparent focus:border-[var(--color-primary)] dark:focus:border-slate-500 rounded-[20px] pl-12 pr-4 py-4 text-gray-800 dark:text-slate-100 font-medium outline-none transition-all"
                  />
                </div>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Horário *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Clock className="w-5 h-5 text-gray-400 dark:text-slate-500" />
                  </div>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full bg-[#F8FAFC] dark:bg-slate-800 border-2 border-transparent focus:border-[var(--color-primary)] dark:focus:border-slate-500 rounded-[20px] pl-12 pr-4 py-4 text-gray-800 dark:text-slate-100 font-medium outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Local */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Local (Opcional)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <MapPin className="w-5 h-5 text-gray-400 dark:text-slate-500" />
                </div>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Clínica, Hospital ou Endereço"
                  className="w-full bg-[#F8FAFC] dark:bg-slate-800 border-2 border-transparent focus:border-[var(--color-primary)] dark:focus:border-slate-500 rounded-[20px] pl-12 pr-4 py-4 text-gray-800 dark:text-slate-100 font-medium outline-none transition-all"
                />
              </div>
            </div>

            {/* Alerta Intensivo */}
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 rounded-[24px] p-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <BellRing className="w-16 h-16 text-red-500" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <BellRing className="w-5 h-5 text-red-500 dark:text-red-400" />
                    <span className="font-extrabold text-red-700 dark:text-red-400">Alerta Intensivo</span>
                  </div>
                  <Toggle checked={intensiveAlerts} onChange={setIntensiveAlerts} />
                </div>
                <p className="text-sm text-red-600/80 dark:text-red-400/80 font-medium leading-relaxed pr-8">
                  Ative para receber avisos em cascata 45, 30 e 15 minutos antes da consulta. Ideal para compromissos imperdíveis.
                </p>
              </div>
            </div>

            {/* Anotações */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Anotações extras</label>
              <div className="relative">
                <div className="absolute top-4 left-0 pl-4 flex items-start pointer-events-none">
                  <AlignLeft className="w-5 h-5 text-gray-400 dark:text-slate-500" />
                </div>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Chegar com 30 minutos de antecedência, levar identidade..."
                  rows={3}
                  className="w-full bg-[#F8FAFC] dark:bg-slate-800 border-2 border-transparent focus:border-[var(--color-primary)] dark:focus:border-slate-500 rounded-[20px] pl-12 pr-4 py-4 text-gray-800 dark:text-slate-100 font-medium outline-none transition-all resize-none"
                />
              </div>
            </div>

          </div>
          
          {/* Footer margin */}
          <div className="h-10" />
        </div>

        {/* Footer com Botões */}
        <div className="p-6 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 z-10 flex gap-3">
          {appointment && (
            <button 
              onClick={handleDelete}
              disabled={isSaving}
              className="py-4 px-6 bg-red-50 dark:bg-red-900/50 text-red-500 dark:text-red-400 font-bold text-lg rounded-2xl hover:bg-red-100 dark:hover:bg-red-900 transition-all disabled:opacity-50"
            >
              Excluir
            </button>
          )}
          <button 
            onClick={handleSave}
            disabled={!isFormValid || isSaving}
            className="flex-1 py-4 bg-[var(--color-primary)] text-white font-bold text-lg rounded-2xl shadow-lg shadow-[var(--color-primary)]/30 hover:bg-[var(--color-accent)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Salvando...' : (appointment ? 'Salvar Alterações' : 'Agendar Consulta')}
          </button>
        </div>

      </div>
    </div>
  );
}
