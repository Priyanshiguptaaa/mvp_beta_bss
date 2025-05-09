import os
from dotenv import load_dotenv
load_dotenv()

import json
from langchain_community.chat_models import ChatOpenAI
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain

# Advanced Prompt template for RCA
prompt_template = (
    "You are an expert Root Cause Analysis (RCA) agent for AI/LLM systems. "
    "Your job is to autonomously and thoroughly analyze the provided scenario data "
    "(including prod_logs, llm_calls, traces, and metrics) to identify the true root cause "
    "of any failure, hallucination, or incorrect output. Do not ask the user for more information, "
    "do not delegate RCA to the user, and do not provide generic or surface-level answers. "
    "Instead, deeply investigate the data, hypothesize plausible causes, and cross-reference evidence "
    "across all logs, traces, and LLM calls. Synthesize a clear, actionable, and well-justified root cause "
    "report, referencing the exact log_id, trace_id, and step (such as a specific LLM call or service) responsible. "
    "If there are multiple contributing factors, list each with supporting evidence. "
    "Provide a causal chain (step-by-step how the issue propagated) and suggest specific, actionable resolutions. "
    "Take full responsibility for the analysis and do not defer to the user. "
    "Output your answer in this format:\n\n"
    "Root Cause:\n"
    "Summary:\n"
    "Confidence Score (0-1):\n"
    "First Detected (timestamp):\n"
    "Primary Trace ID:\n"
    "Impacted Services:\n"
    "Contributing Factors:\n"
    "(For each: type, log_id, trace_id, timestamp, details, service)\n"
    "Causal Chain (step-by-step how the issue propagated):\n"
    "Potential Resolutions (actionable, not generic):\n\n"
    "SCENARIO JSON:\n"
    "{scenario}\n"
)

openai_api_key = os.getenv("OPENAI_API_KEY")
if not openai_api_key:
    raise ValueError("OPENAI_API_KEY not set in environment variables.")

llm = ChatOpenAI(
    model_name="gpt-4",  # or "gpt-3.5-turbo"
    temperature=0,
    openai_api_key=openai_api_key
)

chain = LLMChain(
    llm=llm,
    prompt=PromptTemplate(
        input_variables=["scenario"],
        template=prompt_template
    )
)

if __name__ == "__main__":
    with open("synthetic_agent_issues.json") as f:
        scenarios = json.load(f)

    for i, scenario in enumerate(scenarios):
        print(f"\n--- RCA Report for Scenario {i+1} ---")
        scenario_str = json.dumps(scenario, indent=2)
        result = chain.invoke({"scenario": scenario_str})["text"]
        print(result) 