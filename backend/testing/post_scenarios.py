import json
import requests

INGEST_URL = "http://127.0.0.1:8000/ingest"

with open("synthetic_agent_issues.json") as f:
    scenarios = json.load(f)

for i, scenario in enumerate(scenarios):
    resp = requests.post(INGEST_URL, json=scenario)
    print(f"Scenario {i+1} status: {resp.status_code}, response: {resp.json()}") 