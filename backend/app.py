# Backend
import logging  
from flask import Flask, request, Response
from flask_apscheduler import APScheduler
import jwt
import os
import time
from flask_cors import CORS
from src import *
from dataclasses import asdict

HOT_GLUE_STATIONS = 5
CUTTER_STATIONS = 4
ACCEPT_TIME = 30 # seconds
STATION_TIME = 60 * 10 + ACCEPT_TIME # seconds
countdown_info = {
    "current_event": "Networking",
    "next_event": "Hackathon Start",
    "target_epoch": 1745939420,
    "youtube_id": "xX4mBbJjdYM",
    "station_duration": 10,
    "app_title": "Hack26",
    "app_subtitle": "MIT • CIC • UPC"
} # minutes

cutter_queue, hot_glue_queue, hot_glue_stations_epochs, spot_hotglue, spot_cutter, failed_attempts = [], [], [], [], [], []
cutter_queue, hot_glue_queue, hot_glue_stations_epochs, spot_hotglue, spot_cutter, failed_attempts = [], [], [], [], [], []
assistance_queue = []
assistance_queue = []
assistance_active = []
DEFAULT_LANGUAGE = "en"

cutter_stations = [0 for _ in range(CUTTER_STATIONS)]
cutter_stations_epochs = [None for _ in range(CUTTER_STATIONS)]
hotglue_stations = [0 for _ in range(HOT_GLUE_STATIONS)]
hot_glue_stations_epochs = [None for _ in range(HOT_GLUE_STATIONS)]

app = Flask(__name__)
scheduler = APScheduler()
app = Flask(__name__)
scheduler = APScheduler()
# Allow requests from localhost:3000 and specific IP ranges
CORS(app, supports_credentials=True, origins=["http://localhost:3000", "http://127.0.0.1:3000", r"http://192\.168\..*:3000", r"http://10\..*:3000"])
database = Database(database=os.getenv('DB_NAME', 'techprojects'), user=os.getenv('DB_USER', 'techprojects'),
                    host=os.getenv('DB_HOST', '127.0.0.1'), password=os.getenv('DB_PASSWORD', '12341234'), port=5432)
app.logger.setLevel(logging.INFO)
#function executed by scheduled job
def updater():
    # Check if there's spot in the stations and if there's someone waiting on the queue
    if 0 in cutter_stations and len(cutter_queue) > 0:
        empty_slot = cutter_stations.index(0)
        station_time = countdown_info.get("station_duration", 10) * 60 + ACCEPT_TIME
        cutter_stations_epochs[empty_slot] = time.time() + station_time
        spot_cutter.append(GroupToBeAccepted(cutter_queue.pop(0), False, time.time() + ACCEPT_TIME, empty_slot))
        cutter_stations[empty_slot] = 3

    if 0 in hotglue_stations and len(hot_glue_queue) > 0:
        empty_slot = hotglue_stations.index(0)
        station_time = countdown_info.get("station_duration", 10) * 60 + ACCEPT_TIME
        hot_glue_stations_epochs[empty_slot] = time.time() + station_time
        spot_hotglue.append(GroupToBeAccepted(hot_glue_queue.pop(0), False, time.time() + ACCEPT_TIME, empty_slot))
        hotglue_stations[empty_slot] = 3
    
    # Check if someone either accepted the spot or ran out of time to accept
    to_remove = []
    for group in spot_cutter:
        if time.time() > group.TimeLeft:  # Ran out of time
            cutter_stations[group.slot] = 0
            to_remove.append(group)
            if group.group not in failed_attempts: # Gets Blacklisted
                failed_attempts.append(group.group)
                cutter_queue.append(group.group)
        elif group.accepted: # Has Accepted
            if group.group in failed_attempts: # Removed from blacklist
                failed_attempts.remove(group.group)
            cutter_stations[group.slot] = group.group
            database.write_spot_acceptance(group, spotType="cutter")
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
            database.write_spot_acceptance(group, spotType="hotglue")
            to_remove.append(group)
            
    for group in to_remove:
        spot_hotglue.pop(spot_hotglue.index(group))

    # Check for expired active sessions (Auto-Kick)
    for i, epoch in enumerate(cutter_stations_epochs):
        if epoch is not None and time.time() > epoch:
            # Check if station is actually occupied by a group (not 0=Free, 2=Disabled, 3=Reserved)
            if cutter_stations[i] not in [0, 2, 3]:
                # Time is up for this group
                group_obj = cutter_stations[i]
                print(f"Auto-kicking Group {group_obj.groupId} from Cutter Station {i+1}")
                database.write_spot_leaving(group=group_obj, spotType="cutter", slot=i)
                cutter_stations[i] = 0
                cutter_stations_epochs[i] = None

    for i, epoch in enumerate(hot_glue_stations_epochs):
        if epoch is not None and time.time() > epoch:
            if hotglue_stations[i] not in [0, 2, 3]:
                group_obj = hotglue_stations[i]
                print(f"Auto-kicking Group {group_obj.groupId} from Hot Glue Station {i+1}")
                database.write_spot_leaving(group=group_obj, spotType="hotglue", slot=i)
                hotglue_stations[i] = 0
                hot_glue_stations_epochs[i] = None

    app.logger.info(f"Queues: Cutter: {cutter_queue}  Hot Glue: {hot_glue_queue} Stations: Cutter: {cutter_stations}  Hot Glue: {hotglue_stations} To Be Accepted:  Hot Glue: {spot_hotglue}  Cutter: {spot_cutter}")

