import { useEffect } from 'react';

// Actualiza solo la pantalla visible y evita solicitudes periódicas superpuestas.
export function useVisibleRefresh(refresh: (isCurrent: () => boolean) => Promise<void>, enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    let current = true;
    let busy = false;
    const run = async () => {
      if (!current || busy || document.visibilityState !== 'visible') return;
      busy = true;
      try { await refresh(() => current); } finally { busy = false; }
    };
    const timer = window.setInterval(() => void run(), 10000);
    const onVisible = () => { if (document.visibilityState === 'visible') void run(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => { current = false; window.clearInterval(timer); document.removeEventListener('visibilitychange', onVisible); };
  }, [enabled, refresh]);
}
