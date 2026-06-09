import os
import sys
sys.path.append('.')
from app.database.session import engine
from sqlalchemy import inspect

inspector = inspect(engine)
print("DB URL:", engine.url)
print("CWD:", os.getcwd())
print("Tables in DB:", inspector.get_table_names())
for table in inspector.get_table_names():
    print(f"Table '{table}' columns: { [c['name'] for c in inspector.get_columns(table)] }")
