// Reúne el sitio público y el acceso local de demostración del operador.
import { useState } from "react";
import { AdminShell } from "../admin/AdminShell";
import { Dashboard } from "../admin/Dashboard";

/**
 * Presenta la información pública y permite validar localmente el acceso
 * inicial del operador antes de cargar el panel administrativo.
 */
export function PublicSite() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Valida el formulario de demostración; la autenticación remota se integrará después.
  const signIn = () => {
    if (!email.includes("@") || password.length < 8) {
      setError("Ingresa correo y una contraseña de al menos 8 caracteres.");
      return;
    }
    setIsAdmin(true);
  };

  // Cambia al contenedor protegido una vez que el operador supera la validación local.
  if (isAdmin) {
    return (
      <AdminShell onSignOut={() => setIsAdmin(false)}>
        <Dashboard />
      </AdminShell>
    );
  }
  return (
    <main>
      <header>
        <b>AlertaMujer</b>
        <a href="#info">Conoce el proyecto</a>
        <a href="#apk">APK</a>
        <a href="#admin">Acceso administrativo</a>
      </header>
      <section>
        <p>Seguridad y acompañamiento ante emergencias.</p>
        <h1>AlertaMujer</h1>
        <p>
          Una experiencia informativa para conocer las funciones de alerta y
          apoyo.
        </p>
        <a className="button" href="#apk">
          Conocer la aplicación
        </a>
      </section>
      <section id="info">
        <h2>Información del proyecto</h2>
        <p>
          Registro de contactos, alerta SOS, ubicación y evidencias fotográficas
          para acompañar una emergencia.
        </p>
      </section>
      <section id="apk">
        <h2>Descarga de APK</h2>
        <p>El APK aún no está disponible para descarga.</p>
        <button disabled>Descarga no disponible</button>
      </section>
      <section id="admin">
        <h2>Acceso administrativo</h2>
        <p>Ingresa con las credenciales del operador.</p>
        <input
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Correo"
        />
        <input
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Contraseña"
          type="password"
        />
        <button onClick={signIn}>Ingresar</button>
        {error ? <p>{error}</p> : null}
      </section>
    </main>
  );
}
