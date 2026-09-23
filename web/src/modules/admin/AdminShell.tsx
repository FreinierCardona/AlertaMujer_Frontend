// Define la estructura visual protegida que comparten los módulos administrativos.
import { type ReactNode, useState } from "react";
import { usePreferences } from "../../shared/preferences/PreferencesProvider";

type AdminShellProps = {
  onSignOut: () => void;
  children: ReactNode;
};

/**
 * Proporciona el contenedor protegido, la navegación principal y las preferencias del operador.
 */
export function AdminShell({ children, onSignOut }: AdminShellProps) {
  const { language, setLanguage, setTheme, theme } = usePreferences();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  /** Cierra la navegación lateral después de seleccionar un módulo. */
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <div className="admin-shell">
      <aside className={isMenuOpen ? "admin-sidebar is-open" : "admin-sidebar"}>
        <div className="admin-brand">
          <strong>AlertaMujer</strong>
          <button type="button" onClick={closeMenu} aria-label="Cerrar menú">
            ×
          </button>
        </div>
        <nav aria-label="Navegación administrativa">
          <button type="button" onClick={closeMenu}>
            Resumen
          </button>
          <button type="button" onClick={closeMenu}>
            Alertas
          </button>
          <button type="button" onClick={closeMenu}>
            Usuarias
          </button>
          <button type="button" onClick={closeMenu}>
            Auditoría
          </button>
        </nav>
        <button className="sign-out" type="button" onClick={onSignOut}>
          Cerrar sesión
        </button>
      </aside>
      {isMenuOpen ? (
        <button
          type="button"
          className="admin-backdrop"
          aria-label="Cerrar menú"
          onClick={closeMenu}
        />
      ) : null}
      <div className="admin-workspace">
        <header className="admin-toolbar">
          <button
            type="button"
            className="menu-button"
            onClick={() => setIsMenuOpen(true)}
            aria-label="Abrir menú"
          >
            ☰
          </button>
          <span className="connection-status">
            ● Conexión demostrativa activa
          </span>
          <div className="preferences-controls">
            <label>
              Idioma
              <select
                value={language}
                onChange={(event) =>
                  setLanguage(event.target.value as "es" | "en")
                }
              >
                <option value="es">ES</option>
                <option value="en">EN</option>
              </select>
            </label>
            <button
              type="button"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            >
              {theme === "light" ? "Modo oscuro" : "Modo claro"}
            </button>
          </div>
          <span className="operator-profile">Operador administrativo</span>
        </header>
        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}
