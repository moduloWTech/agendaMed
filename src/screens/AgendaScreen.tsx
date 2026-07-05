import { AuthLayout } from '../components/layout/AuthLayout';
import { WeeklyCarousel } from '../components/agenda/WeeklyCarousel';
import { MedicationList } from '../components/agenda/MedicationList';
import { ProfileHeader } from '../components/agenda/ProfileHeader';

export function AgendaScreen() {
  return (
    <AuthLayout>
      <div className="flex flex-col w-full h-full min-h-screen bg-[var(--color-primary)]">
        <ProfileHeader />
        
        {/* Container Branco Inferior (Sobrepõe a imagem) */}
        <div className="flex-1 bg-[#F4F7FA] rounded-t-[40px] -mt-8 relative z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] pt-2">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mt-4 mb-2"></div>
          <WeeklyCarousel />
          <MedicationList />
        </div>
      </div>
    </AuthLayout>
  );
}
