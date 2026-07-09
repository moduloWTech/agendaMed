import { useState, useEffect } from 'react';
import { SplashScreen } from './screens/SplashScreen';
import { LoginScreen } from './screens/LoginScreen';
import { AgendaScreen } from './screens/AgendaScreen';
import { VaultScreen } from './screens/VaultScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { AppointmentsScreen } from './screens/AppointmentsScreen';
import { AuthLayout } from './components/layout/AuthLayout';
import { useAuth } from './contexts/AuthContext';

export default function App() {
  const { isAuthenticated, isLoading, login, logout } = useAuth();
  const [isVerifyingToken, setIsVerifyingToken] = useState(false);
  const [activeTab, setActiveTab] = useState<'agenda' | 'consultas' | 'cofre' | 'perfil'>('agenda');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (token) {
      setIsVerifyingToken(true);
      fetch(`${import.meta.env.VITE_API_URL}/api/auth/verify-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          if (data.accessToken && data.user) {
            login(data.accessToken, data.user);
            window.history.replaceState({}, document.title, '/');
          }
        } else {
          console.error('Token inválido ou expirado');
        }
      })
      .catch(err => console.error('Falha ao validar token:', err))
      .finally(() => setIsVerifyingToken(false));
    }
  }, [login]);

  if (isLoading || isVerifyingToken) {
    return <SplashScreen />;
  }

  if (isAuthenticated) {
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
