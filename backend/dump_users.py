
import os
import psycopg2

DB_NAME = os.getenv('DB_NAME', 'techprojects')
DB_USER = os.getenv('DB_USER', 'techprojects')
DB_HOST = os.getenv('DB_HOST', '127.0.0.1')
DB_PASS = os.getenv('DB_PASSWORD', '12341234')
DB_PORT = 5432

def dump_users():
    try:
        conn = psycopg2.connect(database=DB_NAME, user=DB_USER, host=DB_HOST, password=DB_PASS, port=DB_PORT)
        cur = conn.cursor()
        
        # Select all relevant columns
        cur.execute("SELECT groupId, groupName, username, password, members FROM groups")
        rows = cur.fetchall()
        
        print(f"{'ID':<5} | {'GroupName':<20} | {'Username':<20} | {'Password':<20} | {'Members':<20}")
        print("-" * 115)
        for row in rows:
            print(f"{str(row[0]):<5} | {str(row[1]):<20} | {str(row[2]):<20} | {str(row[3]):<20} | {str(row[4]):<20}")
            
        cur.close()
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    dump_users()
