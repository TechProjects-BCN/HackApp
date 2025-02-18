# Backend
from flask import Flask, request, Response
from flask_apscheduler import APScheduler
import jwt
import os
import time
from flask_cors import CORS
from src import *

HOT_GLUE_STATIONS = 5
CUTTER_STATIONS = 4
ACCEPT_TIME = 30 # seconds
STATION_TIME = 60 * 10 + ACCEPT_TIME # seconds

cutter_queue, hot_glue_queue, hot_glue_stations_epochs, spot_hotglue, spot_cutter, failed_attempts = [], [], [], [], [], []

cutter_stations = [0 for _ in range(CUTTER_STATIONS)]
cutter_stations_epochs = [None for _ in range(CUTTER_STATIONS)]
hotglue_stations = [0 for _ in range(HOT_GLUE_STATIONS)]
hot_glue_stations_epochs = [None for _ in range(HOT_GLUE_STATIONS)]

app = Flask(__name__)
CORS(app, supports_credentials=True, origins=["*"])
database = Database(database=os.getenv('DB_NAME', 'techprojects'), user=os.getenv('DB_USER', 'techprojects'),
                    host=os.getenv('DB_HOST', '127.0.0.1'), password=os.getenv('DB_PASSWORD', '12341234'), port=5432)

#function executed by scheduled job
def updater():
    # Check if there's spot in the stations and if there's someone waiting on the queue
    if 0 in cutter_stations and len(cutter_queue) > 0:
        empty_slot = cutter_stations.index(0)
        cutter_stations_epochs[empty_slot] = time.time() + STATION_TIME
        spot_cutter.append(GroupToBeAccepted(cutter_queue.pop(0), False, time.time() + ACCEPT_TIME, empty_slot))
        cutter_stations[empty_slot] = 3

    if 0 in hotglue_stations and len(hot_glue_queue) > 0:
        empty_slot = hotglue_stations.index(0)
        hot_glue_stations_epochs[empty_slot] = time.time() + STATION_TIME
        spot_hotglue.append(GroupToBeAccepted(hot_glue_queue.pop(0), False, time.time() + ACCEPT_TIME, empty_slot))
        hotglue_stations[empty_slot] = 3
    
    # Check if someone either accepted the spot or ran out of time to accept
    to_remove = []
    for group in spot_cutter:
        if time.time() > group.TimeLeft:
            cutter_stations[group.slot] = 0
            to_remove.append(group)
            if group.group not in failed_attempts:
                failed_attempts.append(group.group)
                cutter_queue.append(group.group)
        elif group.accepted:
            if group.group in failed_attempts:
                failed_attempts.remove(group.group)
            cutter_stations[group.slot] = group.group
            to_remove.append(group)

    for group in to_remove:
        spot_cutter.pop(spot_cutter.index(group))

    to_remove = []
    for group in spot_hotglue:
        if time.time() > group.TimeLeft:
            hotglue_stations[group.slot] = 0
            to_remove.append(group)
            if group.group not in failed_attempts:
                failed_attempts.append(group.group)
                hot_glue_queue.append(group.group)
        elif group.accepted:
            if group.group in failed_attempts:
                failed_attempts.remove(group.group)
            hotglue_stations[group.slot] = group.group
            to_remove.append(group)
            
    for group in to_remove:
        spot_hotglue.pop(spot_hotglue.index(group))

    print(f"Queues: \n Cutter: {cutter_queue} \n Hot Glue: {hot_glue_queue} \nStations:\n Cutter: {cutter_stations} \n Hot Glue: {hotglue_stations} \nTo Be Accepted: \n Hot Glue: {spot_hotglue} \n Cutter: {spot_cutter}")

def getGroup(groupId):
    groupId, groupName, groupNumber = database.get_group(groupId)[0]
    return Group(groupId=groupId, groupNumber=groupNumber, name=groupName)

def get_cookie():
    session_cookie = request.cookies.get('session')
    if session_cookie == None:
        return False, {}
    return True, dict(jwt.decode(session_cookie, key='secret', algorithms='HS256')) 

def addGroupToQueue(groupId, spotType):
    group_info = getGroup(groupId)
    groupsInSpotCutter = [item.group for item in spot_cutter]
    groupsInSpotHotGlue = [item.group for item in spot_hotglue]
    if spotType == "cutter" and (group_info not in cutter_queue and group_info not in cutter_stations and group_info not in groupsInSpotCutter):
        cutter_queue.append(group_info)
    elif spotType == "hotglue"  and (group_info not in hot_glue_queue and group_info not in hotglue_stations and group_info not in groupsInSpotHotGlue):
        hot_glue_queue.append(group_info)
    else:
        print(f"Group {groupId} tried to join queue but is already in it or invalid queueType: {spotType}")
        return
    print(f"Added Group {groupId} to {spotType}")

