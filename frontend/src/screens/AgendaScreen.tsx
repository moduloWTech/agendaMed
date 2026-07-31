import { useState } from 'react';
import { Plus } from 'lucide-react';
import { WeeklyCarousel } from '../components/agenda/WeeklyCarousel';
import { MedicationList } from '../components/agenda/MedicationList';
import { ProfileHeader } from '../components/agenda/ProfileHeader';
import { AddMedicationWizard } from '../components/agenda/AddMedicationWizard';

export function AgendaScreen() {
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  return (
    <div className="flex flex-col w-full h-full min-h-screen bg-[var(--color-primary)]">
        <ProfileHeader />
        
        {/* Container Branco Inferior (Sobrepõe a imagem) */}
        <div className="flex-1 bg-[#F4F7FA] dark:bg-slate-900 rounded-t-[40px] -mt-8 relative z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] pt-2">
          <div className="w-12 h-1.5 bg-gray-300 dark:bg-slate-700 rounded-full mx-auto mt-4 mb-2"></div>
          <WeeklyCarousel selectedDate={selectedDate} onDateSelect={setSelectedDate} />
          <MedicationList selectedDate={selectedDate} />
        </div>

        {/* Floating Action Button (FAB) */}
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-md flex justify-end px-6 z-40 pointer-events-none">
          <button 
            onClick={() => setIsWizardOpen(true)}
            className="w-16 h-16 bg-[var(--color-primary)] text-white rounded-[24px] shadow-lg shadow-[var(--color-primary)]/40 flex items-center justify-center hover:bg-[var(--color-accent)] hover:scale-105 active:scale-95 transition-all duration-300 pointer-events-auto"
          >
            <Plus className="w-8 h-8" />
          </button>
        </div>

        {/* Wizard Modal */}
        {isWizardOpen && (
          <AddMedicationWizard onClose={() => setIsWizardOpen(false)} />
        )}
      </div>
  );
}
