"""
Celery tasks for client behavior ML model training
"""

from celery import shared_task
from django.utils import timezone
import logging
from backend.leads.client_behavior_ml import ClientBehaviorML

logger = logging.getLogger(__name__)


@shared_task
def train_client_behavior_ml_model():
    """Train the client behavior ML model for conversion prediction"""
    try:
        ml_service = ClientBehaviorML()
        
        # Collect training data
        training_data = ml_service.collect_training_data(days_back=90)
        
        if len(training_data) < 50:
            logger.warning(f"Not enough training data: {len(training_data)} samples")
            return {'error': 'Not enough training data', 'samples': len(training_data)}
        
        # Engineer features
        training_data = ml_service.engineer_features(training_data)
        
        # Train model
        result = ml_service.train_model(training_data)
        
        # Save model
        model_path = '/home/paas/work_platform/backend/models/client_behavior_model.pkl'
        ml_service.save_model(model_path)
        
        logger.info(f"Client behavior ML model training completed: {result}")
        return result
        
    except Exception as e:
        logger.error(f"Error training client behavior ML model: {str(e)}")
        return {'error': str(e)}


@shared_task
def predict_lead_conversion_probability(lead_id):
    """Predict conversion probability for a specific lead"""
    try:
        from backend.leads.models import Lead
        
        lead = Lead.objects.get(id=lead_id)
        ml_service = ClientBehaviorML()
        
        # Try to load existing model
        model_path = '/home/paas/work_platform/backend/models/client_behavior_model.pkl'
        ml_service.load_model(model_path)
        
        if not ml_service.is_trained:
            logger.warning("Client behavior ML model not trained, returning default probability")
            return {'probability': 0.5, 'model_trained': False}
        
        # Predict probability
        probability = ml_service.predict_conversion_probability(lead)
        
        logger.info(f"Predicted conversion probability for lead {lead_id}: {probability:.3f}")
        return {
            'lead_id': lead_id,
            'probability': probability,
            'model_trained': True
        }
        
    except Lead.DoesNotExist:
        logger.error(f"Lead {lead_id} not found")
        return {'error': 'Lead not found'}
    except Exception as e:
        logger.error(f"Error predicting conversion probability: {str(e)}")
        return {'error': str(e)}



