import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/**
 * Configuración de Vite para el proyecto React.
 *
 * Responsabilidades:
 * - Habilitar soporte para React mediante plugin oficial
 * - Configurar el servidor de desarrollo
 */
export default defineConfig({
  plugins: [react()],

  server: {
    port: 5173,
    open: true
  }
});