def getGroup(groupId):
    groupId, groupName, groupNumber, eventID, members, username, is_admin = database.get_group(groupId)[0]
    return Group(groupId=groupId, groupNumber=groupNumber, name=groupName, eventId=eventID, members=members, username=username, is_admin=is_admin)

def check_admin():
    session_cookie = request.cookies.get('session')
    if session_cookie == None:
        return False, {}
    cookie = dict(jwt.decode(session_cookie, key='secret', algorithms='HS256')) 
    isAdmin = database.check_admin(cookie["groupId"])
    return isAdmin, cookie

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
    database.write_spot_leaving(group=group_info, spotType=spotType, slot=slot)
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
    scheduler.run_job('job')
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
    isAdmin = database.check_admin(session["groupId"])
    
    # Check queue status (queue is now list of dicts)
    in_assistance_queue = any(g['group'].groupId == group_info.groupId for g in assistance_queue)
    in_assistance_active = any(g['group'].groupId == group_info.groupId for g in assistance_active)
    
    return {
        "name": group_info.name, 
        "groupNumber": group_info.groupNumber, 
        "isAdmin": isAdmin, 
        "username": group_info.username, 
        "members": group_info.members, 
        "inAssistanceQueue": in_assistance_queue,
        "inAssistanceActive": in_assistance_active
    }

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

@app.route("/queue")
def queue():
    return {"cutter_queue": [group.groupNumber for group in cutter_queue],
            "hot_glue_queue": [group.groupNumber for group in hot_glue_queue],
            "cutter_stations": [{"name": group.name, "number": group.groupNumber} if hasattr(group, 'groupNumber') else group for group in cutter_stations],
            "hot_glue_stations": [{"name": group.name, "number": group.groupNumber} if hasattr(group, 'groupNumber') else group for group in hotglue_stations],
            "assistance_queue": [g['group'].groupNumber for g in assistance_queue] 
            }, 200

# Assistance Queue Endpoints

@app.route("/queue/assistance", methods=["GET"])
def get_assistance_queue():
    # Return full group info for admin
    # Wrap in dict to include message
    def format_item(item):
        d = asdict(item['group'])
        d['message'] = item['message']
        return d

    return {
        "queue": [format_item(item) for item in assistance_queue],
        "active": [format_item(item) for item in assistance_active]
    }, 200

@app.route("/queue/assistance/join", methods=["POST"])
def join_assistance_queue():
    valid, session = get_cookie()
    if not valid:
         return Response({"Not Authorized": ""}, status=401)
    
    group_info = getGroup(session["groupId"])
    message = request.json.get("message", "")
    
    # Check if already in queue (by ID)
    if not any(g['group'].groupId == group_info.groupId for g in assistance_queue) and not any(g['group'].groupId == group_info.groupId for g in assistance_active):
        assistance_queue.append({
            "group": group_info,
            "message": message
        })
        return {"status": "Joined"}, 200
    return {"status": "Already in queue"}, 400

@app.route("/queue/assistance/pop", methods=["POST"])
def pop_assistance_queue():
    valid, session = check_admin()
    if not valid:
        return Response({"Not Authorized": ""}, status=401)
        
    group_id = request.json.get("groupId") if request.json else None
    
    removed = None
    if group_id:
        # Find specific group
        for idx, item in enumerate(assistance_queue):
            if item['group'].groupId == group_id:
                removed = assistance_queue.pop(idx)
                break
        if not removed:
             return {"error": "Group not found in queue"}, 404
             
    elif len(assistance_queue) > 0:
        removed = assistance_queue.pop(0)
    else:
        return {"status": "Queue empty"}, 200

    if removed:
        # Move to active list if not already there (sanity check)
        if not any(g['group'].groupId == removed['group'].groupId for g in assistance_active):
             assistance_active.append(removed)
             
        # Format response
        d = asdict(removed['group'])
        d['message'] = removed['message']
        return {"status": "Popped", "group": d}, 200
        
    return {"status": "Queue empty"}, 200

