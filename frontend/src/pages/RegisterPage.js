import React from "react";

function RegisterPage() {
  return (
    <div className="form-container">
      <h2>Registro de Usuario</h2>
      <form>
        <input type="text" placeholder="Nombre completo" required />
        <input type="email" placeholder="Correo electrónico" required />
        <input type="password" placeholder="Contraseña" required />
        <button type="submit">Registrarse</button>
      </form>
    </div>
  );
}

export default RegisterPage;