
import os
import psycopg2

DB_NAME = os.getenv('DB_NAME', 'techprojects')
DB_USER = os.getenv('DB_USER', 'techprojects')
DB_HOST = os.getenv('DB_HOST', '127.0.0.1')
DB_PASS = os.getenv('DB_PASSWORD', '12341234')
DB_PORT = 5432

def test_login(username, password):
    try:
        conn = psycopg2.connect(database=DB_NAME, user=DB_USER, host=DB_HOST, password=DB_PASS, port=DB_PORT)
        cur = conn.cursor()
        
        print(f"Testing login for User: '{username}', Pass: '{password}'")
        
        # Exact query logic from frontend
        cur.execute("SELECT groupId FROM groups WHERE LOWER(groupName) = LOWER(%s) AND password = %s", (username, password))
        rows = cur.fetchall()
        
        if rows:
            print(f"SUCCESS! Found groupId: {rows[0][0]}")
        else:
            print("FAILURE! No match found.")
            
        cur.close()
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_login("Administrator", "laser")
    test_login("Laser Harp", "harp")
    test_login("administrator", "laser") # Case insensitive check
