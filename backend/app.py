# Backend
import logging  
from flask import Flask, request, Response
from flask_apscheduler import APScheduler
import jwt
import os
import time
from flask_cors import CORS
from src import *
from src.StationSystem import StationSystem
from dataclasses import asdict
from functools import wraps

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

systems = {
    "cutter": StationSystem("cutter", 4),
    "hotglue": StationSystem("hotglue", 5)
}

assistance_queue = []
assistance_active = []
DEFAULT_LANGUAGE = "en"

app = Flask(__name__)
scheduler = APScheduler()
app = Flask(__name__)
scheduler = APScheduler()
# Allow requests from localhost:3000 and specific IP ranges
CORS(app, supports_credentials=True, origins=[r"http://.*", r"https://.*"])
database = Database(database=os.getenv('DB_NAME', 'techprojects'), user=os.getenv('DB_USER', 'techprojects'),
                    host=os.getenv('DB_HOST', '127.0.0.1'), password=os.getenv('DB_PASSWORD', '12341234'), port=5432)
app.logger.setLevel(logging.INFO)
#function executed by scheduled job
def updater():
    for system in systems.values():
        # Check if there's spot in the stations and if there's someone waiting on the queue
        if 0 in system.stations and len(system.queue) > 0:
            empty_slot = system.stations.index(0)
            station_time = countdown_info.get("station_duration", 10) * 60 + ACCEPT_TIME
            system.stations_epochs[empty_slot] = time.time() + station_time
            system.spot_to_accept.append(GroupToBeAccepted(system.queue.pop(0), False, time.time() + ACCEPT_TIME, empty_slot))
            system.stations[empty_slot] = 3
        
        # Check if someone either accepted the spot or ran out of time to accept
        to_remove = []
        for group in system.spot_to_accept:
            if time.time() > group.TimeLeft:  # Ran out of time
                system.stations[group.slot] = 0
                to_remove.append(group)
                if group.group not in system.failed_attempts: # Gets Blacklisted
                    system.failed_attempts.append(group.group)
                    system.queue.append(group.group)
            elif group.accepted: # Has Accepted
                if group.group in system.failed_attempts: # Removed from blacklist
                    system.failed_attempts.remove(group.group)
                system.stations[group.slot] = group.group
                database.write_spot_acceptance(group, spotType=system.name)
                to_remove.append(group)
    
        for group in to_remove:
            if group in system.spot_to_accept:
                system.spot_to_accept.remove(group)

        # Check for expired active sessions (Auto-Kick)
        for i, epoch in enumerate(system.stations_epochs):
            if epoch is not None and time.time() > epoch:
                # Check if station is actually occupied by a group (not 0=Free, 2=Disabled, 3=Reserved)
                if system.stations[i] not in [0, 2, 3]:
                    # Time is up for this group
                    group_obj = system.stations[i]
                    print(f"Auto-kicking Group {group_obj.groupId} from {system.name} Station {i+1}")
                    database.write_spot_leaving(group=group_obj, spotType=system.name, slot=i)
                    system.stations[i] = 0
                    system.stations_epochs[i] = None

    # app.logger.info(f"Queues: {[s.name + ': ' + str(len(s.queue)) for s in systems.values()]}")

def getGroup(groupId):
    groupId, groupName, groupNumber, eventID, members, username, is_admin = database.get_group(groupId)[0]
    return Group(groupId=groupId, groupNumber=groupNumber, name=groupName, eventId=eventID, members=members, username=username, is_admin=is_admin)

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        valid, session = get_cookie()
        if not valid or not session.get("sessionId"):
            return Response({"Not Authorized": ""}, status=401)
        return f(*args, **kwargs)
    return decorated_function

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        valid, session = check_admin()
        if not valid:
            return Response({"Not Authorized": ""}, status=401)
        return f(*args, **kwargs)
    return decorated_function

def check_admin():
    session_cookie = request.cookies.get('session')
    if session_cookie == None:
        return False, {}
    try:
        cookie = dict(jwt.decode(session_cookie, key='secret', algorithms='HS256')) 
        isAdmin = database.check_admin(cookie["groupId"])
        return isAdmin, cookie
    except:
        return False, {}

def get_cookie():
    session_cookie = request.cookies.get('session')
    if session_cookie == None:
        return False, {}
    try:
        return True, dict(jwt.decode(session_cookie, key='secret', algorithms='HS256'))
    except:
        return False, {} 

def addGroupToQueue(groupId, spotType):
    if spotType not in systems:
        print(f"Invalid spotType: {spotType}")
        return
    
    group_info = getGroup(groupId)
    system = systems[spotType]
    
    # Check if group is already in any system component
    groups_in_spot = [item.group for item in system.spot_to_accept]
    
    if (group_info not in system.queue and 
        group_info not in system.stations and 
        group_info not in groups_in_spot):
        system.queue.append(group_info)
        print(f"Added Group {groupId} to {spotType}")
    else:
        print(f"Group {groupId} tried to join {spotType} but is already in it")

