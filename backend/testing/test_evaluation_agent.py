import pytest
from deepeval import assert_test
from deepeval.metrics import (
    AnswerRelevancyMetric,
    FaithfulnessMetric,
    HallucinationMetric,
    GEval
)
from deepeval.test_case import LLMTestCase
from agents.evaluation_agent import EvaluationAgent
from sqlalchemy.orm import Session


def test_evaluation_agent():
    # Mock database session
    db = Session()
    
    # Initialize evaluation agent
    eval_agent = EvaluationAgent(db)
    
    # Define test criteria
    answer_relevancy_criteria = {
        'threshold': 0.8,
        'evaluation_rules': {
            'accuracy': 'Response must directly address user query',
            'completeness': 'Must cover all aspects of the query',
            'clarity': 'Response should be clear and well-structured'
        }
    }
    
    faithfulness_criteria = {
        'threshold': 0.75,
        'evaluation_rules': {
            'fact_checking': 'All claims must be supported by context',
            'consistency': 'No contradictions with provided information'
        }
    }
    
    hallucination_criteria = {
        'threshold': 0.9,
        'detection_rules': {
            'unverified_claims': 'Flag statements without context support',
            'exaggeration': 'Flag amplified or modified information'
        }
    }
    
    # Set criteria
    eval_agent.set_metric_criteria('answer_relevancy', 
                                 answer_relevancy_criteria)
    eval_agent.set_metric_criteria('faithfulness', 
                                 faithfulness_criteria)
    eval_agent.set_metric_criteria('hallucination', 
                                 hallucination_criteria)
    
    # Test case 1: Valid response with context
    test_case1 = LLMTestCase(
        input="What are the features of the new laptop?",
        actual_output="The new laptop features a 15-inch Retina display, "
                     "16GB RAM, and 512GB SSD storage.",
        expected_output="The laptop has a 15-inch Retina display, 16GB RAM, "
                       "and 512GB SSD storage.",
        retrieval_context=[
            "The new laptop model has a 15-inch Retina display.",
            "It comes with 16GB of RAM.",
            "Storage options include 512GB SSD."
        ]
    )
    
    # Test case 2: Response with hallucination
    test_case2 = LLMTestCase(
        input="What colors does the laptop come in?",
        actual_output="The laptop comes in silver, space gray, and gold.",
        expected_output="The laptop is available in silver and space gray.",
        retrieval_context=[
            "The laptop has a 15-inch screen.",
            "Available in silver and space gray."
        ]
    )
    
    # Test case 3: Incomplete response
    test_case3 = LLMTestCase(
        input="What are the laptop's specifications?",
        actual_output="The laptop has a 15-inch display and 16GB RAM.",
        expected_output="The laptop has a 15-inch Retina display, 16GB RAM, "
                       "512GB SSD storage, and Intel i7 processor.",
        retrieval_context=[
            "The laptop has a 15-inch Retina display.",
            "It comes with 16GB of RAM.",
            "Storage options include 512GB SSD.",
            "Powered by Intel i7 processor."
        ]
    )
    
    # Test case 4: Irrelevant response
    test_case4 = LLMTestCase(
        input="What is the laptop's battery life?",
        actual_output="The laptop has a 15-inch screen and comes in silver.",
        expected_output="The laptop offers up to 10 hours of battery life.",
        retrieval_context=[
            "Battery life: Up to 10 hours of normal usage.",
            "The laptop has a 15-inch screen.",
            "Available in silver and space gray."
        ]
    )
    
    # Create custom metrics
    correctness_metric = GEval(
        name="Correctness",
        criteria="Determine if the 'actual_output' is correct based on the "
                "'expected_output' and 'retrieval_context'.",
        threshold=0.7
    )
    
    completeness_metric = GEval(
        name="Completeness",
        criteria="Evaluate if the 'actual_output' covers all important "
                "information from the 'expected_output'.",
        threshold=0.8
    )
    
    # Test single interaction evaluation with custom metrics
    single_result = eval_agent.evaluate_interaction(
        user_query=test_case1.input,
        model_output=test_case1.actual_output,
        context=test_case1.retrieval_context
    )
    
    # Verify single interaction results
    assert 'answer_relevancy' in single_result
    assert 'faithfulness' in single_result
    assert 'hallucination' in single_result
    
    for metric_result in single_result.values():
        if not isinstance(metric_result, dict):
            continue
        assert 'score' in metric_result
        assert 'threshold' in metric_result
        assert 'passed' in metric_result
        assert 'criteria' in metric_result
    
    # Test batch evaluation
    test_interactions = [
        {
            'trace_id': 'test_1',
            'timestamp': '2024-03-20T10:00:00',
            'prompt': {'text': test_case1.input},
            'response': {'text': test_case1.actual_output},
            'context': test_case1.retrieval_context
        },
        {
            'trace_id': 'test_2',
            'timestamp': '2024-03-20T10:05:00',
            'prompt': {'text': test_case2.input},
            'response': {'text': test_case2.actual_output},
            'context': test_case2.retrieval_context
        },
        {
            'trace_id': 'test_3',
            'timestamp': '2024-03-20T10:10:00',
            'prompt': {'text': test_case3.input},
            'response': {'text': test_case3.actual_output},
            'context': test_case3.retrieval_context
        },
        {
            'trace_id': 'test_4',
            'timestamp': '2024-03-20T10:15:00',
            'prompt': {'text': test_case4.input},
            'response': {'text': test_case4.actual_output},
            'context': test_case4.retrieval_context
        }
    ]
    
    results = eval_agent.evaluate_metrics(
        user_id=1,
        interactions=test_interactions
    )
    
    # Get summary
    summary = eval_agent.get_evaluation_summary(results)
    
    # Print results for inspection
    print("\nEvaluation Results:")
    print("==================")
    print(f"Total Interactions: {results['summary']['total_interactions']}")
    print("\nAverage Scores:")
    for metric, score in results['summary']['average_scores'].items():
        print(f"{metric}: {score:.2f}")
    
    print("\nFailed Metrics:")
    for failure in results['summary']['failed_metrics']:
        print(f"Metric: {failure['metric']}")
        print(f"Score: {failure['score']:.2f}")
        print(f"Trace ID: {failure['trace_id']}")
    
    print("\nEvaluation Summary:")
    print("==================")
    print(f"Overall Health: {summary['overall_health']}")
    print("\nCritical Issues:")
    for issue in summary['critical_issues']:
        print(f"Metric: {issue['metric']}")
        print(f"Failure Count: {issue['failure_count']}")
        print(f"Average Score: {issue['avg_score']:.2f}")
    
    print("\nRecommendations:")
    for rec in summary['recommendations']:
        print(f"- {rec['action']} (Priority: {rec['priority']})")
    
    # Verify batch results structure
    assert 'user_id' in results
    assert 'interactions' in results
    assert 'summary' in results
    assert 'total_interactions' in results['summary']
    assert 'average_scores' in results['summary']
    assert 'failed_metrics' in results['summary']
    
    # Verify summary structure
    assert 'overall_health' in summary
    assert 'critical_issues' in summary
    assert 'metric_trends' in summary
    assert 'recommendations' in summary
    
    # Test individual test cases with custom metrics
    assert_test(test_case1, [correctness_metric, completeness_metric])
    assert_test(test_case2, [correctness_metric, completeness_metric])
    assert_test(test_case3, [correctness_metric, completeness_metric])
    assert_test(test_case4, [correctness_metric, completeness_metric])


if __name__ == "__main__":
    test_evaluation_agent() 