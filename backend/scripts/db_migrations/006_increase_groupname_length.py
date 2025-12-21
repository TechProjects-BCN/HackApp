
import sys
import os

# Add parent directory to path to import app
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app import app
from src.DB import Database

def migrate():
    print("Running migration: Increasing groupName column length...")
    
    with app.app_context():
        try:
            db = Database()
            conn = db.get_connection()
            cursor = conn.cursor()
            
            # Alter table to increase column length
            cursor.execute("ALTER TABLE groups ALTER COLUMN groupName TYPE VARCHAR(255);")
            cursor.execute("ALTER TABLE accepted ALTER COLUMN groupName TYPE VARCHAR(255);")
            cursor.execute("ALTER TABLE spots ALTER COLUMN groupName TYPE VARCHAR(255);")
            
            conn.commit()
            print("Successfully increased groupName length to 255 in groups, accepted, and spots tables.")
            
        except Exception as e:
            print(f"Migration failed: {e}")
        finally:
            if 'cursor' in locals():
                cursor.close()
            if 'conn' in locals():
                conn.close()

if __name__ == "__main__":
    migrate()
