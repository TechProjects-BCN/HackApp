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
                        SELECT groupId, groupName, groupNumber, eventID FROM groups WHERE groupId = {groupId}
                        """)
            output = self.cursor.fetchall()
            self.db.commit()
        finally:
            self.db_lock.release()
        return output
    
    def write_spot_acceptance(self, group: GroupToBeAccepted, spotType: str):
        try:
            self.db_lock.acquire(True)
            self.cursor.execute(f"""
                        INSERT INTO accepted(groupId, spotId, spotType, groupName, groupNumber, eventID, AcceptedTime) VALUES ({group.group.groupId}, {group.slot}, '{spotType}', '{group.group.name}', {group.group.groupNumber}, {group.group.eventId}, {time.time()})
                        """)
            self.db.commit()
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
        finally:
            self.db_lock.release()

    def check_admin(self, groupid):
        try:
            self.db_lock.acquire(True)
            self.cursor.execute(f"""
                    SELECT * FROM admins WHERE admins.groupId = {groupid}
            """)
            result = self.cursor.fetchall()
            if result:
                return True
            else:
                return False
        finally:
            self.db_lock.release()