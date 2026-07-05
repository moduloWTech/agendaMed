import { useState } from 'react';
import { MedicationCard } from './MedicationCard';

// Dados simulados para demonstração
const initialMedications = [
  { id: 1, time: '08:00', name: 'Losartana', dosage: '50mg - 1 comprimido', status: 'completed' as const },
  { id: 2, time: '12:00', name: 'Metformina', dosage: '500mg - 1 comprimido após o almoço', status: 'late' as const },
  { id: 3, time: '20:00', name: 'Sinvastatina', dosage: '20mg - 1 comprimido', status: 'pending' as const },
];

export function MedicationList() {
  const [medications, setMedications] = useState(initialMedications);

  const handleCheck = (id: number) => {
    setMedications(prev =>
      prev.map(med =>
        med.id === id ? { ...med, status: 'completed' } : med
      )
    );
  };

  return (
    <div className="w-full px-4 pt-6 pb-2 relative z-0">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-800">Medicamentos de Hoje</h3>
        <p className="text-gray-500 font-medium">Acompanhe a rotina diária</p>
      </div>

      <div className="flex flex-col">
        {medications.map((med) => (
          <MedicationCard
            key={med.id}
            time={med.time}
            name={med.name}
            dosage={med.dosage}
            status={med.status}
            onCheck={() => handleCheck(med.id)}
          />
        ))}
      </div>

      {/* Indicador de Final do Dia */}
      <div className="flex items-center justify-center mt-4 mb-8">
        <div className="w-2 h-2 rounded-full bg-gray-300"></div>
      </div>
    </div>
  );
}
