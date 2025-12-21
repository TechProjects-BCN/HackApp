
import psycopg2
import os

DB_NAME = os.getenv('DB_NAME', 'techprojects')
DB_USER = os.getenv('DB_USER', 'techprojects')
DB_HOST = os.getenv('DB_HOST', '127.0.0.1')
DB_PASSWORD = os.getenv('DB_PASSWORD', '12341234')
DB_PORT = 5432

def run_migration():
    try:
        conn = psycopg2.connect(
            database=DB_NAME,
            user=DB_USER,
            host=DB_HOST,
            password=DB_PASSWORD,
            port=DB_PORT
        )
        cur = conn.cursor()
        
        print("Creating alerts table...")
        cur.execute("""
            CREATE TABLE IF NOT EXISTS alerts (
                id SERIAL PRIMARY KEY,
                message TEXT NOT NULL,
                type VARCHAR(20) NOT NULL, -- 'onetime' or 'persistent'
                is_active BOOLEAN DEFAULT TRUE,
                created_at FLOAT NOT NULL
            );
        """)
        
        conn.commit()
        cur.close()
        conn.close()
        print("Migration 003: Alerts table created successfully.")
        
    except Exception as e:
        print(f"Migration failed: {e}")

if __name__ == "__main__":
    run_migration()
