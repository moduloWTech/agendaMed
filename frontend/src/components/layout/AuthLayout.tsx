import React from 'react';
import { BottomNav } from './BottomNav';
import { DesktopNavbar } from './DesktopNavbar';

interface AuthLayoutProps {
  children: React.ReactNode;
  currentTab?: 'agenda' | 'consultas' | 'cofre' | 'perfil';
  onChangeTab?: (tab: 'agenda' | 'consultas' | 'cofre' | 'perfil') => void;
}

export function AuthLayout({ children, currentTab = 'agenda', onChangeTab }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex flex-col transition-colors">
      {/* Header Superior Dedicado para Desktop/Tablet */}
      <DesktopNavbar currentTab={currentTab} onChangeTab={onChangeTab} />

      {/* Container Principal: max-w-md no Mobile e max-w-7xl no Desktop */}
      <main className="w-full max-w-md md:max-w-7xl mx-auto min-h-screen relative pb-24 md:pb-12 md:px-6 lg:px-8 flex-1">
        {children}
      </main>

      {/* Barra de Navegação Inferior (Apenas Mobile) */}
      <div className="md:hidden">
        <BottomNav currentTab={currentTab} onChangeTab={onChangeTab} />
      </div>
    </div>
  );
}
