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
            self.cursor.execute(f"""
                SELECT AVG(recent_sessions.duration)
                FROM (
                    SELECT (spots.LeftTime - accepted.AcceptedTime) as duration
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