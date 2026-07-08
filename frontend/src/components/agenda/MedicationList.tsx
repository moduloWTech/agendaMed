import { useState, useMemo, useEffect } from 'react';
import { CalendarX2 } from 'lucide-react';
import { MedicationCard } from './MedicationCard';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  instructions: string;
  frequency: string;
  startDate: string;
  startTime: string;
  times: string[];
  active: boolean;
  photoUrl?: string;
}

interface MedicationListProps {
  selectedDate: Date;
}

export function MedicationList({ selectedDate }: MedicationListProps) {
  const { activePatient } = useAuth();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function fetchMedications() {
      if (!activePatient) return;
      try {
        const data = await api.get(`/api/patients/${activePatient.id}/medications`);
        setMedications(data || []);
      } catch (error) {
        console.error('Falha ao buscar medicamentos', error);
      }
    }
    fetchMedications();
  }, [activePatient]);

  const formatDateStr = (d: Date) => d.toISOString().split('T')[0];
  const selectedDateStr = formatDateStr(selectedDate);
  const today = new Date();
  
  const generatedSchedule = useMemo(() => {
    if (!medications || medications.length === 0) return [];
    
    const schedule: any[] = [];
    
    medications.forEach(med => {
      // Extrair YYYY-MM-DD da string ISO para ignorar conversão de fuso horário que poderia voltar 1 dia
      const [year, month, day] = med.startDate.split('T')[0].split('-').map(Number);
      const start = new Date(year, month - 1, day);
      start.setHours(0,0,0,0);
      
      const target = new Date(selectedDate);
      target.setHours(0,0,0,0);

      if (med.active && target.getTime() >= start.getTime()) {
        let times: string[] = [];

        // Lógica de geração de horários baseada na frequência
        if (med.frequency === 'manual' && med.times && med.times.length > 0) {
          times = med.times;
        } else if (med.frequency === 'daily' || med.frequency === 'single') {
          times = [med.startTime];
        } else if (med.frequency === '12h' || med.frequency === '8h' || med.frequency === '6h' || med.frequency === '4h') {
          const interval = parseInt(med.frequency.replace('h', ''));
          const [startHour, startMinute] = med.startTime.split(':').map(Number);
          
          let currentHour = startHour;
          while (currentHour < 24) {
            const timeStr = `${currentHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`;
            times.push(timeStr);
            currentHour += interval;
          }
        } else {
          // Fallback seguro
          times = (med.times && med.times.length > 0) ? med.times : [med.startTime];
        }

        times.forEach((time: string) => {
          const uniqueId = `${med.id}-${selectedDateStr}-${time}`;
          const isCompleted = completedIds.has(uniqueId);
          schedule.push({
            uniqueId,
            id: med.id,
            time,
            name: med.name,
            dosage: med.dosage,
            instructions: med.instructions,
            frequency: med.frequency,
            times: med.times,
            status: isCompleted ? 'completed' : 'pending'
          });
        });
      }
    });

    return schedule.sort((a, b) => a.time.localeCompare(b.time));
  }, [medications, selectedDate, selectedDateStr, completedIds]);

  const handleCheck = (uniqueId: string) => {
    setCompletedIds(prev => {
      const next = new Set(prev);
      if (next.has(uniqueId)) next.delete(uniqueId);
      else next.add(uniqueId);
      return next;
    });
  };

  const isToday = selectedDateStr === formatDateStr(today);
  const isPast = selectedDate.getTime() < new Date(today.setHours(0,0,0,0)).getTime();
  
  let title = "Medicamentos de Hoje";
  let subtitle = "Acompanhe a rotina diária";
  
  if (!isToday) {
    if (isPast) {
      title = "Histórico do Dia";
      subtitle = "Medicamentos que já foram tomados";
    } else {
      title = "Agendados";
      subtitle = "Próximos medicamentos programados";
    }
  }

  if (!activePatient) {
    return (
      <div className="w-full px-4 pt-12 pb-2 flex flex-col items-center justify-center text-center">
        <CalendarX2 className="w-12 h-12 text-gray-300 mb-4" />
        <p className="text-gray-500 font-medium">Selecione ou crie um paciente no Perfil para ver a agenda.</p>
      </div>
    );
  }

  return (
    <div className="w-full px-4 pt-6 pb-2 relative z-0 min-h-[40vh]">
      <div className="mb-6 px-2">
        <h3 className="text-xl font-bold text-gray-800">{title}</h3>
        <p className="text-gray-500 font-medium">{subtitle}</p>
      </div>

      <div className="flex flex-col">
        {generatedSchedule.length > 0 ? (
          generatedSchedule.map((med) => (
            <MedicationCard
              key={med.uniqueId}
              time={med.time}
              name={med.name}
              dosage={med.dosage}
              instructions={med.instructions}
              frequency={med.frequency}
              status={med.status}
              onCheck={() => handleCheck(med.uniqueId)}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center animate-in fade-in duration-500">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <CalendarX2 className="w-10 h-10 text-gray-400" />
            </div>
            <h4 className="text-lg font-bold text-gray-700 mb-2">Dia Livre</h4>
            <p className="text-gray-500 text-sm">
              Nenhum medicamento agendado para esta data.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
