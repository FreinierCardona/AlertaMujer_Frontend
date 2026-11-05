// Entrega el estado global de la aplicación y falla con un mensaje claro fuera del proveedor.
import { useContext } from 'react';
import { AppStateContext } from './AppStateProvider';
export default function useAppState() {
  const value = useContext(AppStateContext);
  if (!value)
    throw new Error('useAppState must be used inside AppStateProvider.');
  return value;
}
