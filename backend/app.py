# Backend
from flask import Flask, request, Response
from flask_apscheduler import APScheduler
import jwt
import os
import time
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
hot_glue_stations_epochs = []

cutter_stations = [0 for _ in range(CUTTER_STATIONS)]
cutter_stations_epochs = [None for _ in range(CUTTER_STATIONS)]
hotglue_stations = [0 for _ in range(HOT_GLUE_STATIONS)]
hot_glue_stations_epochs = [None for _ in range(HOT_GLUE_STATIONS)]

STATION_TIME = 60 * 10

app = Flask(__name__)
CORS(app, supports_credentials=True, origins=["*"])
database = Database(database=os.getenv('DB_NAME', 'techprojects'), user=os.getenv('DB_USER', 'techprojects'),
                    host=os.getenv('DB_HOST', '127.0.0.1'), password=os.getenv('DB_PASSWORD', '12341234'), port=5432)

#function executed by scheduled job
def updater():
    if 0 in cutter_stations and len(cutter_queue) > 0:
        empty_slot = cutter_stations.index(0)
        cutter_stations[empty_slot] = cutter_queue.pop(0)
        cutter_stations_epochs[empty_slot] = time.time() + STATION_TIME

    if 0 in hotglue_stations and len(hot_glue_queue) > 0:
        empty_slot = hotglue_stations.index(0)
        hotglue_stations[empty_slot] = hot_glue_queue.pop(0)
        hot_glue_stations_epochs[empty_slot] = time.time() + STATION_TIME
    print(f"Queues: \n Cutter: {cutter_queue} \n Hot Glue: {hot_glue_queue} \nStations:\n Cutter: {cutter_stations} \n Hot Glue: {hotglue_stations}")
    
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
    if queueType == "cutter" and (group_info not in cutter_queue and group_info not in cutter_stations):
        cutter_queue.append(group_info)
    elif queueType == "hotglue"  and (group_info not in hot_glue_queue and group_info not in hotglue_stations):
        hot_glue_queue.append(group_info)
    else:
        print(f"Group {groupId} tried to join queue but is already in it or invalid queueType: {queueType}")
        return
    print(f"Added Group {groupId} to {queueType}")
    updater()


def removeGroupFromQueue(groupId, queueType):
    group_info = getGroup(groupId)
    if queueType == "cutter" and (group_info in cutter_queue and group_info not in cutter_stations):
        slot = cutter_queue.index(group_info)
        cutter_queue.pop(slot)
    elif queueType == "hotglue"  and (group_info in hot_glue_queue and group_info not in hotglue_stations):
        slot = hot_glue_queue.index(group_info)
        hot_glue_queue.pop(slot)
    else:
        print(f"Group {groupId} tried to be removed from the queue but wasn't in it or invalid queueType: {queueType}")
        return
    print(f"Removed Group {groupId} from {queueType}")
    updater()

def removeGroupFromSpot(groupId, spotType):
    group_info = getGroup(groupId)
    if spotType == "cutter" and (group_info in cutter_stations):
        slot = hotglue_stations.index(group_info)
        cutter_stations[slot] = 0
        hot_glue_stations_epochs[slot] = 0
    elif spotType == "hotglue"  and (group_info in hotglue_stations):
        slot = hotglue_stations.index(group_info)
        hotglue_stations[slot] = 0
        hot_glue_stations_epochs[slot] = 0
    else:
        print(f"Group {groupId} tried to be removed from the queue but wasn't in it or invalid queueType: {spotType}")
        return
    print(f"Removed Group {groupId} from {spotType}")
    updater()

@app.route("/")
def index():
    return {"Backend": "Server"}

@app.route("/joinqueue", methods=["POST"])
def joinqueue():
    if request.method == "POST":
        queueType = request.json["queueType"]
    valid, session = get_cookie()
    if not valid or not session["sessionId"]:
        return Response({"Not Authorized": ""}, status=401)  
    addGroupToQueue(groupId=session["groupId"], queueType=queueType)
    updater()
    return Response({"Added": "Success"}, status=200)

@app.route("/removequeue", methods=["POST"])
def removequeue():
    if request.method == "POST":
        queueType = request.json["queueType"]
    valid, session = get_cookie()
    if not valid or not session["sessionId"]:
        return Response({"Not Authorized": ""}, status=401)  
    removeGroupFromQueue(groupId=session["groupId"], queueType=queueType)
    updater()
    return Response({"Removed": "Success"}, status=200)

@app.route("/leavespot", methods=["POST"])
def leavespot():
    if request.method == "POST":
        print(request.json)
        spotType = request.json["spotType"]
    valid, session = get_cookie()
    if not valid or not session["sessionId"]:
        return Response({"Not Authorized": ""}, status=401)  
    removeGroupFromSpot(groupId=session["groupId"], spotType=spotType)
    updater()
    return Response({"Removed": "Success"}, status=200)

@app.route("/queue", methods=["GET"])
def queue():
    return {"cutter_queue": cutter_queue,
                     "cutter_stations": cutter_stations,
                     "hot_glue_queue": hot_glue_queue,
                     "hot_glue_stations": hotglue_stations}, 200


@app.route("/status", methods=["GET"])
def status():
    valid, session = get_cookie()
    if not valid or not session["sessionId"]:
        return Response({"Not Authorized": ""}, status=401)  
    response = {}
    group_info = getGroup(groupId=session["groupId"])
    if group_info in cutter_queue:
        queue_info = {}
        queue_info["position"] = cutter_queue.index(group_info)
        queue_info["ETA"] = -1
        response["cutterQueue"] = queue_info
        
    elif group_info in cutter_stations:
        spot_info = {}
        spot_info["spotId"] = cutter_stations.index(group_info)
        spot_info["EpochEnd"] = cutter_stations_epochs[spot_info["spotId"]]
        response["cutterStation"] = spot_info
        
    if group_info in hot_glue_queue:
        queue_info = {}
        queue_info["position"] = hot_glue_queue.index(group_info)
        queue_info["ETA"] = -1
        response["hotglueQueue"] = queue_info
        
    elif group_info in hotglue_stations:
        spot_info = {}
        spot_info["spotId"] = hotglue_stations.index(group_info)
        spot_info["EpochEnd"] = hot_glue_stations_epochs[spot_info["spotId"]]
        response["hotglueStation"] = spot_info
    print(response)
    return Response(response, status=200)

def main():
    scheduler = APScheduler()
    scheduler.add_job(func=updater, trigger='interval', id='job', seconds=10)
    scheduler.start()
    app.run(host="0.0.0.0")

if __name__ == "__main__":
    main()