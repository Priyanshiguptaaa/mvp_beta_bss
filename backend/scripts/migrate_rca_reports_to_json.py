import os
import sys
import json
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Load DATABASE_URL from environment or set default
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:postgres@localhost:5432/echosys"
)
engine = create_engine(DATABASE_URL)
Session = sessionmaker(bind=engine)


def migrate_rca_reports():
    session = Session()
    try:
        incidents = session.execute(
            text("SELECT id, rca_report FROM incidents")
        ).fetchall()
        for incident in incidents:
            incident_id = incident[0]
            rca_report = incident[1]
            new_report = None
            # If already dict, skip
            if isinstance(rca_report, dict):
                continue
            # If it's a string, try to parse as JSON
            if isinstance(rca_report, str):
                try:
                    parsed = json.loads(rca_report)
                    if isinstance(parsed, dict):
                        new_report = parsed
                    else:
                        new_report = {"summary": str(rca_report)}
                except Exception:
                    new_report = {"summary": str(rca_report)}
            else:
                new_report = {"summary": str(rca_report)}
            # Update only if changed
            if new_report:
                session.execute(
                    text(
                        "UPDATE incidents SET rca_report = :new_report WHERE id = :id"
                    ),
                    {"new_report": json.dumps(new_report), "id": incident_id}
                )
                print(f"Updated incident {incident_id}")
        session.commit()
        print("Migration complete.")
    except Exception as e:
        print(f"Migration failed: {e}")
        session.rollback()
        sys.exit(1)
    finally:
        session.close()


if __name__ == "__main__":
    migrate_rca_reports() 