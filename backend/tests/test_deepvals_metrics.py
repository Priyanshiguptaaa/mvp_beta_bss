import logging
import os
import sys
import unittest
from deepeval.metrics import (
    AnswerRelevancyMetric,
    FaithfulnessMetric,
    HallucinationMetric
)
from deepeval.test_case import LLMTestCase

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from agents.evaluation_agent import EvaluationAgent

logger = logging.getLogger(__name__)


class TestEvaluationAgent(unittest.TestCase):
    def setUp(self):
        # Mock database session
        self.mock_db = None
        
        # Create evaluation agent
        self.eval_agent = EvaluationAgent(self.mock_db)
        
        # Set up test criteria
        answer_relevancy_criteria = {
            'threshold': 0.7,
            'evaluation_rules': {
                'accuracy': 'Response must directly address user query',
                'completeness': 'Must cover all aspects of the query'
            }
        }
        
        faithfulness_criteria = {
            'threshold': 0.7,
            'evaluation_rules': {
                'fact_checking': 'All claims must be supported by context',
                'consistency': 'No contradictions with provided information'
            }
        }
        
        hallucination_criteria = {
            'threshold': 0.1,  # Lower threshold since we're testing for hallucinations
            'detection_rules': {
                'unverified_claims': 'Flag statements without context support',
                'exaggeration': 'Flag amplified or modified information'
            }
        }
        
        # Set criteria for each metric
        self.eval_agent.set_metric_criteria('answer_relevancy', 
                                          answer_relevancy_criteria)
        self.eval_agent.set_metric_criteria('faithfulness', 
                                          faithfulness_criteria)
        self.eval_agent.set_metric_criteria('hallucination', 
                                          hallucination_criteria)
        
        # Sample test data with proper context
        self.test_cases = {
            'answer_relevancy': {
                'input': 'What are the benefits of exercise?',
                'actual_output': 'Regular exercise improves cardiovascular '
                               'health, boosts mood, and helps maintain a '
                               'healthy weight.',
                'context': [
                    'Exercise has numerous health benefits including '
                    'improved heart health and weight management.'
                ]
            },
            'faithfulness': {
                'input': 'What is the capital of France?',
                'actual_output': 'Paris is the capital of France, '
                               'known for the Eiffel Tower.',
                'context': [
                    'Paris is the capital city of France. '
                    'The Eiffel Tower is a famous landmark in Paris.'
                ]
            },
            'hallucination': {
                'input': 'What is the population of Paris?',
                'actual_output': 'Paris has a population of 2.2 million people '
                               'and is known for its beautiful architecture.',
                'context': [
                    'Paris is the capital of France with a population '
                    'of 2.2 million people.'
                ]
            }
        }

    def test_evaluate_answer_relevancy(self):
        """Test evaluation agent's answer relevancy evaluation"""
        test_case = self.test_cases['answer_relevancy']
        
        # Create test case with proper context
        llm_test_case = LLMTestCase(
            input=test_case['input'],
            actual_output=test_case['actual_output'],
            context=test_case['context']
        )
        
        # Get the metric from the agent
        metric = self.eval_agent.metrics['answer_relevancy']
        
        # Measure using the metric directly
        score = metric.measure(llm_test_case)
        
        # Verify score
        self.assertIsInstance(score, float)
        self.assertTrue(0 <= score <= 1)
        self.assertTrue(score >= self.eval_agent.metric_criteria['answer_relevancy']['threshold'])
        print(f"Answer Relevancy Score: {score}")

    def test_evaluate_faithfulness(self):
        """Test evaluation agent's faithfulness evaluation"""
        test_case = self.test_cases['faithfulness']
        
        # Create test case with proper context
        llm_test_case = LLMTestCase(
            input=test_case['input'],
            actual_output=test_case['actual_output'],
            retrieval_context=test_case['context']  # Use retrieval_context instead of context
        )
        
        # Get the metric from the agent
        metric = self.eval_agent.metrics['faithfulness']
        
        # Measure using the metric directly
        score = metric.measure(llm_test_case)
        
        # Verify score
        self.assertIsInstance(score, float)
        self.assertTrue(0 <= score <= 1)
        self.assertTrue(score >= self.eval_agent.metric_criteria['faithfulness']['threshold'])
        print(f"Faithfulness Score: {score}")

    def test_evaluate_hallucination(self):
        """Test evaluation agent's hallucination evaluation"""
        test_case = self.test_cases['hallucination']
        
        # Create test case with proper context
        llm_test_case = LLMTestCase(
            input=test_case['input'],
            actual_output=test_case['actual_output'],
            retrieval_context=test_case['context']  # Use retrieval_context instead of context
        )
        
        # Get the metric from the agent
        metric = self.eval_agent.metrics['hallucination']
        
        # Measure using the metric directly
        score = metric.measure(llm_test_case)
        
        # Verify score
        self.assertIsInstance(score, float)
        self.assertTrue(0 <= score <= 1)
        self.assertTrue(score >= self.eval_agent.metric_criteria['hallucination']['threshold'])
        print(f"Hallucination Score: {score}")

    def test_batch_evaluation(self):
        """Test batch evaluation of multiple interactions"""
        test_interactions = [
            {
                'trace_id': 'test_1',
                'timestamp': '2024-03-20T10:00:00',
                'prompt': {'text': self.test_cases['answer_relevancy']['input']},
                'response': {'text': self.test_cases['answer_relevancy']['actual_output']},
                'context': self.test_cases['answer_relevancy']['context']
            },
            {
                'trace_id': 'test_2',
                'timestamp': '2024-03-20T10:05:00',
                'prompt': {'text': self.test_cases['faithfulness']['input']},
                'response': {'text': self.test_cases['faithfulness']['actual_output']},
                'context': self.test_cases['faithfulness']['context']
            }
        ]
        
        results = self.eval_agent.evaluate_metrics(
            user_id=1,
            interactions=test_interactions
        )
        
        self.assertIn('user_id', results)
        self.assertIn('interactions', results)
        self.assertIn('summary', results)
        self.assertEqual(results['summary']['total_interactions'], 2)
        self.assertIn('average_scores', results['summary'])
        self.assertIn('failed_metrics', results['summary'])


if __name__ == '__main__':
    unittest.main() 