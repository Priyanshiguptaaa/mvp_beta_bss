from typing import Dict, Any
from langchain_community.chat_models import ChatOpenAI
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
import os
import logging

logger = logging.getLogger(__name__)

class RCAAgent:
    def __init__(self):
        self.llm = ChatOpenAI(
            model_name="gpt-4",
            temperature=0,
            openai_api_key=os.getenv("OPENAI_API_KEY")
        )
        
        self.prompt_template = PromptTemplate(
            input_variables=["data"],
            template=(
                "Analyze this data and identify any issues or patterns:\n\n"
                "{data}\n\n"
                "Provide a clear analysis with:\n"
                "1. Key findings\n"
                "2. Root causes\n"
                "3. Recommendations\n"
            )
        )
        
        self.chain = LLMChain(
            llm=self.llm,
            prompt=self.prompt_template
        )

    def analyze_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze the processed data"""
        try:
            # Get RCA analysis
            result = self.chain.invoke({
                "data": str(data)
            })
            
            if not result or not isinstance(result, dict) or 'text' not in result:
                return {
                    'error': 'Invalid response from LLM',
                    'status': 'error'
                }
            
            return {
                'rca_report': result['text'],
                'status': 'success'
            }
            
        except Exception as e:
            logger.error(f"Error in RCA analysis: {str(e)}")
            return {
                'error': str(e),
                'status': 'error'
            } 