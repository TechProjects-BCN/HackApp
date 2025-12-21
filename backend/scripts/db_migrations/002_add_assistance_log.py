import os
import psycopg2

DB_NAME = os.getenv('DB_NAME', 'techprojects')
DB_USER = os.getenv('DB_USER', 'techprojects')
DB_HOST = os.getenv('DB_HOST', '127.0.0.1')
DB_PASS = os.getenv('DB_PASSWORD', '12341234')
DB_PORT = 5432

def apply_migration():
    try:
        conn = psycopg2.connect(
            database=DB_NAME,
            user=DB_USER,
            host=DB_HOST,
            password=DB_PASS,
            port=DB_PORT
        )
        cur = conn.cursor()
        
        print("Creating 'assistance_log' table...")
        cur.execute("""
            CREATE TABLE IF NOT EXISTS assistance_log (
                id SERIAL PRIMARY KEY,
                groupId INT NOT NULL,
                duration FLOAT NOT NULL,
                timestamp FLOAT NOT NULL
            );
        """)
        
        conn.commit()
        print("Migration successful: 'assistance_log' table created.")
        
        cur.close()
        conn.close()
        
    except Exception as e:
        print(f"Migration failed: {e}")

if __name__ == "__main__":
    apply_migration()
