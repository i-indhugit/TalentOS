import sqlite3
import os

print(f"File exists: {os.path.exists('talentos.db')}")
print(f"Absolute path: {os.path.abspath('talentos.db')}")
conn = sqlite3.connect('talentos.db')
cursor = conn.cursor()
cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
print("Tables:", cursor.fetchall())
try:
    cursor.execute("PRAGMA table_info(candidates);")
    print("Candidates cols:", [x[1] for x in cursor.fetchall()])
except Exception as e:
    print("Error:", e)
conn.close()
