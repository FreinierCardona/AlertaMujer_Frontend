// Configura Vite para transformar la interfaz React durante desarrollo y compilación.
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
});
