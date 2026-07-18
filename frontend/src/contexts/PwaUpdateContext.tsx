/// <reference types="vite-plugin-pwa/client" />
import { createContext, useContext, type ReactNode } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

interface PwaUpdateContextType {
  needRefresh: boolean;
  updateApp: () => void;
}

const PwaUpdateContext = createContext<PwaUpdateContextType | undefined>(undefined);

export function PwaUpdateProvider({ children }: { children: ReactNode }) {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r: any) {
      console.log('SW Registered: ' + r);
    },
    onRegisterError(error: any) {
      console.log('SW registration error', error);
    },
  });

  const updateApp = () => {
    if (needRefresh) {
      updateServiceWorker(true);
    }
  };

  return (
    <PwaUpdateContext.Provider value={{ needRefresh, updateApp }}>
      {children}
    </PwaUpdateContext.Provider>
  );
}

export function usePwaUpdate() {
  const context = useContext(PwaUpdateContext);
  if (context === undefined) {
    throw new Error('usePwaUpdate must be used within a PwaUpdateProvider');
  }
  return context;
}
