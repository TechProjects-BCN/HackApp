
import psycopg2
import os
import time

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
        
        print("Creating links table...")
        cur.execute("""
            CREATE TABLE IF NOT EXISTS links (
                id SERIAL PRIMARY KEY,
                title TEXT NOT NULL,
                url TEXT NOT NULL,
                created_at FLOAT NOT NULL
            );
        """)
        
        conn.commit()
        cur.close()
        conn.close()
        print("Migration 005: Created links table successfully.")
        
    except Exception as e:
        print(f"Migration failed: {e}")

if __name__ == "__main__":
    run_migration()
