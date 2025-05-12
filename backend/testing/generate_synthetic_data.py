import random
import json
from datetime import datetime, timedelta


def generate_synthetic_agent_issues():
    now = datetime.now()
    use_cases = [
        # 1. Calendar event creation failure
        {
            "user_input": "Schedule a meeting with John tomorrow at 2 PM",
            "system_output": "Meeting scheduled successfully",
            "prod_logs": [
                {
                    "timestamp": (now - timedelta(seconds=5)).strftime(
                        "%Y-%m-%dT%H:%M:%S"
                    ),
                    "log_level": "INFO",
                    "service": "frontend",
                    "message": "User submitted scheduling request.",
                    "details": {"user_id": "u123"}
                },
                {
                    "timestamp": (now - timedelta(seconds=4)).strftime(
                        "%Y-%m-%dT%H:%M:%S"
                    ),
                    "log_level": "INFO",
                    "service": "api-gateway",
                    "message": "Forwarded scheduling request to agent service.",
                    "details": {"request_id": "r456"}
                },
                {
                    "timestamp": (now - timedelta(seconds=2)).strftime(
                        "%Y-%m-%dT%H:%M:%S"
                    ),
                    "log_level": "ERROR",
                    "service": "calendar_service",
                    "message": (
                        "Failed to create calendar event: Timezone conversion failed."
                    ),
                    "details": {
                        "input_timezone": "UTC",
                        "target_timezone": "America/New_York"
                    }
                }
            ],
            "llm_calls": [
                {
                    "timestamp": (now - timedelta(seconds=4)).strftime(
                        "%Y-%m-%dT%H:%M:%S"
                    ),
                    "system_message": (
                        "You are a calendar assistant. Parse the meeting request and "
                        "extract date, time, and attendees."
                    ),
                    "user_prompt": "Schedule a meeting with John tomorrow at 2 PM",
                    "model_output": (
                        "Meeting scheduled for 2024-03-20 at 14:00 UTC"
                    ),
                    "confidence": 0.95,
                    "call_id": "llm1",
                    "parent_call_id": None,
                    "metadata": {"step": "parse_request"}
                },
                {
                    "timestamp": (now - timedelta(seconds=3)).strftime(
                        "%Y-%m-%dT%H:%M:%S"
                    ),
                    "system_message": (
                        "You are a timezone conversion assistant. Convert the given "
                        "time to the target timezone."
                    ),
                    "user_prompt": (
                        "Convert 14:00 UTC to America/New_York timezone"
                    ),
                    "model_output": "10:00 AM EDT",
                    "confidence": 0.98,
                    "call_id": "llm2",
                    "parent_call_id": "llm1",
                    "metadata": {"step": "convert_timezone"}
                }
            ],
            "traces": [
                {
                    "trace_id": "trace-001",
                    "parent_id": None,
                    "service": "frontend",
                    "operation": "user_request",
                    "start_time": (now - timedelta(seconds=5)).strftime(
                        "%Y-%m-%dT%H:%M:%S"
                    ),
                    "end_time": (now - timedelta(seconds=4)).strftime(
                        "%Y-%m-%dT%H:%M:%S"
                    ),
                    "duration_ms": 1000,
                    "status": "OK",
                    "attributes": {"user_id": "u123"}
                },
                {
                    "trace_id": "trace-001",
                    "parent_id": "frontend",
                    "service": "api-gateway",
                    "operation": "forward_request",
                    "start_time": (now - timedelta(seconds=4)).strftime(
                        "%Y-%m-%dT%H:%M:%S"
                    ),
                    "end_time": (now - timedelta(seconds=2)).strftime(
                        "%Y-%m-%dT%H:%M:%S"
                    ),
                    "duration_ms": 2000,
                    "status": "OK",
                    "attributes": {"request_id": "r456"}
                },
                {
                    "trace_id": "trace-001",
                    "parent_id": "api-gateway",
                    "service": "calendar_service",
                    "operation": "create_event",
                    "start_time": (now - timedelta(seconds=2)).strftime(
                        "%Y-%m-%dT%H:%M:%S"
                    ),
                    "end_time": now.strftime("%Y-%m-%dT%H:%M:%S"),
                    "duration_ms": 2000,
                    "status": "ERROR",
                    "attributes": {"error": "Timezone conversion failed"}
                }
            ],
            "metrics": {
                "latency_ms": random.randint(100, 1000),
                "throughput": random.randint(10, 100),
                "error_rate": round(random.uniform(0.01, 0.1), 2),
                "resource_usage": {
                    "cpu": round(random.uniform(0.1, 1.0), 2),
                    "memory": random.randint(100, 500)
                }
            }
        },
        # 2. Wrong contact resolution
        {
            "user_input": "Send an email to John about the project update",
            "system_output": "Email sent to John Smith",
            "prod_logs": [
                {
                    "timestamp": (now - timedelta(seconds=5)).strftime(
                        "%Y-%m-%dT%H:%M:%S"
                    ),
                    "log_level": "INFO",
                    "service": "frontend",
                    "message": "User requested to send email.",
                    "details": {"user_id": "u124"}
                },
                {
                    "timestamp": (now - timedelta(seconds=4)).strftime(
                        "%Y-%m-%dT%H:%M:%S"
                    ),
                    "log_level": "WARNING",
                    "service": "contact_service",
                    "message": "Multiple contacts found for 'John'.",
                    "details": {
                        "matches": [
                            {"name": "John Smith", "email": "john.smith@company.com"},
                            {"name": "John Doe", "email": "john.doe@company.com"}
                        ]
                    }
                }
            ],
            "llm_calls": [
                {
                    "timestamp": (now - timedelta(seconds=4)).strftime(
                        "%Y-%m-%dT%H:%M:%S"
                    ),
                    "system_message": (
                        "You are a contact resolution assistant. Find the most likely "
                        "contact based on context."
                    ),
                    "user_prompt": (
                        "Find the John who works on the project update"
                    ),
                    "model_output": (
                        "Selected John Smith (john.smith@company.com) based on "
                        "project context"
                    ),
                    "confidence": 0.6,
                    "call_id": "llm3",
                    "parent_call_id": None,
                    "metadata": {"step": "resolve_contact"}
                }
            ],
            "traces": [
                {
                    "trace_id": "trace-002",
                    "parent_id": None,
                    "service": "frontend",
                    "operation": "user_request",
                    "start_time": (now - timedelta(seconds=5)).strftime(
                        "%Y-%m-%dT%H:%M:%S"
                    ),
                    "end_time": (now - timedelta(seconds=4)).strftime(
                        "%Y-%m-%dT%H:%M:%S"
                    ),
                    "duration_ms": 1000,
                    "status": "OK",
                    "attributes": {"user_id": "u124"}
                },
                {
                    "trace_id": "trace-002",
                    "parent_id": "frontend",
                    "service": "contact_service",
                    "operation": "resolve_contact",
                    "start_time": (now - timedelta(seconds=4)).strftime(
                        "%Y-%m-%dT%H:%M:%S"
                    ),
                    "end_time": (now - timedelta(seconds=2)).strftime(
                        "%Y-%m-%dT%H:%M:%S"
                    ),
                    "duration_ms": 2000,
                    "status": "WARNING",
                    "attributes": {"matches": 2}
                }
            ],
            "metrics": {
                "latency_ms": random.randint(100, 1000),
                "throughput": random.randint(10, 100),
                "error_rate": round(random.uniform(0.01, 0.1), 2),
                "resource_usage": {
                    "cpu": round(random.uniform(0.1, 1.0), 2),
                    "memory": random.randint(100, 500)
                }
            }
        },
        # 3. Function call parameter missing
        {
            "user_input": "Create a new user account for Alice",
            "system_output": "User account created successfully",
            "prod_logs": [
                {
                    "timestamp": (now - timedelta(seconds=5)).strftime(
                        "%Y-%m-%dT%H:%M:%S"
                    ),
                    "log_level": "INFO",
                    "service": "frontend",
                    "message": "User requested account creation.",
                    "details": {"user_id": "u125"}
                },
                {
                    "timestamp": (now - timedelta(seconds=2)).strftime(
                        "%Y-%m-%dT%H:%M:%S"
                    ),
                    "log_level": "ERROR",
                    "service": "user_service",
                    "message": "Missing required parameters: email, phone.",
                    "details": {"provided_fields": ["name", "department"]}
                }
            ],
            "llm_calls": [
                {
                    "timestamp": (now - timedelta(seconds=4)).strftime(
                        "%Y-%m-%dT%H:%M:%S"
                    ),
                    "system_message": (
                        "You are a user account creation assistant. Extract required "
                        "fields from the request."
                    ),
                    "user_prompt": "Create a new user account for Alice",
                    "model_output": "Extracted fields: name=Alice",
                    "confidence": 0.9,
                    "call_id": "llm4",
                    "parent_call_id": None,
                    "metadata": {"step": "extract_fields"}
                }
            ],
            "traces": [
                {
                    "trace_id": "trace-003",
                    "parent_id": None,
                    "service": "frontend",
                    "operation": "user_request",
                    "start_time": (now - timedelta(seconds=5)).strftime(
                        "%Y-%m-%dT%H:%M:%S"
                    ),
                    "end_time": (now - timedelta(seconds=2)).strftime(
                        "%Y-%m-%dT%H:%M:%S"
                    ),
                    "duration_ms": 3000,
                    "status": "ERROR",
                    "attributes": {"missing_fields": ["email", "phone"]}
                }
            ],
            "metrics": {
                "latency_ms": random.randint(100, 1000),
                "throughput": random.randint(10, 100),
                "error_rate": round(random.uniform(0.01, 0.1), 2),
                "resource_usage": {
                    "cpu": round(random.uniform(0.1, 1.0), 2),
                    "memory": random.randint(100, 500)
                }
            }
        },
        # 4. Weather location mismatch
        {
            "user_input": "What's the weather in San Francisco?",
            "system_output": "It's sunny in San Francisco with a temperature of 72°F",
            "prod_logs": [
                {
                    "timestamp": (now - timedelta(seconds=5)).strftime(
                        "%Y-%m-%dT%H:%M:%S"
                    ),
                    "log_level": "INFO",
                    "service": "frontend",
                    "message": "User requested weather info.",
                    "details": {"user_id": "u126"}
                },
                {
                    "timestamp": (now - timedelta(seconds=2)).strftime(
                        "%Y-%m-%dT%H:%M:%S"
                    ),
                    "log_level": "WARNING",
                    "service": "weather_service",
                    "message": "Location resolution mismatch: San Jose used.",
                    "details": {"input_location": "San Francisco", "resolved_location": "San Jose"}
                }
            ],
            "llm_calls": [
                {
                    "timestamp": (now - timedelta(seconds=4)).strftime(
                        "%Y-%m-%dT%H:%M:%S"
                    ),
                    "system_message": (
                        "You are a location resolution assistant. Determine the exact "
                        "location from the query."
                    ),
                    "user_prompt": "What's the weather in San Francisco?",
                    "model_output": "Location: San Jose, CA, USA",
                    "confidence": 0.7,
                    "call_id": "llm5",
                    "parent_call_id": None,
                    "metadata": {"step": "resolve_location"}
                }
            ],
            "traces": [
                {
                    "trace_id": "trace-004",
                    "parent_id": None,
                    "service": "frontend",
                    "operation": "user_request",
                    "start_time": (now - timedelta(seconds=5)).strftime(
                        "%Y-%m-%dT%H:%M:%S"
                    ),
                    "end_time": (now - timedelta(seconds=2)).strftime(
                        "%Y-%m-%dT%H:%M:%S"
                    ),
                    "duration_ms": 3000,
                    "status": "WARNING",
                    "attributes": {"resolved_location": "San Jose"}
                }
            ],
            "metrics": {
                "latency_ms": random.randint(100, 1000),
                "throughput": random.randint(10, 100),
                "error_rate": round(random.uniform(0.01, 0.1), 2),
                "resource_usage": {
                    "cpu": round(random.uniform(0.1, 1.0), 2),
                    "memory": random.randint(100, 500)
                }
            }
        },
        # 5. Multi-step task failure (partial completion)
        {
            "user_input": "Book a flight to New York and reserve a hotel",
            "system_output": "Flight booked successfully",
            "prod_logs": [
                {
                    "timestamp": (now - timedelta(seconds=5)).strftime(
                        "%Y-%m-%dT%H:%M:%S"
                    ),
                    "log_level": "INFO",
                    "service": "frontend",
                    "message": "User requested travel booking.",
                    "details": {"user_id": "u127"}
                },
                {
                    "timestamp": (now - timedelta(seconds=2)).strftime(
                        "%Y-%m-%dT%H:%M:%S"
                    ),
                    "log_level": "ERROR",
                    "service": "hotel_service",
                    "message": "Hotel booking service unavailable.",
                    "details": {"retry_attempts": 3}
                }
            ],
            "llm_calls": [
                {
                    "timestamp": (now - timedelta(seconds=4)).strftime(
                        "%Y-%m-%dT%H:%M:%S"
                    ),
                    "system_message": (
                        "You are a travel booking assistant. Break down the booking "
                        "request into steps."
                    ),
                    "user_prompt": (
                        "Book a flight to New York and reserve a hotel"
                    ),
                    "model_output": (
                        "Steps: 1. Book flight to NYC 2. Reserve hotel in NYC"
                    ),
                    "confidence": 0.95,
                    "call_id": "llm6",
                    "parent_call_id": None,
                    "metadata": {"step": "breakdown"}
                }
            ],
            "traces": [
                {
                    "trace_id": "trace-005",
                    "parent_id": None,
                    "service": "frontend",
                    "operation": "user_request",
                    "start_time": (now - timedelta(seconds=5)).strftime(
                        "%Y-%m-%dT%H:%M:%S"
                    ),
                    "end_time": (now - timedelta(seconds=2)).strftime(
                        "%Y-%m-%dT%H:%M:%S"
                    ),
                    "duration_ms": 3000,
                    "status": "ERROR",
                    "attributes": {"partial_completion": True}
                }
            ],
            "metrics": {
                "latency_ms": random.randint(100, 1000),
                "throughput": random.randint(10, 100),
                "error_rate": round(random.uniform(0.01, 0.1), 2),
                "resource_usage": {
                    "cpu": round(random.uniform(0.1, 1.0), 2),
                    "memory": random.randint(100, 500)
                }
            }
        },
        # 6. Payment processing failure
        {
            "user_input": "Process my payment for the new laptop.",
            "system_output": "Payment processing failed.",
            "prod_logs": [
                {
                    "timestamp": (now - timedelta(seconds=5)).strftime(
                        "%Y-%m-%dT%H:%M:%S"
                    ),
                    "log_level": "INFO",
                    "service": "frontend",
                    "message": "User requested payment processing.",
                    "details": {"user_id": "u128"}
                },
                {
                    "timestamp": (now - timedelta(seconds=2)).strftime(
                        "%Y-%m-%dT%H:%M:%S"
                    ),
                    "log_level": "ERROR",
                    "service": "payment_gateway",
                    "message": "Payment gateway is down.",
                    "details": {"error_code": 500}
                }
            ],
            "llm_calls": [
                {
                    "timestamp": (now - timedelta(seconds=4)).strftime(
                        "%Y-%m-%dT%H:%M:%S"
                    ),
                    "system_message": (
                        "You are a payment assistant. Validate payment details."
                    ),
                    "user_prompt": "Process my payment for the new laptop.",
                    "model_output": "Payment details valid.",
                    "confidence": 0.85,
                    "call_id": "llm7",
                    "parent_call_id": None,
                    "metadata": {"step": "validate_payment"}
                }
            ],
            "traces": [
                {
                    "trace_id": "trace-006",
                    "parent_id": None,
                    "service": "frontend",
                    "operation": "user_request",
                    "start_time": (now - timedelta(seconds=5)).strftime(
                        "%Y-%m-%dT%H:%M:%S"
                    ),
                    "end_time": (now - timedelta(seconds=2)).strftime(
                        "%Y-%m-%dT%H:%M:%S"
                    ),
                    "duration_ms": 3000,
                    "status": "ERROR",
                    "attributes": {"error_code": 500}
                }
            ],
            "metrics": {
                "latency_ms": random.randint(100, 1000),
                "throughput": random.randint(10, 100),
                "error_rate": round(random.uniform(0.01, 0.1), 2),
                "resource_usage": {
                    "cpu": round(random.uniform(0.1, 1.0), 2),
                    "memory": random.randint(100, 500)
                }
            }
        },
        # 7. Incomplete order information
        {
            "user_input": "What's the status of my order?",
            "system_output": "Your order is processing.",
            "prod_logs": [
                {
                    "timestamp": (now - timedelta(seconds=5)).strftime(
                        "%Y-%m-%dT%H:%M:%S"
                    ),
                    "log_level": "INFO",
                    "service": "frontend",
                    "message": "User requested order status.",
                    "details": {"user_id": "u129"}
                },
                {
                    "timestamp": (now - timedelta(seconds=2)).strftime(
                        "%Y-%m-%dT%H:%M:%S"
                    ),
                    "log_level": "WARNING",
                    "service": "order_tracking_service",
                    "message": "Order tracking service returned incomplete info.",
                    "details": {"order_id": "o789"}
                }
            ],
            "llm_calls": [
                {
                    "timestamp": (now - timedelta(seconds=4)).strftime(
                        "%Y-%m-%dT%H:%M:%S"
                    ),
                    "system_message": (
                        "You are an order tracking assistant. Retrieve order status."
                    ),
                    "user_prompt": "What's the status of my order?",
                    "model_output": "Order is processing.",
                    "confidence": 0.8,
                    "call_id": "llm8",
                    "parent_call_id": None,
                    "metadata": {"step": "track_order"}
                }
            ],
            "traces": [
                {
                    "trace_id": "trace-007",
                    "parent_id": None,
                    "service": "frontend",
                    "operation": "user_request",
                    "start_time": (now - timedelta(seconds=5)).strftime(
                        "%Y-%m-%dT%H:%M:%S"
                    ),
                    "end_time": (now - timedelta(seconds=2)).strftime(
                        "%Y-%m-%dT%H:%M:%S"
                    ),
                    "duration_ms": 3000,
                    "status": "WARNING",
                    "attributes": {"order_id": "o789"}
                }
            ],
            "metrics": {
                "latency_ms": random.randint(100, 1000),
                "throughput": random.randint(10, 100),
                "error_rate": round(random.uniform(0.01, 0.1), 2),
                "resource_usage": {
                    "cpu": round(random.uniform(0.1, 1.0), 2),
                    "memory": random.randint(100, 500)
                }
            }
        },
        # 8. Outdated product availability
        {
            "user_input": "Is the new smartphone in stock?",
            "system_output": "Yes, it's available.",
            "prod_logs": [
                {
                    "timestamp": (now - timedelta(seconds=5)).strftime(
                        "%Y-%m-%dT%H:%M:%S"
                    ),
                    "log_level": "INFO",
                    "service": "frontend",
                    "message": "User requested product availability.",
                    "details": {"user_id": "u130"}
                },
                {
                    "timestamp": (now - timedelta(seconds=2)).strftime(
                        "%Y-%m-%dT%H:%M:%S"
                    ),
                    "log_level": "WARNING",
                    "service": "inventory_service",
                    "message": "Inventory service returned outdated info.",
                    "details": {"product_id": "p321"}
                }
            ],
            "llm_calls": [
                {
                    "timestamp": (now - timedelta(seconds=4)).strftime(
                        "%Y-%m-%dT%H:%M:%S"
                    ),
                    "system_message": (
                        "You are an inventory assistant. Check product availability."
                    ),
                    "user_prompt": "Is the new smartphone in stock?",
                    "model_output": "Yes, it's available.",
                    "confidence": 0.7,
                    "call_id": "llm9",
                    "parent_call_id": None,
                    "metadata": {"step": "check_inventory"}
                }
            ],
            "traces": [
                {
                    "trace_id": "trace-008",
                    "parent_id": None,
                    "service": "frontend",
                    "operation": "user_request",
                    "start_time": (now - timedelta(seconds=5)).strftime(
                        "%Y-%m-%dT%H:%M:%S"
                    ),
                    "end_time": (now - timedelta(seconds=2)).strftime(
                        "%Y-%m-%dT%H:%M:%S"
                    ),
                    "duration_ms": 3000,
                    "status": "WARNING",
                    "attributes": {"product_id": "p321"}
                }
            ],
            "metrics": {
                "latency_ms": random.randint(100, 1000),
                "throughput": random.randint(10, 100),
                "error_rate": round(random.uniform(0.01, 0.1), 2),
                "resource_usage": {
                    "cpu": round(random.uniform(0.1, 1.0), 2),
                    "memory": random.randint(100, 500)
                }
            }
        },
        # 9. High latency in order confirmation
        {
            "user_input": "Confirm my order for the new laptop.",
            "system_output": "Order confirmed.",
            "prod_logs": [
                {
                    "timestamp": (now - timedelta(seconds=5)).strftime(
                        "%Y-%m-%dT%H:%M:%S"
                    ),
                    "log_level": "INFO",
                    "service": "frontend",
                    "message": "User requested order confirmation.",
                    "details": {"user_id": "u131"}
                },
                {
                    "timestamp": (now - timedelta(seconds=2)).strftime(
                        "%Y-%m-%dT%H:%M:%S"
                    ),
                    "log_level": "WARNING",
                    "service": "order_processing_system",
                    "message": "Order processing system experienced high latency.",
                    "details": {"order_id": "o790"}
                }
            ],
            "llm_calls": [
                {
                    "timestamp": (now - timedelta(seconds=4)).strftime(
                        "%Y-%m-%dT%H:%M:%S"
                    ),
                    "system_message": (
                        "You are an order confirmation assistant. Confirm the order."
                    ),
                    "user_prompt": "Confirm my order for the new laptop.",
                    "model_output": "Order confirmed.",
                    "confidence": 0.9,
                    "call_id": "llm10",
                    "parent_call_id": None,
                    "metadata": {"step": "confirm_order"}
                }
            ],
            "traces": [
                {
                    "trace_id": "trace-009",
                    "parent_id": None,
                    "service": "frontend",
                    "operation": "user_request",
                    "start_time": (now - timedelta(seconds=5)).strftime(
                        "%Y-%m-%dT%H:%M:%S"
                    ),
                    "end_time": (now - timedelta(seconds=2)).strftime(
                        "%Y-%m-%dT%H:%M:%S"
                    ),
                    "duration_ms": 3000,
                    "status": "WARNING",
                    "attributes": {"order_id": "o790"}
                }
            ],
            "metrics": {
                "latency_ms": random.randint(1000, 3000),
                "throughput": random.randint(10, 100),
                "error_rate": round(random.uniform(0.01, 0.1), 2),
                "resource_usage": {
                    "cpu": round(random.uniform(0.1, 1.0), 2),
                    "memory": random.randint(100, 500)
                }
            }
        },
        # 10. Shipping information unavailable
        {
            "user_input": "When will my order be delivered?",
            "system_output": "Error: Shipping information unavailable.",
            "prod_logs": [
                {
                    "timestamp": (now - timedelta(seconds=5)).strftime(
                        "%Y-%m-%dT%H:%M:%S"
                    ),
                    "log_level": "INFO",
                    "service": "frontend",
                    "message": "User requested shipping info.",
                    "details": {"user_id": "u132"}
                },
                {
                    "timestamp": (now - timedelta(seconds=2)).strftime(
                        "%Y-%m-%dT%H:%M:%S"
                    ),
                    "log_level": "ERROR",
                    "service": "shipping_service",
                    "message": "Shipping service error.",
                    "details": {"order_id": "o791"}
                }
            ],
            "llm_calls": [
                {
                    "timestamp": (now - timedelta(seconds=4)).strftime(
                        "%Y-%m-%dT%H:%M:%S"
                    ),
                    "system_message": (
                        "You are a shipping assistant. Retrieve shipping information."
                    ),
                    "user_prompt": "When will my order be delivered?",
                    "model_output": "Shipping information unavailable.",
                    "confidence": 0.5,
                    "call_id": "llm11",
                    "parent_call_id": None,
                    "metadata": {"step": "get_shipping_info"}
                }
            ],
            "traces": [
                {
                    "trace_id": "trace-010",
                    "parent_id": None,
                    "service": "frontend",
                    "operation": "user_request",
                    "start_time": (now - timedelta(seconds=5)).strftime(
                        "%Y-%m-%dT%H:%M:%S"
                    ),
                    "end_time": (now - timedelta(seconds=2)).strftime(
                        "%Y-%m-%dT%H:%M:%S"
                    ),
                    "duration_ms": 3000,
                    "status": "ERROR",
                    "attributes": {"order_id": "o791"}
                }
            ],
            "metrics": {
                "latency_ms": random.randint(100, 1000),
                "throughput": random.randint(10, 100),
                "error_rate": round(random.uniform(0.01, 0.1), 2),
                "resource_usage": {
                    "cpu": round(random.uniform(0.1, 1.0), 2),
                    "memory": random.randint(100, 500)
                }
            }
        }
    ]
    return random.choice(use_cases)


# Generate synthetic data
synthetic_data = [generate_synthetic_agent_issues() for _ in range(10)]

# Save the synthetic data to a file
with open("synthetic_agent_issues.json", "w") as f:
    json.dump(synthetic_data, f, indent=4)

print(
    "Synthetic agent issues generated and saved as synthetic_agent_issues.json."
) 