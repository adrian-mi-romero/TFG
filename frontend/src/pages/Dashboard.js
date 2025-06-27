import React from "react";
import { Link } from "react-router-dom";

function Dashboard() {
  return (
    <div className="dashboard">
      <h2>Panel de alumnos</h2>
      <ul>
        <li><Link to="/alumno/1">Alumno Juan Pérez</Link></li>
        <li><Link to="/alumno/2">Alumno María Gómez</Link></li>
      </ul>
    </div>
  );
}

export default Dashboard;