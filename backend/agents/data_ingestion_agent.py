from typing import Dict, List, Any
from sqlalchemy.orm import Session
from api.models.database import Trace
import json
from datetime import datetime, timedelta
import logging
from collections import defaultdict

logger = logging.getLogger(__name__)

class DataIngestionAgent:
    def __init__(self, db: Session):
        self.db = db
        self.processed_data = {
            'interactions': [],
            'logs': [],
            'metrics': [],
            'ai_signals': {
                'hallucinations': [],
                'prompt_drift': [],
                'data_drift': [],
                'session_contexts': []
            }
        }
        # Thresholds for data reduction
        self.metric_threshold = 0.1  # 10% change threshold
        self.log_window = 60  # 60 seconds window
        self.interaction_window = 300  # 5 minutes window
        
        # AI-specific thresholds
        self.hallucination_threshold = 0.7  # Confidence threshold for hallucination detection
        self.prompt_drift_threshold = 0.3  # Semantic similarity threshold for prompt drift
        self.data_drift_threshold = 0.2  # Distribution shift threshold
        self.baseline_window = 7  # Days to consider for baseline

    def process_traces(self, user_id: int = None) -> Dict[str, List[Dict[str, Any]]]:
        """Process and reduce traces by synthesizing redundant data"""
        try:
            query = self.db.query(Trace)
            if user_id:
                query = query.filter(Trace.user_id == user_id)
            
            # Order by timestamp for chronological processing
            query = query.order_by(Trace.created_at)
            traces = query.all()
            
            # Group traces by type for efficient processing
            grouped_traces = {
                'interaction': [],
                'log': [],
                'metric': []
            }
            
            # Track session contexts
            session_contexts = defaultdict(list)
            
            for trace in traces:
                try:
                    content = trace.content if isinstance(trace.content, dict) else json.loads(trace.content)
                    data_type = content.get('type')
                    if data_type in grouped_traces:
                        grouped_traces[data_type].append((trace, content))
                        
                        # Track session context
                        if 'session_id' in content.get('data', {}):
                            session_id = content['data']['session_id']
                            session_contexts[session_id].append((trace, content))
                            
                except Exception as e:
                    logger.error(f"Error processing trace {trace.id}: {str(e)}")
                    continue
            
            # Process each type with reduction
            self._process_reduced_interactions(grouped_traces['interaction'])
            self._process_reduced_logs(grouped_traces['log'])
            self._process_reduced_metrics(grouped_traces['metric'])
            
            # Process AI-specific signals
            self._process_ai_signals(grouped_traces['interaction'], session_contexts)
            
            return self.processed_data
            
        except Exception as e:
            logger.error(f"Error in process_traces: {str(e)}")
            raise

    def _process_ai_signals(self, interactions: List[tuple], session_contexts: Dict[str, List[tuple]]):
        """Process AI-specific signals for monitoring"""
        try:
            # Process hallucinations
            self._detect_hallucinations(interactions)
            
            # Process prompt drift
            self._detect_prompt_drift(interactions)
            
            # Process data drift
            self._detect_data_drift(interactions)
            
            # Process session contexts
            self._process_session_contexts(session_contexts)
            
        except Exception as e:
            logger.error(f"Error processing AI signals: {str(e)}")

    def _detect_hallucinations(self, interactions: List[tuple]):
        """Detect potential hallucinations in model outputs"""
        for trace, content in interactions:
            data = content.get('data', {})
            if 'response' in data:
                response = data['response']
                context = data.get('context', {})
                
                # Check for reference mismatches
                if 'references' in context and 'cited_references' in response:
                    missing_refs = set(context['references']) - set(response['cited_references'])
                    if missing_refs:
                        self.processed_data['ai_signals']['hallucinations'].append({
                            'trace_id': trace.id,
                            'timestamp': trace.created_at.isoformat(),
                            'type': 'reference_mismatch',
                            'missing_references': list(missing_refs),
                            'confidence': data.get('confidence', 0.0)
                        })
                
                # Check for capability claims
                if 'capability_claims' in response:
                    self.processed_data['ai_signals']['hallucinations'].append({
                        'trace_id': trace.id,
                        'timestamp': trace.created_at.isoformat(),
                        'type': 'capability_claim',
                        'claims': response['capability_claims'],
                        'confidence': data.get('confidence', 0.0)
                    })

    def _detect_prompt_drift(self, interactions: List[tuple]):
        """Detect drift in prompt templates and responses"""
        prompt_versions = defaultdict(list)
        
        for trace, content in interactions:
            data = content.get('data', {})
            if 'prompt_template' in data:
                template = data['prompt_template']
                prompt_versions[template['version']].append((trace, content))
        
        # Compare prompt versions
        versions = sorted(prompt_versions.keys())
        for i in range(len(versions) - 1):
            old_version = versions[i]
            new_version = versions[i + 1]
            
            # Compare outputs for similar inputs
            old_outputs = [c[1]['data']['response'] for c in prompt_versions[old_version]]
            new_outputs = [c[1]['data']['response'] for c in prompt_versions[new_version]]
            
            if self._calculate_drift_score(old_outputs, new_outputs) > self.prompt_drift_threshold:
                self.processed_data['ai_signals']['prompt_drift'].append({
                    'timestamp': trace.created_at.isoformat(),
                    'old_version': old_version,
                    'new_version': new_version,
                    'drift_score': self._calculate_drift_score(old_outputs, new_outputs)
                })

    def _detect_data_drift(self, interactions: List[tuple]):
        """Detect drift in input data patterns"""
        # Group interactions by time windows
        current_window = []
        window_start = interactions[0][0].created_at if interactions else datetime.now()
        
        for trace, content in interactions:
            if (trace.created_at - window_start).days >= self.baseline_window:
                # Compare current window with baseline
                if current_window:
                    drift_score = self._calculate_data_drift(current_window)
                    if drift_score > self.data_drift_threshold:
                        self.processed_data['ai_signals']['data_drift'].append({
                            'timestamp': trace.created_at.isoformat(),
                            'drift_score': drift_score,
                            'window_size': len(current_window)
                        })
                current_window = []
                window_start = trace.created_at
            
            current_window.append((trace, content))

    def _process_session_contexts(self, session_contexts: Dict[str, List[tuple]]):
        """Process and store session-level context for error analysis"""
        for session_id, traces in session_contexts.items():
            # Find error or hallucination events
            error_events = [
                t for t in traces 
                if t[1].get('data', {}).get('status') == 'ERROR' or
                'hallucination' in t[1].get('data', {}).get('type', '').lower()
            ]
            
            if error_events:
                # Get full context leading to error
                error_trace = error_events[0]
                context_traces = [
                    t for t in traces 
                    if t[0].created_at <= error_trace[0].created_at
                ]
                
                self.processed_data['ai_signals']['session_contexts'].append({
                    'session_id': session_id,
                    'error_timestamp': error_trace[0].created_at.isoformat(),
                    'error_type': error_trace[1].get('data', {}).get('type'),
                    'context_traces': [
                        {
                            'trace_id': t[0].id,
                            'timestamp': t[0].created_at.isoformat(),
                            'type': t[1].get('data', {}).get('type'),
                            'content': t[1].get('data', {})
                        }
                        for t in context_traces
                    ]
                })

    def _calculate_drift_score(self, old_outputs: List[str], new_outputs: List[str]) -> float:
        """Calculate semantic drift score between two sets of outputs"""
        # This is a placeholder - implement actual semantic similarity calculation
        return 0.0

    def _calculate_data_drift(self, window: List[tuple]) -> float:
        """Calculate data drift score for a window of interactions"""
        # This is a placeholder - implement actual drift calculation
        return 0.0

    def _process_reduced_interactions(self, interactions: List[tuple]):
        """Process and reduce redundant interactions"""
        if not interactions:
            return
            
        # Group interactions by time window
        current_window = []
        window_start = interactions[0][0].created_at
        
        for trace, content in interactions:
            if (trace.created_at - window_start).total_seconds() > self.interaction_window:
                # Process and add the current window
                if current_window:
                    self._add_synthesized_interaction(current_window)
                current_window = []
                window_start = trace.created_at
            
            current_window.append((trace, content))
        
        # Process the last window
        if current_window:
            self._add_synthesized_interaction(current_window)

    def _add_synthesized_interaction(self, window: List[tuple]):
        """Synthesize a group of interactions into a single representative interaction"""
        if not window:
            return
            
        # Get the most representative interaction (usually the one with most data)
        main_trace, main_content = max(window, key=lambda x: len(str(x[1])))
        
        # Count similar patterns
        pattern_count = len(window)
        
        # Create synthesized interaction
        data = main_content.get('data', {})
        interaction_data = {
            'trace_id': main_trace.id,
            'timestamp': main_trace.created_at.isoformat(),
            'pattern_count': pattern_count,
            'prompt': {
                'text': data.get('prompt'),
                'tokens': data.get('prompt_tokens'),
                'type': data.get('prompt_type', 'text')
            },
            'response': {
                'text': data.get('response'),
                'tokens': data.get('response_tokens'),
                'type': data.get('response_type', 'text')
            },
            'model': {
                'name': data.get('model'),
                'version': data.get('model_version'),
                'parameters': data.get('model_parameters', {})
            },
            'performance': {
                'avg_duration': sum(t[0].duration for t in window if hasattr(t[0], 'duration')) / len(window),
                'total_occurrences': pattern_count
            }
        }
        
        self.processed_data['interactions'].append(interaction_data)

    def _process_reduced_logs(self, logs: List[tuple]):
        """Process and reduce redundant logs"""
        if not logs:
            return
            
        # Group logs by time window and level
        current_window = []
        window_start = logs[0][0].created_at
        
        for trace, content in logs:
            if (trace.created_at - window_start).total_seconds() > self.log_window:
                # Process and add the current window
                if current_window:
                    self._add_synthesized_log(current_window)
                current_window = []
                window_start = trace.created_at
            
            current_window.append((trace, content))
        
        # Process the last window
        if current_window:
            self._add_synthesized_log(current_window)

    def _add_synthesized_log(self, window: List[tuple]):
        """Synthesize a group of logs into a single representative log"""
        if not window:
            return
            
        # Get the most severe log in the window
        main_trace, main_content = max(window, key=lambda x: self._get_log_severity(x[1]))
        
        data = main_content.get('data', {})
        log_data = {
            'trace_id': main_trace.id,
            'timestamp': main_trace.created_at.isoformat(),
            'level': data.get('level', 'INFO'),
            'type': data.get('type'),
            'occurrence_count': len(window),
            'message': data.get('message'),
            'context': {
                'user_id': main_trace.user_id,
                'session_id': data.get('session_id'),
                'environment': data.get('environment')
            }
        }
        
        self.processed_data['logs'].append(log_data)

    def _get_log_severity(self, content: Dict) -> int:
        """Get numeric severity of a log"""
        severity_map = {'ERROR': 3, 'WARNING': 2, 'INFO': 1, 'DEBUG': 0}
        return severity_map.get(content.get('data', {}).get('level', 'INFO'), 0)

    def _process_reduced_metrics(self, metrics: List[tuple]):
        """Process and reduce redundant metrics"""
        if not metrics:
            return
            
        # Group metrics by name
        metric_groups = {}
        for trace, content in metrics:
            metric_name = content.get('metric_name')
            if metric_name not in metric_groups:
                metric_groups[metric_name] = []
            metric_groups[metric_name].append((trace, content))
        
        # Process each metric group
        for metric_name, group in metric_groups.items():
            self._add_synthesized_metric(metric_name, group)

    def _add_synthesized_metric(self, metric_name: str, group: List[tuple]):
        """Synthesize a group of metrics into a single representative metric"""
        if not group:
            return
            
        # Calculate significant changes
        values = [m[1].get('data', {}).get('value', 0) for m in group]
        if not values:
            return
            
        # Only keep metrics that show significant changes
        if self._has_significant_change(values):
            main_trace, main_content = group[-1]  # Use the latest metric
            data = main_content.get('data', {})
            
            metric_data = {
                'trace_id': main_trace.id,
                'timestamp': main_trace.created_at.isoformat(),
                'name': metric_name,
                'value': data.get('value'),
                'type': data.get('type', 'gauge'),
                'unit': data.get('unit'),
                'trend': self._calculate_trend(values),
                'tags': {
                    'user_id': main_trace.user_id,
                    'service': data.get('tags', {}).get('service'),
                    'environment': data.get('tags', {}).get('environment')
                }
            }
            
            self.processed_data['metrics'].append(metric_data)

    def _has_significant_change(self, values: List[float]) -> bool:
        """Check if metric values show significant change"""
        if len(values) < 2:
            return True
            
        min_val = min(values)
        max_val = max(values)
        if min_val == 0:
            return max_val > 0
            
        change_ratio = (max_val - min_val) / min_val
        return change_ratio > self.metric_threshold

    def _calculate_trend(self, values: List[float]) -> str:
        """Calculate trend direction of metric values"""
        if len(values) < 2:
            return 'stable'
            
        first = values[0]
        last = values[-1]
        change = (last - first) / first if first != 0 else 0
        
        if abs(change) < self.metric_threshold:
            return 'stable'
        return 'increasing' if change > 0 else 'decreasing'

    def get_analysis_data(self) -> Dict[str, Any]:
        """Prepare optimized data for RCA analysis"""
        try:
            return {
                'data': {
                    'interactions': self.processed_data['interactions'],
                    'logs': self.processed_data['logs'],
                    'metrics': self.processed_data['metrics']
                }
            }
        except Exception as e:
            logger.error(f"Error in get_analysis_data: {str(e)}")
            raise 