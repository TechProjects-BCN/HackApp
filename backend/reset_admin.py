
import os
import psycopg2

DB_NAME = os.getenv('DB_NAME', 'techprojects')
DB_USER = os.getenv('DB_USER', 'techprojects')
DB_HOST = os.getenv('DB_HOST', '127.0.0.1')
DB_PASS = os.getenv('DB_PASSWORD', '12341234')
DB_PORT = 5432

def reset_admin():
    try:
        conn = psycopg2.connect(database=DB_NAME, user=DB_USER, host=DB_HOST, password=DB_PASS, port=DB_PORT)
        cur = conn.cursor()
        
        print("Resetting Admin credentials to admin/admin...")
        
        # Update ID 1 (Administrator)
        cur.execute("UPDATE groups SET groupName = 'admin', password = 'admin', isAdmin = 1 WHERE groupId = 1")
        
        # Ensure it's also in admins table if not there
        cur.execute("SELECT 1 FROM admins WHERE groupId = 1")
        if not cur.fetchone():
             cur.execute("INSERT INTO admins (groupId) VALUES (1)")
             
        conn.commit()
        print("Done. ID 1 is now groupName='admin', password='admin', isAdmin=1.")
            
        cur.close()
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    reset_admin()
