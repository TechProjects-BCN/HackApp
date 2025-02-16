import psycopg2 as ps
import time
import threading


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

    def get_groups(self, eventID):
        try:
            self.db_lock.acquire(True)
            self.cursor.execute(f"""
                        SELECT groupId, groupName, groupNumber FROM groups WHERE eventID = {eventID}
                        """)
            output = self.cursor.fetchall()
            self.db.commit()
        finally:
            self.db_lock.release()
        return output
    
    def get_group(self, groupId):
        try:
            self.db_lock.acquire(True)
            self.cursor.execute(f"""
                        SELECT groupId, groupName, groupNumber FROM groups WHERE groupId = {groupId}
                        """)
            output = self.cursor.fetchall()
            self.db.commit()
        finally:
            self.db_lock.release()
        return output
    
    def save_dict(self, dictionary: dict, table_name: str):
        try:
            statement = f"""
                        INSERT INTO {table_name} (
                            {"".join([f"{n}, " for n in dictionary.keys()])}
                            Timestamp) 
                        VALUES (
                            {"".join([f"{n}, " for n in dictionary.values()])}
                            {time.time()})
                        """
            self.db_lock.acquire(True)
            self.cursor.execute(statement)
            self.db.commit()
        finally:
            self.db_lock.release()