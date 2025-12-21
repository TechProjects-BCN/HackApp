import psycopg2 as ps
import time
import threading
from .Definitions import GroupToBeAccepted, Group

class Database:
    def __init__(self, database, user, host, password, port):
        # Global variables
        self.connection = False
        self.database = database
        self.user = user
        self.host = host
        self.password = password
        self.port = port

        self.db_lock = threading.Lock()
        self.db = ps.connect(database=self.database, user=self.user, host=self.host, password=self.password, port=self.port)
        self.cursor = self.db.cursor()
        print("Database Initialized")

    def get_group(self, groupId):
        try:
            self.db_lock.acquire(True)
            self.cursor.execute(f"""
                        SELECT groupId, groupName, groupNumber, eventID, members, username, isadmin FROM groups WHERE groupId = {groupId}
                        """)
            output = self.cursor.fetchall()
            self.db.commit()
            return output
        except Exception as e:
            self.db.rollback()
            print(f"DB Error in get_group: {e}")
            raise e
        finally:
            self.db_lock.release()
    
    def write_spot_acceptance(self, group: GroupToBeAccepted, spotType: str):
        try:
            self.db_lock.acquire(True)
            self.cursor.execute(f"""
                        INSERT INTO accepted(groupId, spotId, spotType, groupName, groupNumber, eventID, AcceptedTime) VALUES ({group.group.groupId}, {group.slot}, '{spotType}', '{group.group.name}', {group.group.groupNumber}, {group.group.eventId}, {time.time()})
                        """)
            self.db.commit()
        except Exception as e:
            self.db.rollback()
            print(f"DB Error in write_spot_acceptance: {e}")
            raise e
        finally:
            self.db_lock.release()

    def write_spot_leaving(self, group: Group, spotType: str, slot: int):
        try:
            self.db_lock.acquire(True)
            self.cursor.execute(f"""
                        SELECT DISTINCT ON (groupId) requestid FROM accepted WHERE groupid = {group.groupId} AND spottype = '{spotType}' ORDER BY groupId, AcceptedTime DESC;
                                """)
            acceptedId = self.cursor.fetchall()[0][0]
            self.db.commit()
            self.cursor.execute(f"""
                        INSERT INTO spots(acceptedId, groupId, spotId, spotType, groupName, groupNumber, eventID, LeftTime) VALUES ({acceptedId}, {group.groupId}, {slot}, '{spotType}', '{group.name}', {group.groupNumber}, {group.eventId}, {time.time()})
                        """)
            self.db.commit()
        except Exception as e:
            self.db.rollback()
            print(f"DB Error in write_spot_leaving: {e}")
            raise e
        finally:
            self.db_lock.release()

    def check_admin(self, groupid):
        try:
            self.db_lock.acquire(True)
            self.cursor.execute(f"""
                    SELECT isadmin FROM groups WHERE groupId = {groupid}
            """)
            result = self.cursor.fetchone()
            return result[0] if result else False
        except Exception as e:
            self.db.rollback()
            print(f"DB Error in check_admin: {e}")
            raise e
        finally:
            self.db_lock.release()

    def get_all_groups(self):
        try:
            self.db_lock.acquire(True)
            self.cursor.execute("SELECT groupId, groupName, groupNumber, eventID, members, username, isadmin FROM groups ORDER BY groupNumber ASC")
            output = self.cursor.fetchall()
            self.db.commit()
            return output
        except Exception as e:
            self.db.rollback()
            print(f"DB Error in get_all_groups: {e}")
            raise e
        finally:
            self.db_lock.release()

    def update_group(self, groupId, name, number, password=None, members=None, username=None, is_admin=None):
        try:
            self.db_lock.acquire(True)
            # Construct the update query dynamically
            query = f"UPDATE groups SET groupName = '{name}', groupNumber = {number}"
            if username:
                 query += f", username = '{username}'"
            if password:
                query += f", password = '{password}'"
            if members is not None:
                query += f", members = '{members}'"
            
            if is_admin is not None:
                val = 1 if is_admin else 0
                query += f", isadmin = {val}"
            
            query += f" WHERE groupId = {groupId}"
            
            print(f"DEBUG: update_group Query: {query}")
            self.cursor.execute(query)

            # Sync admins table
            if is_admin is not None:
                if is_admin:
                    self.cursor.execute(f"SELECT 1 FROM admins WHERE groupId = {groupId}")
                    if not self.cursor.fetchone():
                         self.cursor.execute(f"INSERT INTO admins (groupId) VALUES ({groupId})")
                else:
                    self.cursor.execute(f"DELETE FROM admins WHERE groupId = {groupId}")

            self.db.commit()
        except Exception as e:
            self.db.rollback()
            print(f"DB Error in update_group: {e}")
            raise e
        finally:
            self.db_lock.release()

    def create_group(self, name, number, eventId, password=None, members=None, username=None, is_admin=False):
        try:
            self.db_lock.acquire(True)
            if members is None:
                members = ""
            if password is None:
                password = ""
            if username is None:
                username = name.replace(" ", "").lower() # Default username derived from name
            
            val = 1 if is_admin else 0
            self.cursor.execute(f"INSERT INTO groups (groupName, groupNumber, eventID, password, members, username, isadmin) VALUES ('{name}', {number}, {eventId}, '{password}', '{members}', '{username}', {val}) RETURNING groupId")
            new_id = self.cursor.fetchone()[0]
            
            # Sync admins table
            if is_admin:
                self.cursor.execute(f"INSERT INTO admins (groupId) VALUES ({new_id})")

            self.db.commit()
            return new_id
        except Exception as e:
            self.db.rollback()
            print(f"DB Error in create_group: {e}")
            raise e
        finally:
            self.db_lock.release()

    def delete_group(self, groupId):
        try:
            self.db_lock.acquire(True)
            self.cursor.execute(f"DELETE FROM groups WHERE groupId = {groupId}")
            self.db.commit()
            return True
        except Exception as e:
            self.db.rollback()
            print(f"DB Error in delete_group: {e}")
            return False
        finally:
            self.db_lock.release()
            
    def remove_from_station_log(self, groupId, spotType, slot):
        pass

    def get_avg_station_time(self, spotType):
        try:
            self.db_lock.acquire(True)
            # Calculate average duration (LeftTime - AcceptedTime) for the last 20 sessions
            # Optimization: Limit to last 20 sessions to ensure speed even with large DB
            self.cursor.execute(f"""
                SELECT AVG(duration)
                FROM (
                    SELECT EXTRACT(EPOCH FROM (to_timestamp(LeftTime) - to_timestamp(AcceptedTime))) as duration
                    FROM spots
                    JOIN accepted ON spots.acceptedId = accepted.requestid
                    WHERE spots.spotType = '{spotType}'
                    AND spots.LeftTime IS NOT NULL
                    ORDER BY spots.LeftTime DESC
                    LIMIT 20
                ) as recent_sessions;
            """)
            result = self.cursor.fetchone()
            if result and result[0] is not None:
                return float(result[0])
            return 0
        except Exception as e:
            self.db.rollback()
            print(f"DB Error in get_avg_station_time: {e}")
            return 0
        finally:
            self.db_lock.release()

    def get_statistics(self):
        try:
            self.db_lock.acquire(True)
            stats = {}
            
            # Total Groups
            self.cursor.execute("SELECT COUNT(*) FROM groups")
            stats["total_groups"] = self.cursor.fetchone()[0]
            
            # Total Sessions per type
            self.cursor.execute("SELECT spotType, COUNT(*) FROM spots GROUP BY spotType")
            rows = self.cursor.fetchall()
            for row in rows:
                stats[f"total_sessions_{row[0]}"] = row[1]
            
            # Assistance Stats
            self.cursor.execute("SELECT COUNT(*), AVG(duration) FROM assistance_log")
            asst_row = self.cursor.fetchone()
            stats["assistance_total_helped"] = asst_row[0] if asst_row else 0
            stats["assistance_avg_time"] = float(asst_row[1]) if asst_row and asst_row[1] else 0.0

            # Usage History (Sessions per hour per type) - Last 24h
            self.cursor.execute("""
                SELECT 
                    date_part('hour', to_timestamp(LeftTime)) as hour,
                    spotType,
                    COUNT(*)
                FROM spots 
                WHERE LeftTime IS NOT NULL
                AND LeftTime > (EXTRACT(EPOCH FROM NOW()) - 86400)
                GROUP BY 1, 2
                ORDER BY 1
            """)
            usage_rows = self.cursor.fetchall()
            usage_data = {}
            for r in usage_rows:
                h = int(r[0])
                t = r[1]
                c = r[2]
                if h not in usage_data: usage_data[h] = {"cutter": 0, "hotglue": 0}
                usage_data[h][t] = c
            stats["usage_history"] = usage_data

            # Group Leaderboard (Top 10 Active Groups)
            print("DEBUG: Executing Leaderboard Query with groupName")
            self.cursor.execute("""
                SELECT 
                    g.groupName,
                    s.spotType,
                    COUNT(*) as count
                FROM spots s
                JOIN accepted a ON s.acceptedId = a.requestid
                JOIN groups g ON a.groupId = g.groupId
                WHERE s.LeftTime IS NOT NULL
                GROUP BY g.groupName, s.spotType
            """)
            raw_leaderboard = self.cursor.fetchall()
            
            # Aggregate by group
            group_stats = {}
            for row in raw_leaderboard:
                name = row[0]
                stype = row[1]
                count = row[2]
                
                if name not in group_stats:
                    group_stats[name] = {"name": name, "cutter": 0, "hotglue": 0, "total": 0}
                
                group_stats[name][stype] += count
                group_stats[name]["total"] += count
            
            # Sort by total and take top 10
            leaderboard = sorted(group_stats.values(), key=lambda x: x["total"], reverse=True)[:10]
            stats["leaderboard"] = leaderboard

            return stats
        except Exception as e:
            self.db.rollback() 
            print(f"DB Error in get_statistics: {e}")
            return {}
        finally:
            self.db_lock.release()

    def log_assistance(self, groupId, duration):
        try:
            self.db_lock.acquire(True)
            self.cursor.execute(f"INSERT INTO assistance_log (groupId, duration, timestamp) VALUES ({groupId}, {duration}, {time.time()})")
            self.db.commit()
        except Exception as e:
            self.db.rollback()
            print(f"DB Error in log_assistance: {e}")
        finally:
            self.db_lock.release()

    def reset_statistics(self):
        try:
            self.db_lock.acquire(True)
            self.cursor.execute("TRUNCATE TABLE spots, accepted, assistance_log")
            self.db.commit()
            return True
        except Exception as e:
            self.db.rollback()
            print(f"DB Error in reset_statistics: {e}")
            return False
        finally:
            self.db_lock.release()

    # Alerts Methods
    def create_alert(self, message, alert_type, severity="info"):
        try:
            self.db_lock.acquire(True)
            self.cursor.execute(f"INSERT INTO alerts (message, type, severity, created_at, is_active) VALUES ('{message}', '{alert_type}', '{severity}', {time.time()}, TRUE) RETURNING id")
            new_id = self.cursor.fetchone()[0]
            self.db.commit()
            return new_id
        except Exception as e:
            self.db.rollback()
            print(f"DB Error in create_alert: {e}")
            return None
        finally:
            self.db_lock.release()

    def get_active_alerts(self):
        try:
            self.db_lock.acquire(True)
            self.cursor.execute("SELECT id, message, type, created_at, severity FROM alerts WHERE is_active = TRUE ORDER BY created_at DESC")
            rows = self.cursor.fetchall()
            alerts = []
            for row in rows:
                alerts.append({
                    "id": row[0],
                    "message": row[1],
                    "type": row[2],
                    "created_at": row[3],
                    "severity": row[4] if len(row) > 4 else "info"
                })
            return alerts
        except Exception as e:
            self.db.rollback()
            print(f"DB Error in get_active_alerts: {e}")
            return []
        finally:
            self.db_lock.release()

    # Links Methods
    def create_link(self, title, url):
        try:
            self.db_lock.acquire(True)
            self.cursor.execute(f"INSERT INTO links (title, url, created_at) VALUES ('{title}', '{url}', {time.time()}) RETURNING id")
            new_id = self.cursor.fetchone()[0]
            self.db.commit()
            return new_id
        except Exception as e:
            self.db.rollback()
            print(f"DB Error in create_link: {e}")
            return None
        finally:
            self.db_lock.release()

    def get_links(self):
        try:
            self.db_lock.acquire(True)
            self.cursor.execute("SELECT id, title, url FROM links ORDER BY created_at ASC")
            rows = self.cursor.fetchall()
            links = []
            for row in rows:
                links.append({
                    "id": row[0],
                    "title": row[1],
                    "url": row[2]
                })
            return links
        except Exception as e:
            self.db.rollback()
            print(f"DB Error in get_links: {e}")
            return []
        finally:
            self.db_lock.release()

    def delete_link(self, link_id):
        try:
            self.db_lock.acquire(True)
            self.cursor.execute(f"DELETE FROM links WHERE id = {link_id}")
            self.db.commit()
            return True
        except Exception as e:
            self.db.rollback()
            print(f"DB Error in delete_link: {e}")
            return False
        finally:
            self.db_lock.release()
            
    def deactivate_alert(self, alert_id):
        try:
            self.db_lock.acquire(True)
            self.cursor.execute(f"UPDATE alerts SET is_active = FALSE WHERE id = {alert_id}")
            self.db.commit()
            return True
        except Exception as e:
            self.db.rollback()
            print(f"DB Error in deactivate_alert: {e}")
            return False
        finally:
            self.db_lock.release()

    def add_station_time(self, groupId, spotType, seconds):
        try:
            self.db_lock.acquire(True)
            # Update the latest accepted record for this group/type
            # Subquery to find the specific row ID first is safest
            self.cursor.execute(f"""
                UPDATE accepted 
                SET AcceptedTime = AcceptedTime + {seconds} 
                WHERE requestid = (
                    SELECT requestid FROM accepted 
                    WHERE groupid = {groupId} AND spottype = '{spotType}' 
                    ORDER BY AcceptedTime DESC LIMIT 1
                )
            """)
            self.db.commit()
            return True
        except Exception as e:
            self.db.rollback()
            print(f"DB Error in add_station_time: {e}")
            return False
        finally:
            self.db_lock.release()