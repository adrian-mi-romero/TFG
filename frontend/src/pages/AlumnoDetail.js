import React from "react";
import { useParams } from "react-router-dom";

function AlumnoDetail() {
  const { id } = useParams();

  return (
    <div className="alumno-detail">
      <h2>Legajo del alumno ID: {id}</h2>
      <p>Aquí se mostrará la información del alumno, contenidos, informes y progreso.</p>
    </div>
  );
}

export default AlumnoDetail;