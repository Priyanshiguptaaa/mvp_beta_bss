from typing import Dict, List, Any, Optional
from sqlalchemy.orm import Session
from api.models.database import User, CustomMetric
import logging
from deepeval.metrics import (
    AnswerRelevancyMetric,
    FaithfulnessMetric,
    ContextualRelevancyMetric,
    ContextualPrecisionMetric,
    ContextualRecallMetric,
    HallucinationMetric,
    ToxicityMetric,
    BiasMetric
)
from deepeval.test_case import LLMTestCase
from deepeval.metrics.answer_relevancy import AnswerRelevancyTemplate
from deepeval.metrics.faithfulness import FaithfulnessTemplate
from deepeval.metrics.hallucination import HallucinationTemplate

logger = logging.getLogger(__name__)


class CustomAnswerRelevancyTemplate(AnswerRelevancyTemplate):
    def __init__(self, criteria: Optional[Dict[str, Any]] = None):
        self.criteria = criteria or {}
        super().__init__()

    def generate_statements(self, actual_output: str) -> str:
        criteria_str = "\n".join([
            f"- {k}: {v}" for k, v in self.criteria.get('evaluation_rules', {}).items()
        ])
        
        return f"""Analyze the text based on these criteria:
{criteria_str}

Text:
{actual_output}

JSON:
"""


class CustomFaithfulnessTemplate(FaithfulnessTemplate):
    def __init__(self, criteria: Optional[Dict[str, Any]] = None):
        self.criteria = criteria or {}
        super().__init__()

    def generate_statements(self, actual_output: str, context: str) -> str:
        criteria_str = "\n".join([
            f"- {k}: {v}" for k, v in self.criteria.get('evaluation_rules', {}).items()
        ])
        
        return f"""Analyze the text against context using these criteria:
{criteria_str}

Context:
{context}

Text:
{actual_output}

JSON:
"""


class CustomHallucinationTemplate(HallucinationTemplate):
    def __init__(self, criteria: Optional[Dict[str, Any]] = None):
        self.criteria = criteria or {}
        super().__init__()

    def generate_statements(self, actual_output: str, context: str) -> str:
        criteria_str = "\n".join([
            f"- {k}: {v}" for k, v in self.criteria.get('detection_rules', {}).items()
        ])
        
        return f"""Identify statements that violate these rules:
{criteria_str}

Context:
{context}

Text:
{actual_output}

JSON:
"""


