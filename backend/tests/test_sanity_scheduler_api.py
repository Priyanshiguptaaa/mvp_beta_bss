import unittest
from fastapi.testclient import TestClient
from api.main import app
from unittest.mock import patch

client = TestClient(app)

class TestSanitySchedulerAPI(unittest.TestCase):
    def test_run_single_test(self):
        # Test configuration
        test_config = {
            'test_name': 'Test Order Confirmation - Failure Case',
            'instruction': 'Confirm my order for the new laptop.',
            'agent': 'Order Confirmation Agent',
            'environment': 'Development',
            'expected_behavior': 'Should confirm the order and provide order details.',
            'model_output': 'Sorry, I cannot find your order.',
            'context': [
                'Order confirmation agent is being tested for order lookup and confirmation.',
                'The test verifies that the agent can confirm orders and provide details.'
            ]
        }
        
        # Mock the TestExecutionAgent
        with patch('agents.test_execution_agent.TestExecutionAgent.execute_test') as mock_execute:
            mock_execute.return_value = {
                'status': 'passed',
                'test_result': {
                    'answer_relevancy': {
                        'score': 0.85,
                        'threshold': 0.8,
                        'passed': True
                    }
                }
            }
            
            # Make API request
            response = client.post('/scheduler/run-test', json=test_config)
            
            # Verify response
            self.assertEqual(response.status_code, 200)
            self.assertEqual(response.json()['status'], 'passed')
            mock_execute.assert_called_once_with(test_config)

    def test_run_batch_tests(self):
        # Test configurations
        test_configs = [
            {
                'test_name': 'Test 1',
                'instruction': 'Test instruction 1',
                'agent': 'Agent 1',
                'environment': 'Dev'
            },
            {
                'test_name': 'Test 2',
                'instruction': 'Test instruction 2',
                'agent': 'Agent 2',
                'environment': 'Prod'
            }
        ]
        
        # Mock the TestExecutionAgent
        with patch('agents.test_execution_agent.TestExecutionAgent.execute_batch_tests') as mock_execute:
            mock_execute.return_value = [
                {
                    'test_name': 'Test 1',
                    'result': {'status': 'passed'}
                },
                {
                    'test_name': 'Test 2',
                    'result': {'status': 'failed'}
                }
            ]
            
            # Make API request
            response = client.post('/scheduler/run-batch-tests', json=test_configs)
            
            # Verify response
            self.assertEqual(response.status_code, 200)
            self.assertEqual(len(response.json()), 2)
            mock_execute.assert_called_once_with(test_configs)

    def test_invalid_test_config(self):
        # Invalid test configuration (missing required fields)
        invalid_config = {
            'test_name': 'Test Order Confirmation - Failure Case'
            # Missing required fields
        }
        
        # Make API request
        response = client.post('/scheduler/run-test', json=invalid_config)
        
        # Verify response
        self.assertEqual(response.status_code, 422)  # Validation error

if __name__ == '__main__':
    unittest.main() 