def removeGroupFromQueue(groupId, spotType):
    if spotType not in systems:
        return
        
    group_info = getGroup(groupId)
    system = systems[spotType]
    
    if group_info in system.queue:
        system.queue.remove(group_info)
        print(f"Removed Group {groupId} from {spotType}")
    else:
        print(f"Group {groupId} not in {spotType} queue")

def removeGroupFromSpot(groupId, spotType):
    if spotType not in systems:
        return
        
    group_info = getGroup(groupId)
    system = systems[spotType]
    
    if group_info in system.stations:
        slot = system.stations.index(group_info)
        system.stations[slot] = 0
        system.stations_epochs[slot] = None
        database.write_spot_leaving(group=group_info, spotType=spotType, slot=slot)
        print(f"Removed Group {groupId} from {spotType} spot")

def acceptSpot(groupId, spotType):
    if spotType not in systems:
        return
        
    group_info = getGroup(groupId)
    system = systems[spotType]
    
    for group in system.spot_to_accept:
        if group.group == group_info:
            group.accepted = True
            return
            
    print(f"Error when accepting group {groupId}. They are not in spot queue")

def giveUpSpot(groupId, spotType):
    if spotType not in systems:
        return
        
    group_info = getGroup(groupId)
    system = systems[spotType]
    
    for group in system.spot_to_accept:
        if group.group == group_info:
            group.TimeLeft = 0 # Force expiration
            return

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
    response = {"assistance_queue": [g['group'].groupNumber for g in assistance_queue]}
    for name, system in systems.items():
        response[f"{name}_queue"] = [group.groupNumber for group in system.queue]
        response[f"{name}_stations"] = [{"name": group.name, "number": group.groupNumber} if hasattr(group, 'groupNumber') else group for group in system.stations]
    return response, 200

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
             removed["start_time"] = time.time() # Start timing
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
        # Check if item['group'] is a dict or object. Previous code suggests it might be object (asdict usage).
        # DB.py usually returns objects from fetchall but here it might be stored as object.
        # Let's check how it's stored. Line 330: assistance_active.append(removed).
        # Line 323: removed = assistance_queue.pop(0).
        # assistance_queue items come from /queue/assistance/join.
        # Let's assume item['group'] has groupId attribute based on line 333 asdict(removed['group']).
        if getattr(item['group'], 'groupId', None) == group_id or \
           (isinstance(item['group'], dict) and item['group'].get('groupId') == group_id):
            target_item = item
            break
            
    if target_item:
        assistance_active.remove(target_item)
        # Calculate duration if start_time exists
        duration = 0
        if "start_time" in target_item:
            duration = time.time() - target_item["start_time"]
            database.log_assistance(group_id, duration)
            
        return {"status": "Finished", "duration": duration}, 200
        
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
@app.route("/status", methods=["GET"])
@login_required
def status():
    # valid, session = get_cookie() already checked by decorator
    session_cookie = request.cookies.get('session')
    session = dict(jwt.decode(session_cookie, key='secret', algorithms='HS256'))

    response = {}
    group_info = getGroup(groupId=session["groupId"])
    
    for name, system in systems.items():
        avg_time = database.get_avg_station_time(name)
        if avg_time == 0: avg_time = STATION_TIME
        
        if group_info in system.queue:
            queue_info = {}
            queue_info["position"] = system.queue.index(group_info)
            eta_seconds = (queue_info["position"] + 1) * avg_time / system.num_stations
            queue_info["ETA"] = round(eta_seconds / 60)
            response[f"{name}Queue"] = queue_info
            
        elif group_info in system.stations:
            spot_info = {}
            spot_info["spotId"] = system.stations.index(group_info) + 1
            spot_info["EpochEnd"] = system.stations_epochs[system.stations.index(group_info)]
            response[f"{name}Station"] = spot_info
            
        for group in system.spot_to_accept:
            if group.group == group_info:
                spot_info = {}
                spot_info["spotId"] = group.slot + 1
                spot_info["EpochEnd"] = group.TimeLeft
                response[f"spot{name}ToAccept"] = spot_info
                break

    return response, 200

@app.route("/admin/stats/reset", methods=["POST"])
def admin_stats_reset():
    valid, session = check_admin()
    if not valid:
        return Response({"Not Authorized": ""}, status=401)
        
    success = database.reset_statistics()
    if success:
        return {"status": "Statistics Reset"}, 200
    else:
        return {"error": "Failed to reset statistics"}, 500

