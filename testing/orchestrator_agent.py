from fastapi import FastAPI
import requests
import json
from testing.rca_langchain_agent import chain
import os

app = FastAPI()
INGESTION_URL = "http://127.0.0.1:8000/all"
RCA_RESULTS_FILE = "rca_results.json"

def fetch_scenarios():
    resp = requests.get(INGESTION_URL)
    resp.raise_for_status()
    return resp.json()

def run_rca_on_scenarios(scenarios):
    results = []
    for i, scenario in enumerate(scenarios):
        scenario_str = json.dumps(scenario, indent=2)
        rca_result = chain.invoke({"scenario": scenario_str})["text"]
        results.append({
            "scenario_id": i + 1,
            "rca_report": rca_result
        })
    return results

@app.post("/run_rca")
def run_rca():
    scenarios = fetch_scenarios()
    rca_results = run_rca_on_scenarios(scenarios)
    with open(RCA_RESULTS_FILE, "w") as f:
        json.dump(rca_results, f, indent=2)
    return {"status": "RCA completed", "num_scenarios": len(rca_results)}

@app.get("/rca_results")
def get_results():
    if not os.path.exists(RCA_RESULTS_FILE):
        return {"error": "No RCA results found. Run /run_rca first."}
    with open(RCA_RESULTS_FILE) as f:
        return json.load(f)

if __name__ == "__main__":
    scenarios = fetch_scenarios()
    rca_results = run_rca_on_scenarios(scenarios)
    with open(RCA_RESULTS_FILE, "w") as f:
        json.dump(rca_results, f, indent=2)
    print(f"RCA completed for {len(rca_results)} scenarios. Results saved to {RCA_RESULTS_FILE}.") 