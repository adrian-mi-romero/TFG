import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./app.css";

/**
 * Punto de entrada principal de la aplicación React.
 *
 * Responsabilidades:
 * - Inicializar React
 * - Configurar el enrutamiento con BrowserRouter
 * - Renderizar el componente principal <App />
 * - Aplicar estilos globales
 */

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* 
      BrowserRouter permite manejar rutas dentro de la aplicación
      sin recargar la página (SPA - Single Page Application)
    */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);