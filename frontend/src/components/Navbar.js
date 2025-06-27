import React from "react";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar">
      <h2>Integración Electrónica</h2>
      <div className="nav-links">
        <Link to="/">Iniciar sesión</Link>
        <Link to="/register">Registro</Link>
        <Link to="/dashboard">Panel</Link>
      </div>
    </nav>
  );
}

export default Navbar;