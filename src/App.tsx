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
    const validateTokenAndInit = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');

      if (token) {
        try {
          const response = await fetch('http://localhost:3333/api/auth/verify-link', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token }),
          });

          if (response.ok) {
            // O token foi validado com sucesso!
            setIsAuthenticated(true);
            
            // Limpa o token da barra de endereço por segurança
            window.history.replaceState({}, document.title, '/');
          } else {
            console.error('Token inválido ou expirado');
          }
        } catch (error) {
          console.error('Falha ao validar token:', error);
        }
      }
      
      // Oculta a splash screen depois de verificar tudo
      setTimeout(() => {
        setShowSplash(false);
      }, 1500);
    };

    validateTokenAndInit();
  }, []);

  if (showSplash) {
    return <SplashScreen />;
  }

  if (isAuthenticated) {
    let CurrentScreen = <AgendaScreen />;
    if (activeTab === 'cofre') CurrentScreen = <VaultScreen />;
    if (activeTab === 'perfil') CurrentScreen = <ProfileScreen onLogout={() => setIsAuthenticated(false)} />;

    return (
      <AuthLayout currentTab={activeTab} onChangeTab={setActiveTab}>
        {CurrentScreen}
      </AuthLayout>
    );
  }

  return <LoginScreen onLogin={() => setIsAuthenticated(true)} />;
}
