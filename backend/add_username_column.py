
import os
import psycopg2
from urllib.parse import urlparse

# Fallback to local DB if valid URL not present
DB_URL = os.environ.get("DATABASE_URL")
if not DB_URL or not DB_URL.startswith("postgres"):
    DB_URL = "postgresql://postgres:password@localhost:5432/hackapp"

def add_column():
    try:
        conn = psycopg2.connect(DB_URL)
        cur = conn.cursor()
        
        # Add username column
        print("Adding username column...")
        try:
            cur.execute("ALTER TABLE groups ADD COLUMN username TEXT")
            print("Column 'username' added.")
        except Exception as e:
            print(f"Error adding column (might exist): {e}")
            conn.rollback()
        else:
            conn.commit()

        # Update existing rows
        print("Updating existing rows...")
        cur.execute("UPDATE groups SET username = 'admin' WHERE groupId = 1") # Assume ID 1 is admin
        # For others, default username to groupName without spaces, lowercased
        cur.execute("UPDATE groups SET username = LOWER(REPLACE(groupName, ' ', '')) WHERE username IS NULL")
        
        conn.commit()
        print("Migration complete.")
        
        cur.close()
        conn.close()
    except Exception as e:
        print(f"Connection failed: {e}")

if __name__ == "__main__":
    add_column()
