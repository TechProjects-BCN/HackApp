# Backend
from flask import Flask, request
import jwt

app = Flask(__name__)


@app.route("/")
def index():
    return {"Backend": "Server"}

@app.route("/queue")
def queue():
    return {"Queue": "Route"}

app.run(debug=True)