
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
        
        print("Adding severity column to alerts table...")
        # Add severity column with default 'info'
        cur.execute("""
            ALTER TABLE alerts 
            ADD COLUMN IF NOT EXISTS severity VARCHAR(20) DEFAULT 'info';
        """)
        
        conn.commit()
        cur.close()
        conn.close()
        print("Migration 004: Added severity column successfully.")
        
    except Exception as e:
        print(f"Migration failed: {e}")

if __name__ == "__main__":
    run_migration()
