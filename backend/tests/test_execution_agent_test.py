import unittest
from unittest.mock import Mock, patch
from agents.test_execution_agent import TestExecutionAgent

class TestTestExecutionAgent(unittest.TestCase):
    def setUp(self):
        # Create a mock database session
        self.mock_db = Mock()
        self.test_agent = TestExecutionAgent(self.mock_db)
        
        # Mock the evaluation agent's response
        self.mock_eval_result = {
            'answer_relevancy': {
                'score': 0.85,
                'threshold': 0.8,
                'passed': True
            },
            'faithfulness': {
                'score': 0.9,
                'threshold': 0.75,
                'passed': True
            }
        }
        
        # Mock the RCA agent's response
        self.mock_rca_result = {
            'incident_id': 'inc-123',
            'analysis': 'Test failure analysis',
            'recommendations': ['Fix issue 1', 'Fix issue 2']
        }

    @patch('agents.evaluation_agent.EvaluationAgent.evaluate_interaction')
    @patch('agents.rca_agent.RCAAgent.analyze_incident')
    def test_successful_test_execution(self, mock_rca, mock_eval):
        # Configure mocks
        mock_eval.return_value = self.mock_eval_result
        mock_rca.return_value = self.mock_rca_result
        
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
        
        # Execute test
        result = self.test_agent.execute_test(test_config)
        
        # Verify results
        self.assertEqual(result['status'], 'passed')
        self.assertEqual(result['test_result'], self.mock_eval_result)
        mock_eval.assert_called_once()
        mock_rca.assert_not_called()

    @patch('agents.evaluation_agent.EvaluationAgent.evaluate_interaction')
    @patch('agents.rca_agent.RCAAgent.analyze_incident')
    def test_failed_test_execution(self, mock_rca, mock_eval):
        # Configure mocks for failed test
        failed_eval_result = {
            'answer_relevancy': {
                'score': 0.6,
                'threshold': 0.8,
                'passed': False
            },
            'faithfulness': {
                'score': 0.9,
                'threshold': 0.75,
                'passed': True
            }
        }
        mock_eval.return_value = failed_eval_result
        mock_rca.return_value = self.mock_rca_result
        
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
        
        # Execute test
        result = self.test_agent.execute_test(test_config)
        
        # Verify results
        self.assertEqual(result['status'], 'failed')
        self.assertEqual(result['test_result'], failed_eval_result)
        self.assertEqual(result['rca_report'], self.mock_rca_result)
        self.assertEqual(result['incident_id'], 'inc-123')
        mock_eval.assert_called_once()
        mock_rca.assert_called_once()

    def test_batch_test_execution(self):
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
        
        # Mock the execute_test method
        with patch.object(self.test_agent, 'execute_test') as mock_execute:
            mock_execute.side_effect = [
                {'status': 'passed', 'test_result': {}},
                {'status': 'failed', 'test_result': {}, 'rca_report': {}}
            ]
            
            # Execute batch tests
            results = self.test_agent.execute_batch_tests(test_configs)
            
            # Verify results
            self.assertEqual(len(results), 2)
            self.assertEqual(results[0]['test_name'], 'Test 1')
            self.assertEqual(results[1]['test_name'], 'Test 2')
            self.assertEqual(mock_execute.call_count, 2)

if __name__ == '__main__':
    unittest.main() 