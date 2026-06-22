from app.db.database import engine
from sqlalchemy import inspect

insp = inspect(engine)
for table in insp.get_table_names():
    print(table, [c['name'] for c in insp.get_columns(table)])
