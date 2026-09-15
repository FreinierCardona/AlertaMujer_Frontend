// Entrega el estado global del aplicativo y falla con un mensaje claro fuera del provider.
import { useContext } from "react";
import { AppStateContext } from "./AppStateProvider";
export default function useAppState() {
  const value = useContext(AppStateContext);
  if (!value)
    throw new Error("useAppState must be used inside AppStateProvider.");
  return value;
}
