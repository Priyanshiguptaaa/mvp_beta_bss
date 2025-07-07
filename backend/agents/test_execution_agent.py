from typing import Dict, List, Any
from sqlalchemy.orm import Session
from agents.evaluation_agent import EvaluationAgent
from agents.rca_agent import RCAAgent
from api.models.database import TestResult, Incident
import logging
from datetime import datetime
import json
from agents.data_ingestion_agent import DataIngestionAgent

logger = logging.getLogger(__name__)

print("Sanity scheduler script started")

class TestExecutionAgent:
    def __init__(self, db: Session):
        self.db = db
        self.eval_agent = EvaluationAgent(db)
        self.rca_agent = RCAAgent()  # RCAAgent doesn't need db session
        
    def execute_test(self, test_config: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute a test based on the provided configuration
        
        Args:
            test_config: Dictionary containing test configuration including:
                - test_name: Name of the test
                - instruction: Test instruction
                - agent: Agent to test
                - environment: Environment to run test in
                - expected_behavior: Expected behavior description
                
        Returns:
            Dictionary containing test results and RCA if test failed
        """
        try:
            # Validate required fields
            required_fields = ['test_name', 'instruction', 'agent', 'environment', 'expected_behavior']
            missing_fields = [field for field in required_fields if field not in test_config]
            if missing_fields:
                raise ValueError(f"Missing required fields: {', '.join(missing_fields)}")

            logger.info(f"Starting test execution for: {test_config['test_name']}")
            logger.debug(f"Test config: {json.dumps(test_config, indent=2)}")
            
            # Execute the test using the evaluation agent
            logger.info("Calling evaluation agent...")
            eval_result = self.eval_agent.evaluate_interaction(
                user_query=test_config['instruction'],
                model_output=test_config.get('model_output', ''),
                context=test_config.get('context', []),
                gold_standard=test_config.get('expected_behavior')
            )
            
            if not eval_result:
                raise ValueError("Evaluation agent returned empty result")
                
            logger.debug(f"Evaluation result: {json.dumps(eval_result, indent=2)}")
            
            # Check if test passed based on evaluation metrics
            test_passed = all(
                result['passed'] 
                for result in eval_result.values() 
                if isinstance(result, dict) and 'passed' in result
            )
            logger.info(f"Test {'passed' if test_passed else 'failed'}")
            
            # Save test result
            logger.info("Saving test result to database...")
            db_test_result = TestResult(
                test_name=test_config['test_name'],
                instruction=test_config['instruction'],
                agent=test_config['agent'],
                environment=test_config['environment'],
                expected_behavior=test_config['expected_behavior'],
                status='passed' if test_passed else 'failed',
                result=json.dumps(eval_result),
                details='Test passed successfully.' if test_passed else 'Test failed.',
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
            )
            self.db.add(db_test_result)
            self.db.commit()
            self.db.refresh(db_test_result)
            logger.info(f"Test result saved with ID: {db_test_result.id}")

            # If test failed, trigger RCA and create incident
            if not test_passed:
                logger.info("Test failed, extracting context and triggering RCA...")
                # Extract relevant logs, traces, metrics using DataIngestionAgent
                data_agent = DataIngestionAgent(self.db)
                # You may want to filter by user, agent, or test name if available
                # For now, we use all available data
                analysis_data = data_agent.get_analysis_data()
                # Add test result and config to the context
                analysis_data['test_name'] = test_config['test_name']
                analysis_data['test_result'] = eval_result
                analysis_data['environment'] = test_config['environment']
                analysis_data['agent'] = test_config['agent']
                analysis_data['timestamp'] = datetime.utcnow().isoformat()
                logger.debug(f"RCA input context: {json.dumps(analysis_data, indent=2)}")
                rca_result = self.rca_agent.analyze_data(analysis_data)
                logger.debug(f"RCA result: {json.dumps(rca_result, indent=2)}")

                if rca_result.get('status') == 'error':
                    error_msg = rca_result.get('error', 'Unknown error in RCA analysis')
                    logger.error(f"RCA analysis failed: {error_msg}")
                    self.db.rollback()
                    return {
                        'status': 'error',
                        'error': error_msg,
                        'test_result': eval_result
                    }

                if not rca_result.get('rca_report'):
                    error_msg = "RCA agent did not return a report"
                    logger.error(error_msg)
                    self.db.rollback()
                    return {
                        'status': 'error',
                        'error': error_msg,
                        'test_result': eval_result
                    }

                # Create incident record
                logger.info("Creating incident record...")
                incident = Incident(
                    title=f"Test Failure: {test_config['test_name']}",
                    description=rca_result['rca_report'],
                    status='open',
                    severity='medium',
                    agent=test_config['agent'],
                    test_result_id=db_test_result.id,
                    rca_report=rca_result['rca_report'],
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow(),
                )
                self.db.add(incident)
                self.db.commit()
                self.db.refresh(incident)
                incident_id = incident.id
                logger.info(f"Incident created with ID: {incident_id}")
                
                return {
                    'status': 'failed',
                    'test_result': eval_result,
                    'rca_report': rca_result['rca_report'],
                    'incident_id': incident_id
                }
            
            # Return passed test result
            logger.info("Test completed successfully")
            return {
                'status': 'passed',
                'test_result': eval_result
            }
            
        except ValueError as e:
            logger.error(f"Validation error: {str(e)}")
            self.db.rollback()
            return {
                'status': 'error',
                'error': str(e)
            }
        except Exception as e:
            logger.error(f"Error executing test: {str(e)}", exc_info=True)
            self.db.rollback()
            return {
                'status': 'error',
                'error': str(e)
            }
    
    def execute_batch_tests(self, test_configs: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Execute multiple tests in batch
        
        Args:
            test_configs: List of test configurations
            
        Returns:
            List of test results
        """
        results = []
        for config in test_configs:
            result = self.execute_test(config)
            results.append({
                'test_name': config['test_name'],
                'result': result
            })
        return results 