@app.route("/queue/assistance/finish", methods=["POST"])
def finish_assistance():
    valid, session = check_admin()
    if not valid:
        return Response({"Not Authorized": ""}, status=401)
    
    group_id = request.json.get("groupId")
    if not group_id:
        return {"error": "Missing groupId"}, 400
        
    target_item = None
    for item in assistance_active:
        if item['group'].groupId == group_id:
            target_item = item
            break
            
    if target_item:
        assistance_active.remove(target_item)
        return {"status": "Finished"}, 200
        
    return {"error": "Group not found in active list"}, 404

@app.route("/queue/assistance/cancel", methods=["POST"])
def cancel_assistance():
    valid, session = get_cookie()
    if not valid:
        return Response({"Not Authorized": ""}, status=401)
        
    group_info = getGroup(session["groupId"])
    
    # Remove from queue if present
    target_in_queue = None
    for item in assistance_queue:
        if item['group'].groupId == group_info.groupId:
            target_in_queue = item
            break
            
    if target_in_queue:
        assistance_queue.remove(target_in_queue)
        return {"status": "Cancelled"}, 200
        
    return {"status": "Not in queue"}, 200

@app.route("/queue/assistance/remove", methods=["POST"])
def remove_assistance_queue():
    valid, session = check_admin()
    if not valid:
        return Response({"Not Authorized": ""}, status=401)
    
    group_id = request.json.get("groupId")
    if not group_id:
        return {"error": "Missing groupId"}, 400
        
    target_item = None
    for item in assistance_queue:
        if item['group'].groupId == group_id:
            target_item = item
            break
            
    if target_item:
        assistance_queue.remove(target_item)
        return {"status": "Removed"}, 200
        
    return {"error": "Group not found in queue"}, 404

@app.route("/countdown", methods=["GET", "POST"])
def countdown():
    if request.method == "GET":
        return countdown_info
    else:
        valid, session = check_admin()
        if not valid or not session["sessionId"]:
            return Response({"Not Authorized": ""}, status=401)  
        

@app.route("/status", methods=["GET"])
def status():
    valid, session = get_cookie()
    if not valid or not session["sessionId"]:
        return Response({"Not Authorized": ""}, status=401)  
    response = {}
    group_info = getGroup(groupId=session["groupId"])
    avg_cutter_time = database.get_avg_station_time("cutter")
    if avg_cutter_time == 0: avg_cutter_time = STATION_TIME # Default to station limit if no data
    
    avg_glue_time = database.get_avg_station_time("hotglue")
    if avg_glue_time == 0: avg_glue_time = STATION_TIME

    if group_info in cutter_queue:
        queue_info = {}
        queue_info["position"] = cutter_queue.index(group_info)
        # ETA = (Pos + 1) * AvgTime / NumStations
        eta_seconds = (queue_info["position"] + 1) * avg_cutter_time / CUTTER_STATIONS
        queue_info["ETA"] = round(eta_seconds / 60) # Minutes
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
        eta_seconds = (queue_info["position"] + 1) * avg_glue_time / HOT_GLUE_STATIONS
        queue_info["ETA"] = round(eta_seconds / 60)
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

@app.route("/admin/users", methods=["GET", "POST"])
def admin_users():
    valid, session = check_admin()
    if not valid:
        return Response({"Not Authorized": ""}, status=401)
    
    if request.method == "GET":
        groups = database.get_all_groups()
        # Convert to list of dicts
        groups_list = [{"groupId": g[0], "name": g[1], "number": g[2], "eventId": g[3], "members": g[4], "username": g[5], "isAdmin": g[6]} for g in groups]
        return {"users": groups_list}, 200
    
    elif request.method == "POST":
        data = request.json
        print(f"DEBUG: admin_users POST received data: {data}")
        # basic update
        if "groupId" in data and "name" in data and "number" in data:
            password = data.get("password") # Optional
            members = data.get("members") # Optional
            username = data.get("username") # Optional
            is_admin = data.get("isAdmin") # Optional
            database.update_group(data["groupId"], data["name"], data["number"], password, members, username, is_admin)
            return {"status": "Updated"}, 200
        return {"error": "Invalid Data"}, 400

@app.route("/admin/users/create", methods=["POST"])
def admin_create_user():
    valid, session = check_admin()
    if not valid:
        return Response({"Not Authorized": ""}, status=401)
    
    data = request.json
    if "name" in data and "number" in data:
        password = data.get("password")
        members = data.get("members")
        username = data.get("username")
        is_admin = data.get("isAdmin")
        # Default eventId to 1 for now
        new_id = database.create_group(data["name"], data["number"], 1, password, members, username, is_admin)
        return {"status": "Created", "groupId": new_id}, 200
    return {"error": "Missing name or number"}, 400

