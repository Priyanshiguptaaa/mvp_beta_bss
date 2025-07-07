from typing import Dict, Any
from langchain_community.chat_models import ChatOpenAI
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
import os
import logging
import json
import re

logger = logging.getLogger(__name__)


class RCAAgent:
    def __init__(self):
        self.llm = ChatOpenAI(
            model_name="gpt-4",
            temperature=0,
            openai_api_key=os.getenv("OPENAI_API_KEY")
        )
        
        self.prompt_template = PromptTemplate(
            input_variables=["scenario"],
            template=(
                "You are an expert Root Cause Analysis (RCA) agent for AI/LLM systems. "
                "Your job is to autonomously and thoroughly analyze the provided scenario "
                "data (including prod_logs, llm_calls, traces, and metrics) to identify the "
                "true root cause of any failure, hallucination, or incorrect output. Do not "
                "ask the user for more information, do not delegate RCA to the user, and do "
                "not provide generic or surface-level answers. Instead, deeply investigate "
                "the data, hypothesize plausible causes, and cross-reference evidence across "
                "all logs, traces, and LLM calls. Synthesize a clear, actionable, and well-"
                "justified root cause report, referencing the exact log_id, trace_id, and "
                "step (such as a specific LLM call or service) responsible. If there are "
                "multiple contributing factors, list each with supporting evidence. Provide "
                "a causal chain (step-by-step how the issue propagated) and suggest specific, "
                "actionable resolutions. Take full responsibility for the analysis and do not "
                "defer to the user. \n\n"
                "Output ONLY a valid JSON object with these exact keys and structure, with NO "
                "extra text, markdown, or explanation. Do NOT wrap the JSON in triple backticks "
                "or any other formatting. All keys must be plain, unquoted, and have no leading/"
                "trailing whitespace or newlines. The 'resolution' array can contain multiple "
                "actions, each as a separate object. \n\n"
                "Here is the required JSON schema and an example:\n\n"
                "{{\n"
                '  "summary": "Short summary of the incident",\n'
                '  "root_cause": "Detailed explanation of the root cause",\n'
                '  "contributing_factors": [\n'
                '    {{\n'
                '      "title": "Factor title",\n'
                '      "details": "Detailed explanation",\n'
                '      "log_id": "Relevant log ID",\n'
                '      "trace_id": "Relevant trace ID",\n'
                '      "timestamp": "When it occurred"\n'
                '    }}\n'
                '  ],\n'
                '  "replay": [\n'
                '    {{\n'
                '      "step": 1,\n'
                '      "title": "Step title",\n'
                '      "details": "What happened",\n'
                '      "timestamp": "When it happened"\n'
                '    }}\n'
                '  ],\n'
                '  "resolution": [\n'
                '    {{\n'
                '      "action": "Action to take",\n'
                '      "status": "pending",\n'
                '      "details": "Detailed explanation"\n'
                '    }},\n'
                '    {{\n'
                '      "action": "Another action to take",\n'
                '      "status": "completed",\n'
                '      "details": "Another detailed explanation"\n'
                '    }}\n'
                '  ]\n'
                "}}\n\n"
                "Data to analyze:\n{scenario}"
            )
        )
        
        self.chain = LLMChain(
            llm=self.llm,
            prompt=self.prompt_template
        )

    def _extract_json(self, text: str) -> str:
        """Extract the first JSON object from a string."""
        match = re.search(
            r"\{(?:[^{}]|(?R))*\}",
            text,
            re.DOTALL
        )
        if match:
            return match.group(0)
        raise ValueError("No JSON object found in LLM output.")

    def _normalize_keys(self, obj):
        def clean_key(k):
            return re.sub(r'\s+', '', k).replace('"', '').replace("'", "")
        if isinstance(obj, dict):
            return {clean_key(k): self._normalize_keys(v) for k, v in obj.items()}
        elif isinstance(obj, list):
            return [self._normalize_keys(item) for item in obj]
        else:
            return obj

    def _coerce_rca_report(self, rca_report: dict) -> dict:
        """Ensure RCA report has the correct structure with arrays for key fields"""
        def ensure_array(field, default_item):
            if not isinstance(rca_report.get(field), list):
                if isinstance(rca_report.get(field), str):
                    rca_report[field] = [default_item(rca_report[field])]
                else:
                    rca_report[field] = [default_item("No details provided")]

        # Ensure all required fields exist
        required_fields = [
            "summary",
            "root_cause",
            "contributing_factors",
            "replay",
            "resolution"
        ]
        for field in required_fields:
            if field not in rca_report:
                rca_report[field] = "No details provided" if field in ["summary", "root_cause"] else []

        # Ensure arrays have the correct structure
        ensure_array(
            "contributing_factors",
            lambda x: {
                "title": "Contributing Factor",
                "details": x,
                "log_id": "",
                "trace_id": "",
                "timestamp": ""
            }
        )

        ensure_array(
            "replay",
            lambda x: {
                "step": 1,
                "title": "Step",
                "details": x,
                "timestamp": ""
            }
        )

        ensure_array(
            "resolution",
            lambda x: {
                "action": x,
                "status": "pending",
                "details": x
            }
        )

        return rca_report

    def analyze_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze the processed data and return structured RCA JSON"""
        try:
            print("Calling LLM now...")
            try:
                result = self.chain.invoke({"scenario": json.dumps(data, indent=2)})
                print("LLM call finished.")
                print("LLM result object:", result)
                output = result.get('text', '')
                print("LLM output text:", output)
                print("\n=== RAW LLM OUTPUT ===\n" + output + "\n====================\n")
            except Exception as llm_exc:
                print("Exception during LLM call:", llm_exc)
                raise
            logger.debug(f"Raw LLM output: {output}")
            try:
                try:
                    rca_json = json.loads(output)
                except Exception:
                    # Try to extract JSON block if direct parse fails
                    extracted = self._extract_json(output)
                    rca_json = json.loads(extracted)
                rca_json = self._normalize_keys(rca_json)
                rca_json = self._coerce_rca_report(rca_json)
                return {
                    'rca_report': rca_json,
                    'status': 'success'
                }
            except Exception as e:
                logger.error(
                    "Failed to parse RCA LLM output as JSON. "
                    f"Raw output: {output}"
                )
                return {
                    'error': f'LLM did not return valid JSON: {e}',
                    'status': 'error',
                    'raw': output
                }
        except Exception as e:
            print("Exception in RCA agent:", e)
            logger.error(
                f"Error in RCA analysis: {str(e)}"
            )
            return {
                'error': str(e),
                'status': 'error'
            }

if __name__ == "__main__":
    # Minimal test scenario
    test_scenario = {
        "test_name": "Simple RCA Test",
        "test_result": {
            "answer_relevancy": {"score": 0.5, "threshold": 0.8, "passed": False},
            "faithfulness": {"score": 0.5, "threshold": 0.8, "passed": False},
            "hallucination": {"score": 0.5, "threshold": 0.8, "passed": False}
        },
        "environment": "test",
        "agent": "test-agent",
        "timestamp": "2024-06-13T12:00:00Z"
    }
    agent = RCAAgent()
    result = agent.analyze_data(test_scenario)
    print("\n=== RCA AGENT TEST RESULT ===")
    print(json.dumps(result, indent=2))
    print("============================\n") 