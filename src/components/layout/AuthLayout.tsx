import React from 'react';
import { BottomNav } from './BottomNav';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <main className="w-full max-w-md mx-auto min-h-screen relative">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
