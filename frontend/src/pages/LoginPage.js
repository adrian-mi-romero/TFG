import React from "react";

function LoginPage() {
  return (
    <div className="form-container">
      <h2>Iniciar sesión</h2>
      <form>
        <input type="email" placeholder="Correo electrónico" required />
        <input type="password" placeholder="Contraseña" required />
        <button type="submit">Entrar</button>
      </form>
    </div>
  );
}

export default LoginPage;