class EvaluationAgent:
    def __init__(self, db: Session):
        self.db = db
        self.metrics = {}
        self.metric_criteria = {}

    def set_metric_criteria(self, metric_name: str, criteria: Dict[str, Any]):
        """Set evaluation criteria for a specific metric"""
        self.metric_criteria[metric_name] = criteria
        
        # Initialize or update metric with new criteria
        if metric_name == 'answer_relevancy':
            self.metrics[metric_name] = AnswerRelevancyMetric(
                evaluation_template=CustomAnswerRelevancyTemplate(criteria)
            )
        elif metric_name == 'faithfulness':
            self.metrics[metric_name] = FaithfulnessMetric(
                evaluation_template=CustomFaithfulnessTemplate(criteria)
            )
        elif metric_name == 'hallucination':
            self.metrics[metric_name] = HallucinationMetric(
                evaluation_template=CustomHallucinationTemplate(criteria)
            )

    def evaluate_interaction(
        self,
        user_query: str,
        model_output: str,
        context: List[str],
        gold_standard: Optional[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        """
        Evaluate a single interaction using all metrics
        
        Args:
            user_query: The original user query
            model_output: The model's response
            context: List of context strings used for the response
            gold_standard: Optional dict containing gold standard input/output
        """
        try:
            results = {}
            
            # Create test case with retrieval_context for metrics that need it
            test_case = LLMTestCase(
                input=user_query,
                actual_output=model_output,
                context=context,
                retrieval_context=context  # Add retrieval_context for Faithfulness and Hallucination
            )
            
            # Evaluate each metric
            for metric_name, metric in self.metrics.items():
                score = metric.measure(test_case)
                criteria = self.metric_criteria.get(metric_name, {})
                threshold = criteria.get('threshold', 0.7)
                
                results[metric_name] = {
                    'score': score,
                    'threshold': threshold,
                    'passed': score >= threshold,
                    'criteria': criteria
                }
            
            # Add gold standard comparison if provided
            if gold_standard:
                gold_input = gold_standard.get('input', '')
                gold_output = gold_standard.get('output', '')
                
                # Compare with gold standard
                gold_case = LLMTestCase(
                    input=gold_input,
                    actual_output=gold_output,
                    context=context,
                    retrieval_context=context  # Add retrieval_context here too
                )
                
                for metric_name, metric in self.metrics.items():
                    gold_score = metric.measure(gold_case)
                    results[f'{metric_name}_gold_comparison'] = {
                        'gold_score': gold_score,
                        'current_score': results[metric_name]['score'],
                        'difference': results[metric_name]['score'] - gold_score
                    }
            
            return results
            
        except Exception as e:
            logger.error(f"Error evaluating interaction: {str(e)}")
            return {}

    def evaluate_metrics(
        self,
        user_id: int,
        interactions: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Evaluate metrics for multiple interactions
        
        Args:
            user_id: User ID
            interactions: List of interaction data from data ingestion agent
        """
        try:
            results = {
                'user_id': user_id,
                'interactions': [],
                'summary': {
                    'total_interactions': len(interactions),
                    'average_scores': {},
                    'failed_metrics': []
                }
            }
            
            # Track scores for averaging
            metric_scores = {name: [] for name in self.metrics.keys()}
            
            for interaction in interactions:
                # Extract data from interaction
                user_query = interaction.get('prompt', {}).get('text', '')
                model_output = interaction.get('response', {}).get('text', '')
                context = interaction.get('context', [])
                
                # Get evaluation results
                eval_result = self.evaluate_interaction(
                    user_query=user_query,
                    model_output=model_output,
                    context=context
                )
                
                # Add to results
                results['interactions'].append({
                    'trace_id': interaction.get('trace_id'),
                    'timestamp': interaction.get('timestamp'),
                    'evaluation': eval_result
                })
                
                # Track scores
                for metric_name, metric_result in eval_result.items():
                    if metric_name.endswith('_gold_comparison'):
                        continue
                    metric_scores[metric_name].append(metric_result['score'])
                    
                    # Track failed metrics
                    if not metric_result['passed']:
                        results['summary']['failed_metrics'].append({
                            'metric': metric_name,
                            'trace_id': interaction.get('trace_id'),
                            'score': metric_result['score'],
                            'criteria': metric_result['criteria']
                        })
            
            # Calculate averages
            for metric_name, scores in metric_scores.items():
                if scores:
                    results['summary']['average_scores'][metric_name] = sum(scores) / len(scores)
            
            return results
            
        except Exception as e:
            logger.error(f"Error evaluating metrics: {str(e)}")
            return {}

    def get_evaluation_summary(self, results: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate a summary of evaluation results for RCA
        
        Args:
            results: Results from evaluate_metrics
        """
        try:
            summary = {
                'overall_health': 'good',
                'critical_issues': [],
                'metric_trends': {},
                'recommendations': []
            }
            
            # Check for critical issues
            failed_metrics = results.get('summary', {}).get('failed_metrics', [])
            if failed_metrics:
                summary['overall_health'] = 'needs_attention'
                
                # Group by metric type
                metric_issues = {}
                for issue in failed_metrics:
                    metric = issue['metric']
                    if metric not in metric_issues:
                        metric_issues[metric] = []
                    metric_issues[metric].append(issue)
                
                # Add critical issues
                for metric, issues in metric_issues.items():
                    if len(issues) > 2:  # More than 2 failures for same metric
                        summary['critical_issues'].append({
                            'metric': metric,
                            'failure_count': len(issues),
                            'avg_score': sum(i['score'] for i in issues) / len(issues),
                            'criteria': issues[0]['criteria']
                        })
            
            # Add metric trends
            avg_scores = results.get('summary', {}).get('average_scores', {})
            for metric, score in avg_scores.items():
                criteria = self.metric_criteria.get(metric, {})
                threshold = criteria.get('threshold', 0.7)
                summary['metric_trends'][metric] = {
                    'current_score': score,
                    'threshold': threshold,
                    'status': 'good' if score >= threshold else 'needs_improvement'
                }
            
            # Generate recommendations
            if summary['critical_issues']:
                for issue in summary['critical_issues']:
                    summary['recommendations'].append({
                        'metric': issue['metric'],
                        'action': f"Improve {issue['metric']} performance",
                        'priority': 'high',
                        'criteria': issue['criteria']
                    })
            
            return summary
            
        except Exception as e:
            logger.error(f"Error generating evaluation summary: {str(e)}")
            return {} 