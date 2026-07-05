import { useState, useEffect } from 'react';
import { SplashScreen } from './screens/SplashScreen';
import { LoginScreen } from './screens/LoginScreen';
import { AgendaScreen } from './screens/AgendaScreen';
import { VaultScreen } from './screens/VaultScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { AuthLayout } from './components/layout/AuthLayout';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [activeTab, setActiveTab] = useState<'agenda' | 'cofre' | 'perfil'>('agenda');

  useEffect(() => {
    // Simula o tempo de carregamento da aplicação nativa (2.5 segundos)
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return <SplashScreen />;
  }

  if (isAuthenticated) {
    let CurrentScreen = <AgendaScreen />;
    if (activeTab === 'cofre') CurrentScreen = <VaultScreen />;
    if (activeTab === 'perfil') CurrentScreen = <ProfileScreen />;

    return (
      <AuthLayout currentTab={activeTab} onChangeTab={setActiveTab}>
        {CurrentScreen}
      </AuthLayout>
    );
  }

  return <LoginScreen onLogin={() => setIsAuthenticated(true)} />;
}