@app.route("/admin/users/delete", methods=["POST"])
def admin_delete_user():
    valid, session = check_admin()
    if not valid:
        return Response({"Not Authorized": ""}, status=401)
    
    data = request.json
    if "groupId" in data:
        success = database.delete_group(data["groupId"])
        if success:
            return {"status": "Deleted"}, 200
        else:
             return {"error": "Delete Failed"}, 500
    return {"error": "Missing groupId"}, 400

@app.route("/admin/config", methods=["POST"])
def admin_config():
    valid, session = check_admin()
    if not valid:
        return Response({"Not Authorized": ""}, status=401)
    
    data = request.json
    global CUTTER_STATIONS, HOT_GLUE_STATIONS, cutter_stations, cutter_stations_epochs, hotglue_stations, hot_glue_stations_epochs
    
    if "cutter_stations" in data:
        new_count = int(data["cutter_stations"])
        if new_count != CUTTER_STATIONS:
            CUTTER_STATIONS = new_count
            # Resize lists - Resetting for safety in this simple implementation
            # Ideally we would preserve existing state where possible
            cutter_stations = [0 for _ in range(CUTTER_STATIONS)]
            cutter_stations_epochs = [None for _ in range(CUTTER_STATIONS)]
            
    if "hot_glue_stations" in data:
        new_count = int(data["hot_glue_stations"])
        if new_count != HOT_GLUE_STATIONS:
            HOT_GLUE_STATIONS = new_count
            hotglue_stations = [0 for _ in range(HOT_GLUE_STATIONS)]
            hot_glue_stations_epochs = [None for _ in range(HOT_GLUE_STATIONS)]

    if "event" in data:
        countdown_info["event"] = data["event"]
    
    if "target_epoch" in data:
        try:
            countdown_info["target_epoch"] = int(data["target_epoch"])
        except:
            pass

    if "youtube_id" in data:
        countdown_info["youtube_id"] = data["youtube_id"]

    if "station_duration" in data:
        try:
            countdown_info["station_duration"] = int(data["station_duration"])
        except:
            pass
            
    # New Dynamic Config
    if "app_title" in data:
        countdown_info["app_title"] = data["app_title"]
        
    if "app_subtitle" in data:
        countdown_info["app_subtitle"] = data["app_subtitle"]

    return {"status": "Config Updated"}, 200

@app.route("/admin/config/language", methods=["GET", "POST"])
def admin_config_language():
    global DEFAULT_LANGUAGE
    if request.method == "GET":
        return {"language": DEFAULT_LANGUAGE}, 200
    
    valid, session = check_admin()
    if not valid:
        return Response({"Not Authorized": ""}, status=401)
    
    data = request.json
    if "language" in data:
        DEFAULT_LANGUAGE = data["language"]
        return {"status": "Updated", "language": DEFAULT_LANGUAGE}, 200
    return {"error": "Missing language"}, 400

@app.route("/admin/station/clear", methods=["POST"])
def admin_clear_station():
    valid, session = check_admin()
    if not valid:
        return Response({"Not Authorized": ""}, status=401)
        
    data = request.json
    station_type = data.get("type")
    station_index = data.get("index") # 0-indexed
    
    if station_type == "cutter" and 0 <= station_index < CUTTER_STATIONS:
        cutter_stations[station_index] = 0
        cutter_stations_epochs[station_index] = None
    elif station_type == "hotglue" and 0 <= station_index < HOT_GLUE_STATIONS:
        hotglue_stations[station_index] = 0
        hot_glue_stations_epochs[station_index] = None
    else:
        return {"error": "Invalid station"}, 400
        
    return {"status": "Cleared"}, 200

@app.route("/admin/station/toggle_disable", methods=["POST"])
def admin_toggle_disable():
    valid, session = check_admin()
    if not valid:
        return Response({"Not Authorized": ""}, status=401)
        
    data = request.json
    station_type = data.get("type")
    station_index = data.get("index")
    
    if station_type == "cutter" and 0 <= station_index < CUTTER_STATIONS:
        if cutter_stations[station_index] == 2:
            cutter_stations[station_index] = 0 # Re-enable
        else:
            cutter_stations[station_index] = 2 # Disable
            cutter_stations_epochs[station_index] = None
    elif station_type == "hotglue" and 0 <= station_index < HOT_GLUE_STATIONS:
        if hotglue_stations[station_index] == 2:
            hotglue_stations[station_index] = 0 # Re-enable
        else:
            hotglue_stations[station_index] = 2 # Disable
            hot_glue_stations_epochs[station_index] = None
    else:
        return {"error": "Invalid station"}, 400
        
    return {"status": "Toggled"}, 200

def main():
    scheduler.add_job(func=updater, trigger='interval', id='job', seconds=10)
    scheduler.start()
    app.run(host="0.0.0.0")

if __name__ == "__main__":
    main()