from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

connect_args = {"check_same_thread": False} if settings.database_url.startswith("sqlite") else {}
engine = create_engine(settings.database_url, connect_args=connect_args)

session_maker = sessionmaker(autocommit=False, autoflush=False, bind=engine)    
Base = declarative_base()

def get_db():
    db = None
    try:
        db = session_maker()
        yield db
    finally:
        if db is not None:
            db.close()
