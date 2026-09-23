import { createContext, useContext, useState, type ReactNode } from "react";
type Alert = {
  active: boolean;
  startedAt?: number;
  tracking: boolean;
  lastUpdate?: number;
};
const C = createContext<{
  alert: Alert;
  activate: () => void;
  finalize: () => void;
  toggleTracking: () => void;
  recordLocation: () => void;
} | null>(null);
export function useAlert() {
  const v = useContext(C);
  if (!v) throw new Error("Alert provider missing");
  return v;
}
export function AlertProvider({ children }: { children: ReactNode }) {
  const [alert, setAlert] = useState<Alert>({ active: false, tracking: false });
  return (
    <C.Provider
      value={{
        alert,
        activate: () =>
          setAlert({ active: true, tracking: false, startedAt: Date.now() }),
        finalize: () => setAlert({ active: false, tracking: false }),
        toggleTracking: () =>
          setAlert((x) => ({ ...x, tracking: !x.tracking })),
        recordLocation: () =>
          setAlert((x) => ({ ...x, lastUpdate: Date.now() })),
      }}
    >
      {children}
    </C.Provider>
  );
}
