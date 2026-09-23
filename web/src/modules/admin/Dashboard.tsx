// Presenta el resumen operativo y la consulta local de alertas administrativas.
import { useMemo, useState } from "react";

type AlertStatus = "Activa" | "En proceso" | "Sin conexión" | "Finalizada";

type AlertItem = {
  id: string;
  user: string;
  startedAt: string;
  location: string;
  status: AlertStatus;
};

const alerts: AlertItem[] = [
  {
    id: "A-1042",
    user: "María Jiménez Pérez",
    startedAt: "14 sep., 14:32",
    location: "Calle 18 con Carrera 5, Neiva",
    status: "Activa",
  },
  {
    id: "A-1038",
    user: "Laura Martínez",
    startedAt: "14 sep., 12:05",
    location: "Avenida La Toma, Neiva",
    status: "En proceso",
  },
  {
    id: "A-1031",
    user: "Diana Vargas",
    startedAt: "14 sep., 10:18",
    location: "Carrera 7 con Calle 9, Neiva",
    status: "Sin conexión",
  },
  {
    id: "A-1027",
    user: "Ana Ramírez",
    startedAt: "13 sep., 20:10",
    location: "Terminal de transporte, Neiva",
    status: "Finalizada",
  },
];

/**
 * Muestra indicadores por estado y permite filtrar la tabla sin crear datos remotos.
 */
export function Dashboard() {
  const [selectedStatus, setSelectedStatus] = useState<AlertStatus | "Todas">(
    "Todas",
  );

  // Filtra el conjunto demostrativo para que la consulta responda al estado elegido.
  const visibleAlerts = useMemo(
    () =>
      alerts.filter(
        (alert) =>
          selectedStatus === "Todas" || alert.status === selectedStatus,
      ),
    [selectedStatus],
  );

  return (
    <div>
      <p className="eyebrow">Resumen operativo</p>
      <h1>Panel administrativo</h1>
      <p>Consulta de alertas registrada en la demostración local.</p>
      <section className="summary-grid" aria-label="Estados de alerta">
        {(
          [
            "Activa",
            "En proceso",
            "Sin conexión",
            "Finalizada",
          ] as AlertStatus[]
        ).map((status) => (
          <button
            key={status}
            type="button"
            className="summary-card"
            onClick={() => setSelectedStatus(status)}
          >
            <span>{status}</span>
            <strong>
              {alerts.filter((alert) => alert.status === status).length}
            </strong>
          </button>
        ))}
      </section>
      <section className="panel-card">
        <header className="table-header">
          <h2>Alertas activas y recientes</h2>
          <label>
            Estado
            <select
              value={selectedStatus}
              onChange={(event) =>
                setSelectedStatus(event.target.value as AlertStatus | "Todas")
              }
            >
              <option value="Todas">Todos los estados</option>
              <option value="Activa">Activa</option>
              <option value="En proceso">En proceso</option>
              <option value="Sin conexión">Sin conexión a internet</option>
              <option value="Finalizada">Finalizada</option>
            </select>
          </label>
        </header>
        {visibleAlerts.length === 0 ? (
          <p>No hay alertas para el filtro seleccionado.</p>
        ) : (
          <div className="responsive-table">
            <table>
              <thead>
                <tr>
                  <th>Estado</th>
                  <th>Usuaria</th>
                  <th>Inicio</th>
                  <th>Última ubicación</th>
                </tr>
              </thead>
              <tbody>
                {visibleAlerts.map((alert) => (
                  <tr key={alert.id}>
                    <td>
                      <span className="status-badge">{alert.status}</span>
                    </td>
                    <td>
                      {alert.user}
                      <span className="cell-meta">{alert.id}</span>
                    </td>
                    <td>{alert.startedAt}</td>
                    <td>{alert.location}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
