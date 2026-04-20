from app import create_app

# Se crea la instancia de la aplicación utilizando la factory
app = create_app()


if __name__ == "__main__":
    """
    Punto de entrada principal para ejecutar el backend.

    Levanta el servidor Flask en modo debug en el puerto 5000.
    """
    app.run(host="0.0.0.0", port=5000, debug=True)