@app.route("/admin/stats", methods=["GET"])
def admin_stats():
    # Allow unauthenticated access for debugging if needed, but keeping it secure normally
    # But let's verify this endpoint is actually hit
    print("DEBUG: /admin/stats endpoint hit")
    valid, session = check_admin()
    if not valid:
        return Response({"Not Authorized": ""}, status=401)
    
    # DB Stats
    db_stats = database.get_statistics()
    
    # In-memory Stats
    mem_stats = {
        "assistance_queue_length": len(assistance_queue),
        "assistance_active_count": len(assistance_active),
        "cutter_queue_length": len(systems["cutter"].queue),
        "hotglue_queue_length": len(systems["hotglue"].queue),
        "cutter_stations_occupied": sum(1 for s in systems["cutter"].stations if s not in [0, 2]),
        "hotglue_stations_occupied": sum(1 for s in systems["hotglue"].stations if s not in [0, 2]),
        "cutter_avg_time": database.get_avg_station_time("cutter"),
        "hotglue_avg_time": database.get_avg_station_time("hotglue")
    }
    
    return {**db_stats, **mem_stats}, 200

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
@admin_required
def admin_config():
    data = request.json
    
    if "cutter_stations" in data:
        new_count = int(data["cutter_stations"])
        if new_count != systems["cutter"].num_stations:
            systems["cutter"].resize(new_count)
            
    if "hot_glue_stations" in data:
        new_count = int(data["hot_glue_stations"])
        if new_count != systems["hotglue"].num_stations:
            systems["hotglue"].resize(new_count)

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
@admin_required
def admin_clear_station():
    data = request.json
    station_type = data.get("type")
    station_index = data.get("index") # 0-indexed
    
    if station_type in systems and 0 <= station_index < systems[station_type].num_stations:
        systems[station_type].stations[station_index] = 0
        systems[station_type].stations_epochs[station_index] = None
    else:
        return {"error": "Invalid station"}, 400
        
    return {"status": "Cleared"}, 200

@app.route("/admin/station/toggle_disable", methods=["POST"])
@admin_required
def admin_toggle_disable():
    data = request.json
    station_type = data.get("type")
    station_index = data.get("index")
    
    if station_type in systems and 0 <= station_index < systems[station_type].num_stations:
        system = systems[station_type]
        if system.stations[station_index] == 2:
            system.stations[station_index] = 0 # Re-enable
        else:
            system.stations[station_index] = 2 # Disable
            system.stations_epochs[station_index] = None
    else:
        return {"error": "Invalid station"}, 400
        
    return {"status": "Toggled"}, 200

# Alerts Endpoints
@app.route("/alerts", methods=["GET"])
def get_alerts():
    return {"alerts": database.get_active_alerts()}, 200

@app.route("/admin/station/addtime", methods=["POST"])
@admin_required
def admin_station_add_time():
    data = request.json
    spot_type = data.get("spotType")
    station_id = data.get("stationId")
    minutes = data.get("minutes", 1) # Default 1 minute
    
    if not spot_type or not station_id:
        return {"error": "Missing parameters"}, 400
        
    if spot_type in systems:
        system = systems[spot_type]
        idx = int(station_id) - 1
        
        if 0 <= idx < len(system.stations):
            group_info = system.stations[idx]
            
            # Check if station is occupied by a group (and not disabled/reserved)
            # Station can be 0 (free), 2 (disabled), 3 (reserved), or Group object
            if isinstance(group_info, Group): 
                # Add time in memory (extend expiration)
                if system.stations_epochs[idx] is not None:
                     system.stations_epochs[idx] += (minutes * 60)
                     
                # Add time in DB (shift accepted time forward)
                if database.add_station_time(group_info.groupId, spot_type, minutes * 60):
                    return {"status": "Time Added", "new_epoch": system.stations_epochs[idx]}, 200
                else:
                    return {"error": "DB Update Failed"}, 500
                    
            return {"error": "Station not occupied by a group"}, 400
            
    return {"error": "Invalid Station"}, 400

@app.route("/admin/alerts", methods=["POST"])
@admin_required
def create_alert():
    data = request.json
    message = data.get("message")
    alert_type = data.get("type", "onetime")
    severity = data.get("severity", "info")
    
    if not message:
        return {"error": "Message required"}, 400
        
    new_id = database.create_alert(message, alert_type, severity)
    if new_id:
        return {"status": "Created", "id": new_id}, 200
    return {"error": "Failed to create alert"}, 500

@app.route("/admin/alerts/delete", methods=["POST"])
@admin_required
def delete_alert():
    data = request.json
    alert_id = data.get("id")
    if database.deactivate_alert(alert_id):
        return {"status": "Deactivated"}, 200
    return {"error": "Failed to deactivate"}, 500

# Links Endpoints
@app.route("/links", methods=["GET"])
def get_links():
    return {"links": database.get_links()}, 200

@app.route("/admin/links", methods=["POST"])
@admin_required
def create_link():
    data = request.json
    title = data.get("title")
    url = data.get("url")
    
    if not title or not url:
        return {"error": "Title and URL required"}, 400
        
    new_id = database.create_link(title, url)
    if new_id:
        return {"status": "Created", "id": new_id}, 200
    return {"error": "Failed to create link"}, 500

@app.route("/admin/links/delete", methods=["POST"])
@admin_required
def delete_link():
    data = request.json
    link_id = data.get("id")
    if database.delete_link(link_id):
        return {"status": "Deleted"}, 200
    return {"error": "Failed to delete"}, 500

def main():
    scheduler.add_job(func=updater, trigger='interval', id='job', seconds=10)
    scheduler.start()
    app.run(host="0.0.0.0")

if __name__ == "__main__":
    main()