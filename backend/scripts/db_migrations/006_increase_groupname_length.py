
import sys
import os

# Add parent directory to path to import app
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app import app, database

def migrate():
    print("Running migration: Increasing groupName column length...")
    
    # We use the existing database instance initialized in app.py
    # This ensures we use the correct credentials and host
    try:
        cursor = database.cursor
        conn = database.db
        
        # Alter table to increase column length
        cursor.execute("ALTER TABLE groups ALTER COLUMN groupName TYPE VARCHAR(255);")
        cursor.execute("ALTER TABLE accepted ALTER COLUMN groupName TYPE VARCHAR(255);")
        cursor.execute("ALTER TABLE spots ALTER COLUMN groupName TYPE VARCHAR(255);")
        
        conn.commit()
        print("Successfully increased groupName length to 255 in groups, accepted, and spots tables.")
        
    except Exception as e:
        print(f"Migration failed: {e}")
        # Rolling back in case of error is good practice
        if 'conn' in locals():
            conn.rollback()

if __name__ == "__main__":
    migrate()
