# Backend
from flask import Flask, request, Response
from flask_apscheduler import APScheduler
import jwt
import os
from dataclasses import dataclass
from flask_cors import CORS
from src import *

HOT_GLUE_STATIONS = 5
CUTTER_STATIONS = 5

@dataclass
class Group:
    name: str
    groupId: int
    groupNumber: int


cutter_queue = []
hot_glue_queue = []

cutter_stations = [None for _ in range(CUTTER_STATIONS)]
hotglue_stations = [None for _ in range(HOT_GLUE_STATIONS)]

app = Flask(__name__)
CORS(app, supports_credentials=True, origins=["*"])
database = Database(database=os.getenv('DB_NAME', 'techprojects'), user=os.getenv('DB_USER', 'techprojects'),
                    host=os.getenv('DB_HOST', '127.0.0.1'), password=os.getenv('DB_PASSWORD', '12341234'), port=5432)

#function executed by scheduled job
def updater():
    if None in cutter_stations and len(cutter_queue) > 0:
        print("Yes Cutter!")

    if None in hotglue_stations and len(hot_glue_queue) > 0:
        print("Yes Hot Glue!")
        empty_slot = hotglue_stations.index(None)
        hotglue_stations[empty_slot] = hot_glue_queue.pop(0)
    
def getGroups(eventId):
    temp_groups = []
    for groupId, groupName, groupNumber in database.get_groups(eventId):
        temp_groups.append(Group(groupId=groupId, groupNumber=groupNumber, name=groupName))
    return temp_groups

def getGroup(groupId):
    for groupId, groupName, groupNumber in database.get_group(groupId):
        result = Group(groupId=groupId, groupNumber=groupNumber, name=groupName)
    return result

def get_cookie():
    session_cookie = request.cookies.get('session')
    if session_cookie == None:
        return False, {}
    return True, dict(jwt.decode(session_cookie, key='secret', algorithms='HS256')) 

def addGroupToQueue(groupId, queueType):
    group_info = getGroup(groupId)
    if queueType == "cutter":
        cutter_queue.append(group_info)
    else:
        hot_glue_queue.append(group_info)
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

def main():
    scheduler = APScheduler()
    scheduler.add_job(func=updater, trigger='interval', id='job', seconds=5)
    scheduler.start()
    app.run(debug=True, host="0.0.0.0")

if __name__ == "__main__":
    main()