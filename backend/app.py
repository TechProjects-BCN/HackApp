# Backend
from flask import Flask, request, Response
import jwt
from dataclasses import dataclass
from flask_cors import CORS
import json

@dataclass
class Group:
    name: str
    groupId: int
    groupNumber: int

@dataclass
class Queue:
    groups: list

box_cutter_queue = Queue([])

app = Flask(__name__)
CORS(app, supports_credentials=True, origins=["*"])

def get_cookie():
    session_cookie = request.cookies.get('session')
    #print(session_cookie)
    if session_cookie == None:
        return False, {}
    return True, dict(jwt.decode(session_cookie, key='secret', algorithms='HS256')) 

def addGroupToQueue(groupId, queueType):
    print(f"[TODO] Added Group {groupId} to {queueType}")

@app.route("/")
def index():
    return {"Backend": "Server"}

@app.route("/queue", methods=["GET", "POST"])
def queue():
    if request.method == "POST":
        queueType = request.json["queueType"]
    valid, session = get_cookie()
    if not valid or not session["sessionId"]:
        return Response({"Not Authorized": ""}, status=401)  
    addGroupToQueue(groupId=session["groupId"], queueType=queueType)
    return Response({"Queue": "Route"}, status=200)

app.run(debug=True, host="0.0.0.0")