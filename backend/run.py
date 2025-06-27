from app import create_app, db
from flask.cli import with_appcontext
import click

app = create_app()

@app.cli.command("init-db")
@with_appcontext
def init_db():
    db.create_all()
    click.echo('Base de datos inicializada.')

if __name__ == '__main__':
    app.run(debug=True)
