import { useCallback, useEffect, useState } from 'react';

// Hook sencillo para manejar contadores regresivos sin recrear intervalos en cada segundo.
export default function useCountdown(defaultSeconds = 60) {
  // Segundos restantes que se muestran en pantalla y controlan el estado del boton.
  const [secondsLeft, setSecondsLeft] = useState(0);
  const isRunning = secondsLeft > 0;

  // Inicia el contador usando 60 segundos por defecto o una duracion personalizada.
  const start = useCallback(
    (duration = defaultSeconds) => {
      setSecondsLeft(duration);
    },
    [defaultSeconds]
  );

  useEffect(() => {
    if (!isRunning) return;

    // El intervalo usa estado funcional para evitar depender del valor anterior en el render.
    const interval = setInterval(() => {
      setSecondsLeft((currentSeconds) => Math.max(currentSeconds - 1, 0));
    }, 1000);

    // Limpia el intervalo al salir de la pantalla o cuando el contador llega a cero.
    return () => clearInterval(interval);
  }, [isRunning]);

  return {
    secondsLeft,
    isRunning,
    start,
  };
}
