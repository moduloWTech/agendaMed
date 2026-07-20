import { useState } from 'react';
import { SplashScreen } from './screens/SplashScreen';
import { LoginScreen } from './screens/LoginScreen';
import { PatientSetupScreen } from './screens/PatientSetupScreen';
import { AgendaScreen } from './screens/AgendaScreen';
import { VaultScreen } from './screens/VaultScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { AppointmentsScreen } from './screens/AppointmentsScreen';
import { AuthLayout } from './components/layout/AuthLayout';
import { useAuth } from './contexts/AuthContext';

export default function App() {
  const { isAuthenticated, activePatient, isLoading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'agenda' | 'consultas' | 'cofre' | 'perfil'>('agenda');
  if (isLoading) {
    return <SplashScreen />;
  }

  if (isAuthenticated) {
    if (!activePatient) {
      return <PatientSetupScreen />;
    }

    let CurrentScreen = <AgendaScreen />;
    if (activeTab === 'consultas') CurrentScreen = <AppointmentsScreen />;
    if (activeTab === 'cofre') CurrentScreen = <VaultScreen />;
    if (activeTab === 'perfil') CurrentScreen = <ProfileScreen onLogout={logout} />;

    return (
      <AuthLayout currentTab={activeTab} onChangeTab={setActiveTab}>
        {CurrentScreen}
      </AuthLayout>
    );
  }

  return <LoginScreen />;
}
