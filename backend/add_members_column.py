
import os
import psycopg2

DB_NAME = os.getenv('DB_NAME', 'techprojects')
DB_USER = os.getenv('DB_USER', 'techprojects')
DB_HOST = os.getenv('DB_HOST', '127.0.0.1')
DB_PASS = os.getenv('DB_PASSWORD', '12341234')
DB_PORT = 5432

def add_members_column():
    try:
        conn = psycopg2.connect(database=DB_NAME, user=DB_USER, host=DB_HOST, password=DB_PASS, port=DB_PORT)
        cur = conn.cursor()
        
        print("Adding 'members' column to 'groups' table...")
        cur.execute("ALTER TABLE groups ADD COLUMN IF NOT EXISTS members TEXT;")
        conn.commit()
        print("Success.")
            
        cur.close()
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    add_members_column()
