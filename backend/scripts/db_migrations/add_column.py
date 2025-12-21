
import os
import psycopg2
# from dotenv import load_dotenv

# Try to load similar environment variables as app.py
DB_NAME = os.getenv('DB_NAME', 'techprojects')
DB_USER = os.getenv('DB_USER', 'techprojects')
DB_HOST = os.getenv('DB_HOST', '127.0.0.1')
DB_PASS = os.getenv('DB_PASSWORD', '12341234')
DB_PORT = 5432

def add_password_column():
    try:
        conn = psycopg2.connect(
            database=DB_NAME,
            user=DB_USER,
            host=DB_HOST,
            password=DB_PASS,
            port=DB_PORT
        )
        cur = conn.cursor()
        
        print("Connected to database.")
        
        # Check if column exists or just add it with IF NOT EXISTS (Postgres 9.6+)
        # For older postgres, we can catch the error, but IF NOT EXISTS is standard via DO block or just try/except
        
        try:
            print("Attempting to add 'password' column to 'groups' table...")
            cur.execute("ALTER TABLE groups ADD COLUMN IF NOT EXISTS password TEXT;")
            conn.commit()
            print("Successfully added (or already existed) 'password' column.")
        except Exception as e:
            conn.rollback()
            print(f"Error adding column: {e}")
            
        cur.close()
        conn.close()
        
    except Exception as e:
        print(f"Connection failed: {e}")

if __name__ == "__main__":
    add_password_column()
