import random
import json
from datetime import datetime, timedelta
import uuid

class SyntheticDataAgent:
    def __init__(self):
        self.now = datetime.now()

    def generate_log(self, service, log_level, message, details=None, trace_id=None):
        return {
            "log_id": str(uuid.uuid4()),
            "timestamp": self.now.strftime("%Y-%m-%dT%H:%M:%S"),
            "log_level": log_level,
            "service": service,
            "message": message,
            "details": details or {},
            "trace_id": trace_id or str(uuid.uuid4())
        }

    def generate_trace(self, service, operation, parent_id=None, status="OK", attributes=None):
        trace_id = str(uuid.uuid4())
        return {
            "trace_id": trace_id,
            "parent_id": parent_id,
            "service": service,
            "operation": operation,
            "start_time": (self.now - timedelta(seconds=random.randint(1, 10))).strftime("%Y-%m-%dT%H:%M:%S"),
            "end_time": self.now.strftime("%Y-%m-%dT%H:%M:%S"),
            "duration_ms": random.randint(100, 3000),
            "status": status,
            "attributes": attributes or {}
        }

    def generate_llm_call(self, system_message, user_prompt, model_output, confidence, step, parent_call_id=None):
        return {
            "call_id": str(uuid.uuid4()),
            "timestamp": self.now.strftime("%Y-%m-%dT%H:%M:%S"),
            "system_message": system_message,
            "user_prompt": user_prompt,
            "model_output": model_output,
            "confidence": confidence,
            "parent_call_id": parent_call_id,
            "metadata": {"step": step}
        }

    def generate_metrics(self):
        return {
            "latency_ms": random.randint(100, 1000),
            "throughput": random.randint(10, 100),
            "error_rate": round(random.uniform(0.01, 0.1), 2),
            "resource_usage": {
                "cpu": round(random.uniform(0.1, 1.0), 2),
                "memory": random.randint(100, 500)
            }
        }

    def generate_scenario(self):
        # Example scenario: Calendar event creation failure
        trace = self.generate_trace("calendar_service", "create_event", status="ERROR")
        log = self.generate_log(
            service="calendar_service",
            log_level="ERROR",
            message="Failed to create calendar event: Timezone conversion failed.",
            details={"input_timezone": "UTC", "target_timezone": "America/New_York"},
            trace_id=trace["trace_id"]
        )
        llm_call = self.generate_llm_call(
            system_message="You are a calendar assistant. Parse the meeting request and extract date, time, and attendees.",
            user_prompt="Schedule a meeting with John tomorrow at 2 PM",
            model_output="Meeting scheduled for 2024-03-20 at 14:00 UTC",
            confidence=0.95,
            step="parse_request"
        )
        return {
            "user_input": "Schedule a meeting with John tomorrow at 2 PM",
            "system_output": "Meeting scheduled successfully",
            "prod_logs": [log],
            "llm_calls": [llm_call],
            "traces": [trace],
            "metrics": self.generate_metrics()
        }

    def generate_batch(self, n=10):
        return [self.generate_scenario() for _ in range(n)]

if __name__ == "__main__":
    agent = SyntheticDataAgent()
    synthetic_data = agent.generate_batch(10)
    with open("synthetic_agent_issues.json", "w") as f:
        json.dump(synthetic_data, f, indent=2)
    print("Synthetic agent issues generated and saved as synthetic_agent_issues.json.") 