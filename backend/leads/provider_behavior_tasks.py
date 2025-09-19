"""
Celery tasks for provider behavior ML model training
"""

from celery import shared_task
from django.utils import timezone
import logging
from backend.leads.provider_behavior_ml import ProviderBehaviorML

logger = logging.getLogger(__name__)


@shared_task
def train_provider_behavior_ml_model():
    """Train the provider behavior ML model for risk assessment and follow-through prediction"""
    try:
        ml_service = ProviderBehaviorML()
        
        # Train all models with 90 days of data
        result = ml_service.train_all_models(days_back=90)
        
        if 'error' in result:
            logger.warning(f"Provider behavior ML training failed: {result['error']}")
            return result
        
        logger.info(f"Provider behavior ML model training completed successfully")
        logger.info(f"Follow-through model accuracy: {result['follow_through_model']['accuracy']:.3f}")
        logger.info(f"Quality model accuracy: {result['quality_model']['accuracy']:.3f}")
        
        return result
        
    except Exception as e:
        logger.error(f"Error training provider behavior ML model: {str(e)}")
        return {'error': str(e)}


@shared_task
def analyze_provider_risk_scores():
    """Analyze all providers and generate risk scores using ML models"""
    try:
        ml_service = ProviderBehaviorML()
        
        # Load models
        ml_service.load_models()
        
        if not ml_service.is_trained:
            logger.warning("Provider behavior models not trained - skipping risk analysis")
            return {'error': 'Models not trained'}
        
        # Get problematic providers
        problematic_providers = ml_service.get_problematic_providers(
            min_assignments=3,
            risk_threshold=60.0
        )
        
        logger.info(f"Found {len(problematic_providers)} problematic providers")
        
        # Log high-risk providers
        high_risk_providers = [p for p in problematic_providers if p['risk_score'] >= 80]
        if high_risk_providers:
            logger.warning(f"High-risk providers detected: {len(high_risk_providers)}")
            for provider in high_risk_providers[:5]:  # Log top 5
                logger.warning(
                    f"High-risk provider: {provider['provider_email']} "
                    f"(Risk: {provider['risk_score']:.1f}%, "
                    f"Follow-through: {provider['follow_through_rate']:.1f}%, "
                    f"Abandonment: {provider['abandonment_rate']:.1f}%)"
                )
        
        return {
            'success': True,
            'total_providers_analyzed': len(problematic_providers),
            'high_risk_providers': len(high_risk_providers),
            'problematic_providers': problematic_providers[:10],  # Return top 10
            'analysis_date': timezone.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error analyzing provider risk scores: {str(e)}")
        return {'error': str(e)}


@shared_task
def predict_provider_follow_through(provider_id: str):
    """Predict follow-through rate for a specific provider"""
    try:
        ml_service = ProviderBehaviorML()
        
        # Load models
        ml_service.load_models()
        
        if not ml_service.is_trained:
            return {'error': 'Models not trained'}
        
        # Predict risk
        prediction = ml_service.predict_provider_risk(provider_id)
        
        if 'error' in prediction:
            logger.warning(f"Provider risk prediction failed: {prediction['error']}")
            return prediction
        
        logger.info(
            f"Provider {prediction['provider_email']} risk assessment: "
            f"Risk: {prediction['risk_score']:.1f}%, "
            f"Follow-through probability: {prediction['follow_through_probability']:.3f}"
        )
        
        return prediction
        
    except Exception as e:
        logger.error(f"Error predicting provider follow-through: {str(e)}")
        return {'error': str(e)}


@shared_task
def update_provider_quality_scores():
    """Update provider quality scores based on ML predictions"""
    try:
        ml_service = ProviderBehaviorML()
        
        # Load models
        ml_service.load_models()
        
        if not ml_service.is_trained:
            return {'error': 'Models not trained'}
        
        from django.contrib.auth import get_user_model
        from backend.users.models import ProviderProfile
        
        User = get_user_model()
        
        # Get all providers
        providers = User.objects.filter(
            user_type='provider'
        ).select_related('provider_profile')
        
        updated_count = 0
        
        for provider in providers:
            try:
                prediction = ml_service.predict_provider_risk(str(provider.id))
                
                if 'error' not in prediction and provider.provider_profile:
                    # Update provider profile with ML-derived quality score
                    provider.provider_profile.ml_quality_score = prediction['quality_probability'] * 100
                    provider.provider_profile.ml_risk_score = prediction['risk_score']
                    provider.provider_profile.ml_follow_through_score = prediction['follow_through_probability'] * 100
                    provider.provider_profile.ml_last_updated = timezone.now()
                    provider.provider_profile.save(update_fields=[
                        'ml_quality_score', 'ml_risk_score', 
                        'ml_follow_through_score', 'ml_last_updated'
                    ])
                    updated_count += 1
                    
            except Exception as e:
                logger.warning(f"Failed to update quality score for provider {provider.email}: {str(e)}")
                continue
        
        logger.info(f"Updated ML quality scores for {updated_count} providers")
        
        return {
            'success': True,
            'providers_updated': updated_count,
            'update_date': timezone.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error updating provider quality scores: {str(e)}")
        return {'error': str(e)}


@shared_task
def generate_provider_behavior_insights():
    """Generate comprehensive insights about provider behavior patterns"""
    try:
        ml_service = ProviderBehaviorML()
        
        # Load models
        ml_service.load_models()
        
        if not ml_service.is_trained:
            return {'error': 'Models not trained'}
        
        # Collect recent data
        recent_data = ml_service.collect_provider_behavior_data(days_back=30)
        
        if len(recent_data) == 0:
            return {'error': 'No recent provider data available'}
        
        # Calculate insights
        insights = {
            'total_active_providers': len(recent_data),
            'avg_follow_through_rate': recent_data['follow_through_rate'].mean(),
            'avg_abandonment_rate': recent_data['abandonment_rate'].mean(),
            'avg_quality_score': recent_data['quality_score'].mean(),
            'high_risk_providers_count': len(recent_data[recent_data['abandonment_rate'] > 50]),
            'top_performers_count': len(recent_data[recent_data['follow_through_rate'] > 80]),
            'problematic_patterns': [],
            'recommendations': []
        }
        
        # Identify patterns
        high_unlock_low_contact = recent_data[
            (recent_data['total_unlocks'] > 5) & 
            (recent_data['follow_through_rate'] < 30)
        ]
        
        if len(high_unlock_low_contact) > 0:
            insights['problematic_patterns'].append({
                'pattern': 'high_unlock_low_contact',
                'count': len(high_unlock_low_contact),
                'description': 'Providers unlocking many leads but not contacting clients'
            })
        
        # Generate recommendations
        if insights['avg_abandonment_rate'] > 40:
            insights['recommendations'].append(
                'Consider implementing unlock cooldown periods for high-abandonment providers'
            )
        
        if insights['avg_follow_through_rate'] < 50:
            insights['recommendations'].append(
                'Send reminder notifications to providers who unlock but don\'t contact'
            )
        
        if insights['high_risk_providers_count'] > len(recent_data) * 0.2:
            insights['recommendations'].append(
                'Review provider onboarding and training processes'
            )
        
        logger.info(f"Generated provider behavior insights: {insights['total_active_providers']} providers analyzed")
        
        return {
            'success': True,
            'insights': insights,
            'generated_date': timezone.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error generating provider behavior insights: {str(e)}")
        return {'error': str(e)}
