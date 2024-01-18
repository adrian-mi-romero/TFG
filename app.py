#Adrian Romero - Efip 1 Marzo 2020

import os
from sqlalchemy.orm import sessionmaker
from package.login import *
from flask import Flask, send_from_directory, render_template, request, redirect, url_for, session, abort
from flask_restful import Resource, Api, request
from package.pacientes import Pacientes, Paciente
from package.terapistas import Terapistas, Terapista
from package.turnos import Turnos, Turno
from package.compartida import Compartida
import json


with open('config.json') as data_file:
    config = json.load(data_file)

engine = create_engine('sqlite:///database.db', echo=True)

app = Flask(__name__, static_url_path='', template_folder='static')


api = Api(app)

api.add_resource(Pacientes, '/paciente')
api.add_resource(Paciente, '/paciente/<int:id>')
api.add_resource(Terapistas, '/terapista')
api.add_resource(Terapista, '/terapista/<int:id>')
api.add_resource(Turnos, '/turno')
api.add_resource(Turno, '/turno/<int:id>')
api.add_resource(Compartida, '/compartida')

# Routes

@app.route('/')
def home():
    if not session.get('logged_in'):
        return render_template('login.html')
    else:
        return app.send_static_file('index.html')

@app.route('/index.html')
def hm():
    if not session.get('logged_in'):
        return render_template('login.html')
    else:
        return app.send_static_file('index.html')

@app.route('/turnos.html')
def turnos_id():
    if not session.get('logged_in'):
        return render_template('login.html')
    else:
        return app.send_static_file('turnos.html')

@app.route('/pacientes.html')
def pat():
    if not session.get('logged_in'):
        print("usuario no esta loggeado")
        return render_template('login.html')
    else:
        return app.send_static_file('pacientes.html')

@app.route('/terapistas.html')
def doc():
    if not session.get('logged_in'):
        return render_template('login.html')
    else:
        return app.send_static_file('terapistas.html')


@app.route('/login', methods=['POST'])
def do_admin_login():
    POST_USERNAME = str(request.form['username'])
    POST_PASSWORD = str(request.form['password'])
    Session = sessionmaker(bind=engine)
    s = Session()
    query = s.query(User).filter(User.username.in_([POST_USERNAME]), User.password.in_([POST_PASSWORD]) )
    result = query.first()
    if result:
        session['logged_in'] = True
    else:
        print('wrong password!')
    return home()

@app.route("/logout")
def logout():
    session['logged_in'] = False
    return home()


if __name__ == '__main__':
    app.secret_key = os.urandom(12)
    print(config['host'],config['port'])
    app.run(debug=True,host=config['host'],port=config['port'])
