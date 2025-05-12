from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from api.models.database import Base, User, AuditLog, Notification, Project, ProjectMember, Issue, Trace
from config.settings import settings

# Create engine
engine = create_engine(settings.DATABASE_URL)

# Create session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

try:
    # Delete records from all tables
    db.query(AuditLog).delete()
    db.query(Notification).delete()
    db.query(ProjectMember).delete()
    db.query(Project).delete()
    db.query(Issue).delete()
    db.query(Trace).delete()
    db.query(User).delete()
    
    # Commit the changes
    db.commit()
    print("Successfully cleared all tables")
except Exception as e:
    print(f"Error clearing tables: {e}")
    db.rollback()
finally:
    db.close() 