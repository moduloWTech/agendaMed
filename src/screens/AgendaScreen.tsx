import { AuthLayout } from '../components/layout/AuthLayout';
import { WeeklyCarousel } from '../components/agenda/WeeklyCarousel';
import { MedicationList } from '../components/agenda/MedicationList';

export function AgendaScreen() {
  return (
    <AuthLayout>
      <div className="flex flex-col w-full h-full bg-gray-50 min-h-screen">
        <WeeklyCarousel />
        <MedicationList />
      </div>
    </AuthLayout>
  );
}
