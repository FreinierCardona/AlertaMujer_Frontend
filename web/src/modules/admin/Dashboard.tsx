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
  const [selectedAlert, setSelectedAlert] = useState<AlertItem | null>(null);
  const [alertRows, setAlertRows] = useState(alerts);
  const [messages, setMessages] = useState<string[]>([
    "Operador: Recibimos tu alerta. Permanece en un lugar visible si es seguro.",
  ]);
  const [draftMessage, setDraftMessage] = useState("");

  // Filtra el conjunto demostrativo para que la consulta responda al estado elegido.
  const visibleAlerts = useMemo(
    () =>
      alertRows.filter(
        (alert) =>
          selectedStatus === "Todas" || alert.status === selectedStatus,
      ),
    [alertRows, selectedStatus],
  );

  // Inicia atención sin ofrecer una acción administrativa de finalización.
  const startAttention = () => {
    if (!selectedAlert || selectedAlert.status !== "Activa") return;
    const updatedAlert = { ...selectedAlert, status: "En proceso" as const };
    setAlertRows((current) =>
      current.map((alert) =>
        alert.id === updatedAlert.id ? updatedAlert : alert,
      ),
    );
    setSelectedAlert(updatedAlert);
  };

  // Agrega el mensaje del operador solo al contexto de la alerta que está abierta.
  const sendMessage = () => {
    const message = draftMessage.trim();
    if (!message) return;
    setMessages((current) => [...current, `Operador: ${message}`]);
    setDraftMessage("");
  };

  if (selectedAlert) {
    return (
      <section className="panel-card">
        <button type="button" onClick={() => setSelectedAlert(null)}>
          Volver al panel
        </button>
        <p className="eyebrow">Detalle de alerta {selectedAlert.id}</p>
        <h1>{selectedAlert.user}</h1>
        <p>
          <span className="status-badge">{selectedAlert.status}</span>
        </p>
        <p>
          <strong>Inicio:</strong> {selectedAlert.startedAt}
        </p>
        <p>
          <strong>Última ubicación confirmada:</strong> {selectedAlert.location}
        </p>
        <div className="map-placeholder">
          Ubicación confirmada: {selectedAlert.location}
        </div>
        <section className="detail-section">
          <h2>Evidencias recibidas</h2>
          <div className="evidence-grid">
            <div className="evidence-item">Fotografía de entorno urbano</div>
            <div className="evidence-item">
              Fotografía de ubicación reportada
            </div>
          </div>
        </section>
        <section className="detail-section">
          <h2>Comunicación con la usuaria</h2>
          <div className="message-list">
            {messages.map((message) => (
              <p key={message}>{message}</p>
            ))}
          </div>
          <label>
            Mensaje del operador
            <textarea
              value={draftMessage}
              onChange={(event) => setDraftMessage(event.target.value)}
              placeholder="Escribe una indicación segura"
            />
          </label>
          <button
            type="button"
            onClick={sendMessage}
            disabled={!draftMessage.trim()}
          >
            Enviar mensaje
          </button>
        </section>
        {selectedAlert.status === "Activa" ? (
          <button type="button" onClick={startAttention}>
            Iniciar atención
          </button>
        ) : null}
        <p>
          La finalización solo puede ser realizada por la usuaria desde la
          aplicación móvil.
        </p>
      </section>
    );
  }

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
              {alertRows.filter((alert) => alert.status === status).length}
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
                  <tr key={alert.id} onClick={() => setSelectedAlert(alert)}>
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
