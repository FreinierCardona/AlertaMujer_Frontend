// Registra en memoria las alertas finalizadas para mostrarlas en el historial local.
import { createContext, useContext, useState, type ReactNode } from "react";
type Item = { id: string; startedAt: number; finishedAt: number };
const C = createContext<{ items: Item[]; add: () => void } | null>(null);
export function useHistory() {
  const v = useContext(C);
  if (!v) throw new Error("History provider missing");
  return v;
}
export function HistoryProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Item[]>([]);
  return (
    <C.Provider
      value={{
        items,
        add: () =>
          setItems((x) => [
            {
              id: String(Date.now()),
              startedAt: Date.now(),
              finishedAt: Date.now(),
            },
            ...x,
          ]),
      }}
    >
      {children}
    </C.Provider>
  );
}
