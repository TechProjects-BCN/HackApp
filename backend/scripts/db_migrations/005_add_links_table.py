import sys
import os

# Add parent directory to path to import app
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app import app, database

def run_migration():
    print("Creating links table...")
    try:
        # Use existing database connection from app
        conn = database.db
        cur = database.cursor
        
        cur.execute("""
            CREATE TABLE IF NOT EXISTS links (
                id SERIAL PRIMARY KEY,
                title TEXT NOT NULL,
                url TEXT NOT NULL,
                created_at FLOAT NOT NULL
            );
        """)
        
        conn.commit()
        print("Migration 005: Created links table successfully.")
        
    except Exception as e:
        print(f"Migration failed: {e}")
        if 'conn' in locals():
            conn.rollback()

if __name__ == "__main__":
    run_migration()
