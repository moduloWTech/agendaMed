import { createClient, RealtimeChannel } from '@supabase/supabase-js';
import { useEffect } from 'react';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

/**
 * Hook de sincronização multi-dispositivo em tempo real.
 * Escuta eventos do Supabase Realtime (WebSockets) nas tabelas especificadas,
 * e também atualiza quando a janela/aba volta para o foco (Visibility/Focus).
 */
export function useRealtimeSync(tables: string[], onSync: () => void | Promise<void>, pollIntervalMs: number = 10000) {
  useEffect(() => {
    let channel: RealtimeChannel | null = null;

    try {
      channel = supabase.channel(`realtime-sync-${tables.join('-')}`);

      tables.forEach((table) => {
        channel?.on(
          'postgres_changes',
          { event: '*', schema: 'public', table },
          () => {
            onSync();
          }
        );
      });

      channel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          // Conectado com sucesso ao WebSocket
        }
      });
    } catch (e) {
      console.warn('[Realtime] Falha ao iniciar WebSocket do Supabase, usando polling de fallback:', e);
    }

    // 1. Refetch ao retornar para a janela ou destravar o celular
    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === 'visible') {
        onSync();
      }
    };

    window.addEventListener('focus', handleVisibilityOrFocus);
    document.addEventListener('visibilitychange', handleVisibilityOrFocus);

    // 2. Polling leve e resiliente em background como garantia
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') {
        onSync();
      }
    }, pollIntervalMs);

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
      window.removeEventListener('focus', handleVisibilityOrFocus);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      clearInterval(timer);
    };
  }, [tables.join(','), onSync, pollIntervalMs]);
}
