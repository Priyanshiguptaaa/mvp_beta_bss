from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from api.models.database import Trace, User
from config.settings import settings
import json
from collections import defaultdict

# Create engine
engine = create_engine(settings.DATABASE_URL)

# Create session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

try:
    # First, let's see all users
    users = db.query(User).all()
    print("\n=== Users in Database ===")
    for user in users:
        print(f"\nUser ID: {user.id}")
        print(f"Email: {user.email}")
        print(f"API Key: {user.api_key}")
        print("-" * 50)
    
    # Query all traces
    traces = db.query(Trace).all()
    
    # Store properties for each data type
    data_type_properties = defaultdict(set)
    
    for trace in traces:
        try:
            # Handle both string and dict content
            if isinstance(trace.content, str):
                content = json.loads(trace.content)
            else:
                content = trace.content
                
            data_type = content.get('type')
            if data_type:
                # Get all keys from the content
                def get_keys(d, prefix=''):
                    for k, v in d.items():
                        current_key = f"{prefix}.{k}" if prefix else k
                        data_type_properties[data_type].add(current_key)
                        if isinstance(v, dict):
                            get_keys(v, current_key)
                
                get_keys(content)
                
        except Exception as e:
            print(f"Error processing trace {trace.id}: {str(e)}")
            continue
    
    print("\nProperties for each data type:")
    print("------------------------------")
    for data_type in sorted(data_type_properties.keys()):
        print(f"\n{data_type.upper()}:")
        for prop in sorted(data_type_properties[data_type]):
            print(f"- {prop}")

except Exception as e:
    print(f"Error: {str(e)}")
finally:
    db.close() 