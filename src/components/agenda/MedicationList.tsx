import { useState, useMemo } from 'react';
import { CalendarX2 } from 'lucide-react';
import { MedicationCard } from './MedicationCard';

interface MedicationListProps {
  selectedDate: Date;
}

export function MedicationList({ selectedDate }: MedicationListProps) {
  // Dados simulados realistas espalhados em diferentes datas para demonstração.
  const today = new Date();
  const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
  
  const formatDateStr = (d: Date) => d.toISOString().split('T')[0];

  const [medications, setMedications] = useState([
    { id: 1, dateStr: formatDateStr(yesterday), time: '08:00', name: 'Losartana', dosage: '50mg - 1 comprimido', status: 'completed' as const },
    { id: 2, dateStr: formatDateStr(yesterday), time: '20:00', name: 'Sinvastatina', dosage: '20mg - 1 comprimido', status: 'completed' as const },
    { id: 3, dateStr: formatDateStr(today), time: '08:00', name: 'Losartana', dosage: '50mg - 1 comprimido', status: 'completed' as const },
    { id: 4, dateStr: formatDateStr(today), time: '12:00', name: 'Metformina', dosage: '500mg - Após almoço', status: 'late' as const },
    { id: 5, dateStr: formatDateStr(today), time: '20:00', name: 'Sinvastatina', dosage: '20mg - 1 comprimido', status: 'pending' as const },
    { id: 6, dateStr: formatDateStr(tomorrow), time: '08:00', name: 'Losartana', dosage: '50mg - 1 comprimido', status: 'pending' as const },
    { id: 7, dateStr: formatDateStr(tomorrow), time: '12:00', name: 'Metformina', dosage: '500mg - Após almoço', status: 'pending' as const },
    { id: 8, dateStr: formatDateStr(tomorrow), time: '20:00', name: 'Sinvastatina', dosage: '20mg - 1 comprimido', status: 'pending' as const },
  ]);

  const handleCheck = (id: number) => {
    setMedications(prev =>
      prev.map(med =>
        med.id === id ? { ...med, status: 'completed' } : med
      )
    );
  };

  const selectedDateStr = formatDateStr(selectedDate);
  const filteredMedications = useMemo(() => {
    return medications.filter(med => med.dateStr === selectedDateStr);
  }, [medications, selectedDateStr]);

  // Lógica de títulos
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

  return (
    <div className="w-full px-4 pt-6 pb-2 relative z-0 min-h-[40vh]">
      <div className="mb-6 px-2">
        <h3 className="text-xl font-bold text-gray-800">{title}</h3>
        <p className="text-gray-500 font-medium">{subtitle}</p>
      </div>

      <div className="flex flex-col">
        {filteredMedications.length > 0 ? (
          filteredMedications.map((med) => (
            <MedicationCard
              key={med.id}
              time={med.time}
              name={med.name}
              dosage={med.dosage}
              status={med.status}
              onCheck={() => handleCheck(med.id)}
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

      {filteredMedications.length > 0 && (
        <div className="flex items-center justify-center mt-4 mb-8">
          <div className="w-2 h-2 rounded-full bg-gray-300"></div>
        </div>
      )}
    </div>
  );
}