def removeGroupFromQueue(groupId, spotType):
    group_info = getGroup(groupId)
    if spotType == "cutter" and (group_info in cutter_queue and group_info not in cutter_stations):
        slot = cutter_queue.index(group_info)
        cutter_queue.pop(slot)
    elif spotType == "hotglue"  and (group_info in hot_glue_queue and group_info not in hotglue_stations):
        slot = hot_glue_queue.index(group_info)
        hot_glue_queue.pop(slot)
    else:
        print(f"Group {groupId} tried to be removed from the queue but wasn't in it or invalid queueType: {spotType}")
        return
    print(f"Removed Group {groupId} from {spotType}")

def removeGroupFromSpot(groupId, spotType):
    group_info = getGroup(groupId)
    if spotType == "cutter" and (group_info in cutter_stations):
        slot = cutter_stations.index(group_info)
        cutter_stations[slot] = 0
        cutter_stations_epochs[slot] = 0
    elif spotType == "hotglue"  and (group_info in hotglue_stations):
        slot = hotglue_stations.index(group_info)
        hotglue_stations[slot] = 0
        hot_glue_stations_epochs[slot] = 0
    else:
        print(f"Group {groupId} tried to be removed from the queue but wasn't in it or invalid queueType: {spotType}")
        return
    print(f"Removed Group {groupId} from {spotType}")

def acceptSpot(groupId, spotType):
    group_info = getGroup(groupId)
    group_id = -1
    print(f"Resquest {groupId}, {spotType}")
    if spotType == "cutter":
        for i, group in enumerate(spot_cutter):
            if group.group == group_info:
                group_id = i
                break
        if group_id != -1:
            spot_cutter[group_id].accepted = True
        else:
            print(f"Error when accepting group {groupId}. They are not in spot queue")
    else:
        for i, group in enumerate(spot_hotglue):
            if group.group == group_info:
                group_id = i
                break
        if group_id != -1:
            spot_hotglue[group_id].accepted = True
        else:
            print(f"Error when accepting group {groupId}. They are not in spot queue")

def giveUpSpot(groupId, spotType):
    group_info = getGroup(groupId)
    if spotType == "cutter":
        for i, group in enumerate(spot_cutter):
            if group.group == group_info:
                group_id = i
                break
        spot_cutter[group_id].TimeLeft -= 1000
    else:
        for i, group in enumerate(spot_hotglue):
            if group.group == group_info:
                group_id = i
                break
        spot_hotglue[group_id].TimeLeft -= 1000

def authenticated_request(function, nameType):
    if request.method == "POST":
        spotType = request.json[nameType]
    valid, session = get_cookie()
    if not valid or not session["sessionId"]:
        return Response({"Not Authorized": ""}, status=401)  
    function(groupId=session["groupId"], spotType=spotType)
    updater()
    return Response({"Accepted": "Success"}, status=200)
    
@app.route("/")
def index():
    return {"Backend": "Server"}

@app.route("/info", methods=["GET"])
def info():
    valid, session = get_cookie()
    if not valid or not session["sessionId"]:
        return Response({"Not Authorized": ""}, status=401)  
    group_info = getGroup(session["groupId"])
    return {"name": group_info.name, "groupNumber": group_info.groupNumber}

@app.route("/joinqueue", methods=["POST"])
def joinqueue():
    return authenticated_request(function=addGroupToQueue, nameType="queueType")

@app.route("/removequeue", methods=["POST"])
def removequeue():
    return authenticated_request(function=removeGroupFromQueue, nameType="queueType")

@app.route("/leavespot", methods=["POST"])
def leavespot():
    return authenticated_request(function=removeGroupFromSpot, nameType="spotType")

@app.route("/accept", methods=["POST"])
def accept():
    return authenticated_request(function=acceptSpot, nameType="spotType")

@app.route("/giveupspot", methods=["POST"])
def giveup():
    return authenticated_request(function=giveUpSpot, nameType="spotType")

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
        spot_info["spotId"] = cutter_stations.index(group_info) + 1
        spot_info["EpochEnd"] = cutter_stations_epochs[cutter_stations.index(group_info)]
        response["cutterStation"] = spot_info
    
    for i, group in enumerate(spot_cutter):
        if group.group == group_info:
            spot_info = {}
            spot_info["spotId"] = group.slot + 1
            spot_info["EpochEnd"] = group.TimeLeft
            response["spotcutterToAccept"] = spot_info
            break
        
    if group_info in hot_glue_queue:
        queue_info = {}
        queue_info["position"] = hot_glue_queue.index(group_info)
        queue_info["ETA"] = -1
        response["hotglueQueue"] = queue_info
        
    elif group_info in hotglue_stations:
        spot_info = {}
        spot_info["spotId"] = hotglue_stations.index(group_info) + 1
        spot_info["EpochEnd"] = hot_glue_stations_epochs[hotglue_stations.index(group_info)]
        response["hotglueStation"] = spot_info
        
    for i, group in enumerate(spot_hotglue):
        if group.group == group_info:
            spot_info = {}
            spot_info["spotId"] = group.slot + 1
            spot_info["EpochEnd"] = group.TimeLeft
            response["spothotglueToAccept"] = spot_info
            break

    return response, 200

def main():
    scheduler = APScheduler()
    scheduler.add_job(func=updater, trigger='interval', id='job', seconds=10)
    scheduler.start()
    app.run(host="0.0.0.0")

if __name__ == "__main__":
    main()