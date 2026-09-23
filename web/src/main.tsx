// Arranca la aplicación web y habilita sus preferencias globales.
import { createRoot } from "react-dom/client";
import "./styles.css";
import { PublicSite } from "./modules/public/PublicSite";
import { PreferencesProvider } from "./shared/preferences/PreferencesProvider";

// Inicializa el sitio con las preferencias disponibles para módulos públicos y administrativos.
createRoot(document.getElementById("root")!).render(
  <PreferencesProvider>
    <PublicSite />
  </PreferencesProvider>,
);
