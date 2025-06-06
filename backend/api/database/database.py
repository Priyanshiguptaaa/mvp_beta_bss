from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from config.settings import settings


# Use Railway's DATABASE_URL if available
SQLALCHEMY_DATABASE_URL = settings.DATABASE_URL
print(f"Using database URL: {SQLALCHEMY_DATABASE_URL}")

# Create engine without connect_args for PostgreSQL
engine = create_engine(SQLALCHEMY_DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close() 