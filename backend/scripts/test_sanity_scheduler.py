print("Sanity scheduler script entrypoint reached")

import requests
import json
from datetime import datetime

def test_single_test():
    """Test running a single test"""
    url = "http://localhost:8000/api/scheduler/run-test"
    
    test_config = {
        "test_name": "Test Order Confirmation - Failure Case",
        "instruction": "Confirm my order for the new laptop.",
        "agent": "Order Confirmation Agent",
        "environment": "Development",
        "expected_behavior": "Should confirm the order and provide order details.",
        "model_output": "Sorry, I cannot find your order.",  # Incorrect output to force failure
        "context": [
            "Order confirmation agent is being tested for order lookup and confirmation.",
            "The test verifies that the agent can confirm orders and provide details."
        ]
    }
    
    try:
        response = requests.post(url, json=test_config)
        response.raise_for_status()
        print("\nSingle Test Result:")
        print(json.dumps(response.json(), indent=2))
    except requests.exceptions.RequestException as e:
        print(f"Error running single test: {str(e)}")

def test_batch_tests():
    """Test running multiple tests in batch"""
    url = "http://localhost:8000/api/scheduler/run-batch-tests"
    
    test_configs = [
        {
            "test_name": "Test Order Confirmation - Failure Case",
            "instruction": "Confirm my order for the new laptop.",
            "agent": "Order Confirmation Agent",
            "environment": "Development",
            "expected_behavior": "Should confirm the order and provide order details.",
            "model_output": "Sorry, I cannot find your order.",  # Failing case
            "context": [
                "Order confirmation agent is being tested for order lookup and confirmation.",
                "The test verifies that the agent can confirm orders and provide details."
            ]
        },
        {
            "test_name": "Test Order Confirmation - Success Case",
            "instruction": "Confirm my order for the new laptop.",
            "agent": "Order Confirmation Agent",
            "environment": "Development",
            "expected_behavior": "Should confirm the order and provide order details.",
            "model_output": "Your order for the new laptop is confirmed. Order ID: 12345.",  # Passing case
            "context": [
                "Order confirmation agent is being tested for order lookup and confirmation.",
                "The test verifies that the agent can confirm orders and provide details."
            ]
        }
    ]
    
    try:
        response = requests.post(url, json=test_configs)
        response.raise_for_status()
        print("\nBatch Test Results:")
        print(json.dumps(response.json(), indent=2))
    except requests.exceptions.RequestException as e:
        print(f"Error running batch tests: {str(e)}")

if __name__ == "__main__":
    print("Testing Sanity Scheduler System")
    print("===============================")
    
    # Run only the main and batch tests
    test_single_test()
    test_batch_tests()

print("Hello, world!") 