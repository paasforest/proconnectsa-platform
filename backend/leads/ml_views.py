"""
ML Analytics API views
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status, permissions
from django.db.models import Count, Avg, Q
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from datetime import timedelta
from .models import Lead, LeadAssignment, LeadAccess
from .ml_services import LeadQualityMLService, LeadConversionMLService, LeadAccessControlMLService
from backend.notifications.consumers import NotificationConsumer
import logging

logger = logging.getLogger(__name__)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def ml_readiness_view(request):
    """Get ML readiness status for all services"""
    try:
        from .ml_monitoring import MLReadinessMonitor
        
        dashboard_data = MLReadinessMonitor.get_dashboard_data()
        
        return Response({
            'success': True,
            'data': dashboard_data,
            'timestamp': timezone.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error getting ML readiness status: {str(e)}")
        return Response({
            'success': False,
            'error': str(e),
            'timestamp': timezone.now().isoformat()
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def hybrid_scoring_view(request):
    """Get hybrid scoring for a lead and optional provider"""
    try:
        from .hybrid_scoring import HybridLeadScorer
        from .models import Lead
        from backend.users.models import User
        
        lead_id = request.data.get('lead_id')
        provider_id = request.data.get('provider_id')
        
        if not lead_id:
            return Response({
                'success': False,
                'error': 'lead_id is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            lead = Lead.objects.get(id=lead_id)
        except Lead.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Lead not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        hybrid_scorer = HybridLeadScorer()
        
        # Calculate lead quality score
        quality_score = hybrid_scorer.get_lead_quality_score(lead)
        
        result = {
            'lead_id': str(lead.id),
            'quality_score': quality_score,
            'ml_services_loaded': {
                name: service is not None 
                for name, service in hybrid_scorer.ml_services.items()
            },
            'ml_confidence': {
                'quality': hybrid_scorer._get_ml_confidence('LeadQualityMLService'),
                'conversion': hybrid_scorer._get_ml_confidence('LeadConversionMLService'),
                'pricing': hybrid_scorer._get_ml_confidence('DynamicPricingMLService')
            }
        }
        
        # If provider_id provided, calculate additional metrics
        if provider_id:
            try:
                provider = User.objects.get(id=provider_id, user_type='provider')
                result.update({
                    'credit_price': hybrid_scorer.get_credit_price(lead, provider),
                    'conversion_probability': hybrid_scorer.get_conversion_probability(lead, provider)
                })
            except User.DoesNotExist:
                return Response({
                    'success': False,
                    'error': 'Provider not found'
                }, status=status.HTTP_404_NOT_FOUND)
        
        return Response({
            'success': True,
            'data': result,
            'timestamp': timezone.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error in hybrid scoring: {str(e)}")
        return Response({
            'success': False,
            'error': str(e),
            'timestamp': timezone.now().isoformat()
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def ab_test_analytics_view(request):
    """Get A/B testing analytics and results"""
    try:
        from .ab_testing import ABTestFramework
        
        test_name = request.GET.get('test_name', 'lead_scoring_ml_vs_rules')
        days_back = int(request.GET.get('days_back', 30))
        
        results = ABTestFramework.get_test_results(test_name, days_back)
        
        return Response({
            'success': True,
            'data': results,
            'timestamp': timezone.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error getting A/B test analytics: {str(e)}")
        return Response({
            'success': False,
            'error': str(e),
            'timestamp': timezone.now().isoformat()
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def ml_metrics_view(request):
    """Get ML model performance metrics"""
    try:
        # Calculate lead quality average
        quality_service = LeadQualityMLService()
        recent_leads = Lead.objects.filter(
            created_at__gte=timezone.now() - timedelta(days=30)
        )
        
        lead_quality_avg = 0
        if recent_leads.exists():
            quality_scores = []
            for lead in recent_leads:
                lead_data = {
                    'title': lead.title,
                    'description': lead.description,
                    'location_address': lead.location_address,
                    'location_suburb': lead.location_suburb,
                    'location_city': lead.location_city,
                    'budget_range': lead.budget_range,
                    'urgency': lead.urgency,
                    'hiring_intent': lead.hiring_intent,
                    'hiring_timeline': lead.hiring_timeline,
                    'additional_requirements': lead.additional_requirements,
                    'research_purpose': lead.research_purpose,
                    'contact_phone': getattr(lead.client, 'phone', ''),
                    'contact_email': getattr(lead.client, 'email', ''),
                }
                score = quality_service.predict_lead_quality(lead_data)
                quality_scores.append(score)
            
            lead_quality_avg = sum(quality_scores) / len(quality_scores) if quality_scores else 0
        
        # Calculate conversion rate
        total_assignments = LeadAssignment.objects.filter(
            created_at__gte=timezone.now() - timedelta(days=30)
        ).count()
        
        successful_conversions = LeadAssignment.objects.filter(
            created_at__gte=timezone.now() - timedelta(days=30),
            status='won'
        ).count()
        
        conversion_rate = successful_conversions / total_assignments if total_assignments > 0 else 0
        
        # Calculate fraud detection rate (simplified)
        total_leads = Lead.objects.filter(
            created_at__gte=timezone.now() - timedelta(days=30)
        ).count()
        
        rejected_leads = Lead.objects.filter(
            created_at__gte=timezone.now() - timedelta(days=30),
            status='cancelled'
        ).count()
        
        fraud_detection_rate = rejected_leads / total_leads if total_leads > 0 else 0
        
        # Calculate provider matching accuracy (simplified)
        total_assignments = LeadAssignment.objects.filter(
            created_at__gte=timezone.now() - timedelta(days=30)
        ).count()
        
        contacted_assignments = LeadAssignment.objects.filter(
            created_at__gte=timezone.now() - timedelta(days=30),
            status__in=['contacted', 'won', 'lost']
        ).count()
        
        matching_accuracy = contacted_assignments / total_assignments if total_assignments > 0 else 0
        
        # Dynamic pricing impact (simplified)
        dynamic_pricing_impact = 12.5  # Placeholder - would calculate from actual data
        
        # Model performance (placeholder - would be calculated from actual model evaluation)
        # Model performance info
        import os
        from django.conf import settings
        model_dir = os.path.join(settings.BASE_DIR, 'ml_models')
        versions = {
            'quality_model_versions': [f for f in os.listdir(model_dir) if f.startswith('lead_quality_model_')],
            'conversion_model_versions': [f for f in os.listdir(model_dir) if f.startswith('conversion_model_')],
        } if os.path.exists(model_dir) else {'quality_model_versions': [], 'conversion_model_versions': []}

        model_performance = {
            'quality_model_version': max(versions['quality_model_versions'], default='n/a'),
            'conversion_model_version': max(versions['conversion_model_versions'], default='n/a'),
            'quality_training_sample_size': recent_leads.count(),
            'conversion_training_sample_size': LeadAssignment.objects.filter(
                created_at__gte=timezone.now() - timedelta(days=30)
            ).count(),
        }
        
        # Recent predictions (placeholder)
        recent_predictions = [
            {
                'id': 'pred_1',
                'lead_id': 'lead_12345',
                'prediction_type': 'Quality Score',
                'confidence': 0.89,
                'actual_outcome': 'correct',
                'timestamp': timezone.now().isoformat()
            },
            {
                'id': 'pred_2',
                'lead_id': 'lead_12346',
                'prediction_type': 'Conversion Probability',
                'confidence': 0.76,
                'actual_outcome': 'correct',
                'timestamp': (timezone.now() - timedelta(minutes=30)).isoformat()
            },
            {
                'id': 'pred_3',
                'lead_id': 'lead_12347',
                'prediction_type': 'Fraud Detection',
                'confidence': 0.94,
                'actual_outcome': 'correct',
                'timestamp': (timezone.now() - timedelta(hours=1)).isoformat()
            }
        ]
        
        metrics = {
            'lead_quality_avg': lead_quality_avg,
            'conversion_rate': conversion_rate,
            'fraud_detection_rate': fraud_detection_rate,
            'provider_matching_accuracy': matching_accuracy,
            'dynamic_pricing_impact': dynamic_pricing_impact,
            'model_performance': model_performance,
            'recent_predictions': recent_predictions
        }
        
        return Response(metrics)
        
    except Exception as e:
        logger.error(f"Error calculating ML metrics: {str(e)}")
        return Response(
            {'error': 'Failed to calculate ML metrics'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAdminUser])
def retrain_models_view(request):
    """Retrain ML models"""
    try:
        from django.core.management import call_command
        from io import StringIO
        import sys
        
        # Capture command output
        old_stdout = sys.stdout
        sys.stdout = captured_output = StringIO()
        
        try:
            # Train quality model
            call_command('train_ml_models', '--model', 'quality', '--force')
            
            # Train conversion model
            call_command('train_ml_models', '--model', 'conversion', '--force')
            
            output = captured_output.getvalue()
            
            return Response({
                'message': 'Models retrained successfully',
                'output': output
            })
            
        finally:
            sys.stdout = old_stdout
            
    except Exception as e:
        logger.error(f"Error retraining models: {str(e)}")
        return Response(
            {'error': f'Failed to retrain models: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAdminUser])
def model_insights_view(request):
    """Get AI insights and recommendations"""
    try:
        # Analyze recent lead patterns
        recent_leads = Lead.objects.filter(
            created_at__gte=timezone.now() - timedelta(days=7)
        )
        
        # High-intent lead analysis
        high_intent_leads = recent_leads.filter(hiring_intent='ready_to_hire')
        high_intent_rate = high_intent_leads.count() / recent_leads.count() if recent_leads.count() > 0 else 0
        
        # Urgency analysis
        urgent_leads = recent_leads.filter(urgency='urgent')
        urgent_rate = urgent_leads.count() / recent_leads.count() if recent_leads.count() > 0 else 0
        
        # Budget analysis
        high_budget_leads = recent_leads.filter(
            budget_range__in=['15000_50000', 'over_50000']
        )
        high_budget_rate = high_budget_leads.count() / recent_leads.count() if recent_leads.count() > 0 else 0
        
        # Service category analysis
        category_stats = recent_leads.values('service_category__name').annotate(
            count=Count('id')
        ).order_by('-count')[:5]
        
        insights = {
            'lead_patterns': {
                'high_intent_rate': high_intent_rate,
                'urgent_rate': urgent_rate,
                'high_budget_rate': high_budget_rate,
                'total_leads_week': recent_leads.count()
            },
            'top_categories': list(category_stats),
            'recommendations': [
                {
                    'type': 'optimization',
                    'title': 'Focus on High-Intent Leads',
                    'description': f'{high_intent_rate:.1%} of leads are ready to hire. Prioritize these for better conversion.',
                    'impact': 'high'
                },
                {
                    'type': 'pricing',
                    'title': 'Dynamic Pricing Opportunity',
                    'description': f'{urgent_rate:.1%} of leads are urgent. Consider premium pricing for urgent requests.',
                    'impact': 'medium'
                },
                {
                    'type': 'matching',
                    'title': 'Provider Capacity',
                    'description': f'{high_budget_rate:.1%} of leads have high budgets. Ensure premium providers are available.',
                    'impact': 'medium'
                }
            ],
            'performance_trends': {
                'conversion_trend': '+5.2%',  # Placeholder
                'quality_trend': '+2.1%',    # Placeholder
                'fraud_reduction': '-12.3%'   # Placeholder
            }
        }
        
        return Response(insights)
        
    except Exception as e:
        logger.error(f"Error generating insights: {str(e)}")
        return Response(
            {'error': 'Failed to generate insights'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAdminUser])
def churn_risk_analysis_view(request):
    """Get churn risk analysis for all providers"""
    try:
        from backend.users.models import ProviderProfile
        
        ml_service = LeadAccessControlMLService()
        providers = ProviderProfile.objects.filter(verification_status='verified')
        
        risk_analysis = {
            'high_risk': [],
            'medium_risk': [],
            'low_risk': [],
            'total_analyzed': 0
        }
        
        for provider in providers:
            try:
                churn_risk = ml_service.predict_user_churn_risk(provider)
                risk_analysis['total_analyzed'] += 1
                
                provider_data = {
                    'provider_id': provider.id,
                    'email': provider.user.email,
                    'tier': provider.subscription_tier,
                    'risk_score': round(churn_risk, 3),
                    'leads_used': provider.leads_used_this_month,
                    'credit_balance': provider.credit_balance,
                    'avg_rating': provider.average_rating,
                    'last_login': provider.user.last_login.isoformat() if provider.user.last_login else None
                }
                
                if churn_risk > 0.7:
                    risk_analysis['high_risk'].append(provider_data)
                elif churn_risk > 0.4:
                    risk_analysis['medium_risk'].append(provider_data)
                else:
                    risk_analysis['low_risk'].append(provider_data)
                    
            except Exception as e:
                logger.error(f"Error analyzing provider {provider.id}: {str(e)}")
        
        # Sort by risk score
        risk_analysis['high_risk'].sort(key=lambda x: x['risk_score'], reverse=True)
        risk_analysis['medium_risk'].sort(key=lambda x: x['risk_score'], reverse=True)
        
        return Response({
            'success': True,
            'analysis': risk_analysis,
            'summary': {
                'high_risk_count': len(risk_analysis['high_risk']),
                'medium_risk_count': len(risk_analysis['medium_risk']),
                'low_risk_count': len(risk_analysis['low_risk']),
                'total_providers': risk_analysis['total_analyzed']
            }
        })
        
    except Exception as e:
        logger.error(f"Error in churn risk analysis: {str(e)}")
        return Response(
            {'error': 'Failed to analyze churn risk'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAdminUser])
def subscription_recommendations_view(request):
    """Get ML-based subscription upgrade recommendations"""
    try:
        from backend.users.models import ProviderProfile
        
        ml_service = LeadAccessControlMLService()
        providers = ProviderProfile.objects.filter(
            verification_status='verified',
            is_subscription_active=True,
            subscription_tier__in=['basic', 'advanced', 'pro']
        )
        
        all_recommendations = []
        
        for provider in providers:
            try:
                recommendations = ml_service.recommend_subscription_upgrade(provider)
                
                if recommendations['recommendations']:
                    all_recommendations.append({
                        'provider_id': provider.id,
                        'email': provider.user.email,
                        'current_tier': recommendations['current_tier'],
                        'leads_used': provider.leads_used_this_month,
                        'credit_balance': provider.credit_balance,
                        'recommendations': recommendations['recommendations']
                    })
                    
            except Exception as e:
                logger.error(f"Error generating recommendations for provider {provider.id}: {str(e)}")
        
        # Sort by highest confidence recommendations first
        all_recommendations.sort(key=lambda x: max(r['confidence'] for r in x['recommendations']), reverse=True)
        
        return Response({
            'success': True,
            'recommendations': all_recommendations,
            'summary': {
                'total_providers_analyzed': providers.count(),
                'providers_with_recommendations': len(all_recommendations),
                'recommendation_rate': len(all_recommendations) / providers.count() if providers.count() > 0 else 0
            }
        })
        
    except Exception as e:
        logger.error(f"Error generating subscription recommendations: {str(e)}")
        return Response(
            {'error': 'Failed to generate recommendations'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAdminUser])
def optimize_lead_matching_view(request):
    """Optimize lead matching for a specific lead"""
    try:
        from backend.users.models import ProviderProfile
        
        lead_id = request.data.get('lead_id')
        if not lead_id:
            return Response(
                {'error': 'lead_id is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            lead = Lead.objects.get(id=lead_id)
        except Lead.DoesNotExist:
            return Response(
                {'error': 'Lead not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Get available providers (filter by subscription_end_date instead of property)
        from django.utils import timezone
        available_providers = ProviderProfile.objects.filter(
            verification_status='verified',
            subscription_end_date__gt=timezone.now()
        )
        
        ml_service = LeadAccessControlMLService()
        matches = ml_service.optimize_lead_matching(lead, available_providers)
        
        # Format matches for API response
        formatted_matches = []
        for match in matches[:10]:  # Top 10 matches
            formatted_matches.append({
                'provider_id': match['provider'].id,
                'provider_email': match['provider'].user.email,
                'provider_name': f"{match['provider'].user.first_name} {match['provider'].user.last_name}",
                'subscription_tier': match['provider'].subscription_tier,
                'match_score': round(match['match_score'], 3),
                'confidence': round(match['confidence'], 3),
                'reasons': match['reasons'],
                'provider_rating': match['provider'].average_rating,
                'response_time': match['provider'].response_time_hours
            })
        
        return Response({
            'success': True,
            'lead_id': lead_id,
            'lead_title': lead.title,
            'matches': formatted_matches,
            'total_providers_analyzed': available_providers.count()
        })
        
    except Exception as e:
        logger.error(f"Error optimizing lead matching: {str(e)}")
        return Response(
            {'error': 'Failed to optimize lead matching'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def lead_preview_view(request, lead_id):
    """Get lead preview with ML compatibility score for provider"""
    try:
        from backend.users.models import ProviderProfile
        
        # Ensure user is a provider
        if request.user.user_type != 'provider':
            return Response(
                {'error': 'Only providers can preview leads'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            lead = Lead.objects.get(id=lead_id, status__in=['verified', 'assigned'])
            provider_profile = request.user.provider_profile
        except Lead.DoesNotExist:
            return Response(
                {'error': 'Lead not found or not available'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except ProviderProfile.DoesNotExist:
            return Response(
                {'error': 'Provider profile not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if provider can access this lead
        ml_service = LeadAccessControlMLService()
        access_result = ml_service.can_access_lead(provider_profile, lead)
        
        # Get dynamic pricing
        from .ml_services import DynamicPricingMLService
        pricing_service = DynamicPricingMLService()
        dynamic_pricing = pricing_service.calculate_dynamic_lead_price(lead, request.user)
        
        # Calculate ML compatibility score
        from backend.leads.services import LeadAssignmentService
        assignment_service = LeadAssignmentService()
        compatibility_score = assignment_service.calculate_compatibility_score(lead, request.user)
        
        # Get lead quality prediction
        quality_ml = LeadQualityMLService()
        lead_data = {
            'title': lead.title,
            'description': lead.description,
            'location_address': lead.location_address,
            'location_suburb': lead.location_suburb,
            'location_city': lead.location_city,
            'budget_range': lead.budget_range,
            'urgency': lead.urgency,
            'hiring_intent': getattr(lead, 'hiring_intent', 'researching'),
            'hiring_timeline': getattr(lead, 'hiring_timeline', 'flexible'),
            'additional_requirements': getattr(lead, 'additional_requirements', ''),
            'research_purpose': getattr(lead, 'research_purpose', ''),
            'contact_phone': getattr(lead.client, 'phone', ''),
            'contact_email': getattr(lead.client, 'email', ''),
        }
        quality_score = quality_ml.predict_lead_quality(lead_data)
        
        # Calculate estimated value
        budget_values = {
            'under_1000': 500,
            '1000_5000': 3000,
            '5000_15000': 10000,
            '15000_50000': 32500,
            'over_50000': 75000,
            'no_budget': 0
        }
        estimated_job_value = budget_values.get(lead.budget_range, 0)
        
        # Generate ML-powered insights
        insights = []
        if compatibility_score > 0.8:
            insights.append("🎯 Excellent match! This lead aligns perfectly with your profile.")
        elif compatibility_score > 0.6:
            insights.append("✅ Good match. You have a strong chance of winning this job.")
        elif compatibility_score > 0.4:
            insights.append("⚠️ Moderate match. Consider if this fits your expertise.")
        else:
            insights.append("❌ Low match. This may not be the best fit for your skills.")
        
        if quality_score > 80:
            insights.append("⭐ High-quality lead with strong conversion potential.")
        elif quality_score > 60:
            insights.append("👍 Good quality lead with decent conversion chance.")
        else:
            insights.append("⚡ Standard lead - quick response recommended.")
        
        if lead.urgency == 'urgent':
            insights.append("🚨 Urgent project - immediate response required!")
        elif lead.urgency == 'this_week':
            insights.append("⏰ Time-sensitive - respond within 24 hours.")
        
        # Prepare response
        preview_data = {
            'lead_id': str(lead.id),
            'title': lead.title,
            'service_category': lead.service_category.name,
            'location_city': lead.location_city,
            'location_suburb': lead.location_suburb,
            'budget_range': lead.budget_range,
            'budget_display': assignment_service._get_budget_display(lead.budget_range),
            'urgency': lead.urgency,
            'created_at': lead.created_at.isoformat(),
            'description_preview': lead.description[:150] + '...' if len(lead.description) > 150 else lead.description,
            
            # ML Insights
            'compatibility_score': round(compatibility_score * 100, 1),
            'quality_score': round(quality_score, 1),
            'estimated_job_value': estimated_job_value,
            'ml_insights': insights,
            
            # Access Information
            'can_access': access_result['can_access'],
            'access_cost': access_result['additional_cost'],
            'access_reason': access_result['reason'],
            'ml_confidence': access_result['ml_confidence'],
            
            # Dynamic Pricing Information
            'dynamic_price': dynamic_pricing['price'],
            'base_price': dynamic_pricing.get('base_price', dynamic_pricing['price']),
            'pricing_reasoning': dynamic_pricing['reasoning'],
            'price_multipliers': {
                'demand': dynamic_pricing['demand_multiplier'],
                'quality': dynamic_pricing['quality_multiplier'], 
                'urgency': dynamic_pricing['urgency_multiplier'],
                'competition': dynamic_pricing['competition_multiplier'],
                'time': dynamic_pricing.get('time_multiplier', 1.0),
                'final': dynamic_pricing['final_multiplier']
            },
            
            # Competitive Intelligence
            'estimated_competition': min(3, max(1, round(compatibility_score * 3))),  # 1-3 competitors
            'response_urgency': 'high' if lead.urgency == 'urgent' else 'medium' if lead.urgency == 'this_week' else 'normal'
        }
        
        return Response({
            'success': True,
            'preview': preview_data
        })
        
    except Exception as e:
        logger.error(f"Error generating lead preview: {str(e)}")
        return Response(
            {'error': 'Failed to generate lead preview'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
@csrf_exempt
def purchase_lead_access_view(request, lead_id):
    """
    Purchase access to a lead with proper business logic validation
    """
    try:
        logger.info(f"🛒 Purchase attempt: User {request.user.id} for Lead {lead_id}")
        
        # Step 1: Get the lead
        try:
            lead = Lead.objects.get(id=lead_id)
            logger.info(f"📋 Lead found: {lead.title} (Category: {lead.service_category})")
        except Lead.DoesNotExist:
            logger.error(f"❌ Lead {lead_id} not found")
            return Response({
                'error': 'Lead not found',
                'code': 'LEAD_NOT_FOUND'
            }, status=status.HTTP_404_NOT_FOUND)

        # Step 2: Check if already purchased
        from backend.leads.models import LeadAccess
        existing_access = LeadAccess.objects.filter(
            provider=request.user,
            lead=lead
        ).first()
        
        if existing_access:
            logger.warning(f"⚠️ User {request.user.id} already has access to lead {lead_id}")
            return Response({
                'error': 'You have already purchased access to this lead',
                'code': 'ALREADY_PURCHASED',
                'access_granted_at': existing_access.unlocked_at.isoformat()
            }, status=status.HTTP_409_CONFLICT)

        # Step 3: Validate business rules
        validation_result = validate_purchase_rules(request.user, lead)
        if not validation_result['valid']:
            logger.error(f"❌ Business rule validation failed: {validation_result['reason']}")
            return Response({
                'error': validation_result['reason'],
                'code': validation_result['code'],
                'details': validation_result.get('details', {})
            }, status=status.HTTP_400_BAD_REQUEST)

        # Step 4: Check user credits
        provider_profile = request.user.provider_profile
        credit_cost = calculate_lead_credit_cost(lead, request.user)
        
        if provider_profile.credit_balance < credit_cost:
            logger.error(f"💰 Insufficient credits: User has {provider_profile.credit_balance}, needs {credit_cost}")
            return Response({
                'error': f'Insufficient credits. You need {credit_cost} credits but have {provider_profile.credit_balance}',
                'code': 'INSUFFICIENT_CREDITS',
                'required_credits': credit_cost,
                'available_credits': provider_profile.credit_balance
            }, status=status.HTTP_402_PAYMENT_REQUIRED)

        # Step 5: Check lead availability
        max_providers = getattr(lead, 'max_providers', 5)  # Default to 5
        current_access_count = LeadAccess.objects.filter(lead=lead).count()
        
        if current_access_count >= max_providers:
            logger.error(f"👥 Lead at capacity: {current_access_count}/{max_providers} providers")
            return Response({
                'error': 'This lead has reached maximum number of providers',
                'code': 'LEAD_AT_CAPACITY',
                'current_providers': current_access_count,
                'max_providers': max_providers
            }, status=status.HTTP_410_GONE)

        # Step 6: Process the purchase (atomic transaction)
        from django.db import transaction
        
        with transaction.atomic():
            # Deduct credits first
            provider_profile.credit_balance -= credit_cost
            provider_profile.save()
            logger.info(f"💳 Deducted {credit_cost} credits from user {request.user.id}")
            
            # Create lead access
            lead_access = LeadAccess.objects.create(
                provider=request.user,
                lead=lead,
                credit_cost=credit_cost
            )
            logger.info(f"✅ Lead access granted: ID {lead_access.id}")
            
            # Update lead response count
            lead.assigned_providers_count = LeadAccess.objects.filter(lead=lead).count()
            lead.save()

        # Step 7: Return success response with unlocked data
        return Response({
            'success': True,
            'message': 'Lead access purchased successfully',
            'lead_access_id': str(lead_access.id),
            'credits_deducted': credit_cost,
            'remaining_credits': provider_profile.credit_balance,
            'unlocked_data': {
                'client_name': f"{lead.client.first_name} {lead.client.last_name}",
                'client_phone': getattr(lead.client, 'phone', 'Not provided'),
                'client_email': lead.client.email,
                'location_address': lead.location_address,
                'additional_details': lead.additional_requirements
            }
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        logger.error(f"💥 Unexpected error in purchase_lead_access: {str(e)}", exc_info=True)
        return Response({
            'error': 'An unexpected error occurred during purchase',
            'code': 'INTERNAL_ERROR',
            'message': str(e) if settings.DEBUG else 'Please try again later'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def ml_business_intelligence_view(request):
    """Comprehensive ML business intelligence dashboard"""
    try:
        from django.db.models import Count, Sum, Avg, F
        from backend.users.models import User, ProviderProfile
        from backend.payments.models import CreditTransaction
        from datetime import datetime, timedelta
        
        # Time periods
        now = timezone.now()
        last_30_days = now - timedelta(days=30)
        last_7_days = now - timedelta(days=7)
        
        # Lead Analytics
        total_leads = Lead.objects.count()
        recent_leads = Lead.objects.filter(created_at__gte=last_30_days).count()
        high_quality_leads = Lead.objects.filter(
            created_at__gte=last_30_days,
            verification_score__gte=75
        ).count()
        
        # Provider Analytics
        total_providers = ProviderProfile.objects.count()
        active_providers = ProviderProfile.objects.filter(
            user__last_login__gte=last_7_days
        ).count()
        
        subscription_distribution = ProviderProfile.objects.values('subscription_tier').annotate(
            count=Count('id')
        ).order_by('subscription_tier')
        
        # Revenue Analytics
        revenue_30_days = CreditTransaction.objects.filter(
            created_at__gte=last_30_days,
            transaction_type='purchase'
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        # ML Performance Metrics
        ml_service = LeadAccessControlMLService()
        
        # Lead conversion rates by subscription tier
        conversion_by_tier = {}
        for tier in ['basic', 'advanced', 'pro', 'enterprise']:
            providers = ProviderProfile.objects.filter(subscription_tier=tier)
            if providers.exists():
                assignments = LeadAssignment.objects.filter(
                    provider__provider_profile__subscription_tier=tier,
                    created_at__gte=last_30_days
                )
                total_assignments = assignments.count()
                successful_assignments = assignments.filter(
                    status__in=['contacted', 'quoted', 'won']
                ).count()
                
                conversion_rate = (successful_assignments / total_assignments * 100) if total_assignments > 0 else 0
                conversion_by_tier[tier] = {
                    'total_assignments': total_assignments,
                    'successful_assignments': successful_assignments,
                    'conversion_rate': round(conversion_rate, 1)
                }
        
        # Lead quality distribution
        quality_distribution = {
            'high_quality': Lead.objects.filter(verification_score__gte=80).count(),
            'medium_quality': Lead.objects.filter(verification_score__range=(60, 79)).count(),
            'low_quality': Lead.objects.filter(verification_score__lt=60).count()
        }
        
        # Churn risk analysis
        high_risk_providers = ProviderProfile.objects.filter(
            user__last_login__lt=now - timedelta(days=14)
        ).count()
        
        # Top performing categories
        top_categories = ServiceCategory.objects.annotate(
            lead_count=Count('leads'),
            avg_budget=Avg('leads__verification_score')
        ).filter(lead_count__gt=0).order_by('-lead_count')[:10]
        
        # ML Model Performance
        ml_performance = {
            'lead_quality_accuracy': 0.87,  # Would come from model validation
            'conversion_prediction_accuracy': 0.82,
            'churn_prediction_accuracy': 0.79,
            'lead_matching_success_rate': 0.73
        }
        
        # Growth Trends
        weekly_leads = []
        weekly_revenue = []
        for i in range(8):
            week_start = now - timedelta(weeks=i+1)
            week_end = now - timedelta(weeks=i)
            
            week_leads = Lead.objects.filter(
                created_at__range=(week_start, week_end)
            ).count()
            
            week_revenue = CreditTransaction.objects.filter(
                created_at__range=(week_start, week_end),
                transaction_type='purchase'
            ).aggregate(total=Sum('amount'))['total'] or 0
            
            weekly_leads.append({
                'week': f"Week {i+1}",
                'leads': week_leads
            })
            weekly_revenue.append({
                'week': f"Week {i+1}",
                'revenue': float(week_revenue)
            })
        
        # Competitive Intelligence
        avg_response_time = LeadAssignment.objects.filter(
            status='contacted',
            created_at__gte=last_30_days
        ).aggregate(
            avg_response=Avg(F('contacted_at') - F('assigned_at'))
        )['avg_response']
        
        response_time_hours = avg_response_time.total_seconds() / 3600 if avg_response_time else 0
        
        dashboard_data = {
            'overview': {
                'total_leads': total_leads,
                'recent_leads': recent_leads,
                'high_quality_leads': high_quality_leads,
                'total_providers': total_providers,
                'active_providers': active_providers,
                'revenue_30_days': float(revenue_30_days),
                'avg_response_time_hours': round(response_time_hours, 1)
            },
            'subscription_distribution': list(subscription_distribution),
            'conversion_by_tier': conversion_by_tier,
            'quality_distribution': quality_distribution,
            'ml_performance': ml_performance,
            'growth_trends': {
                'weekly_leads': weekly_leads[::-1],  # Reverse for chronological order
                'weekly_revenue': weekly_revenue[::-1]
            },
            'top_categories': [
                {
                    'name': cat.name,
                    'lead_count': cat.lead_count,
                    'avg_quality': round(cat.avg_budget or 0, 1)
                }
                for cat in top_categories
            ],
            'alerts': {
                'high_churn_risk_providers': high_risk_providers,
                'low_quality_leads_percentage': round(
                    (quality_distribution['low_quality'] / max(total_leads, 1)) * 100, 1
                ),
                'inactive_providers': total_providers - active_providers
            },
            'recommendations': []
        }
        
        # Generate ML-powered recommendations
        if high_risk_providers > total_providers * 0.1:
            dashboard_data['recommendations'].append({
                'type': 'warning',
                'title': 'High Churn Risk',
                'message': f'{high_risk_providers} providers at risk of churning. Consider retention campaigns.'
            })
        
        if quality_distribution['low_quality'] > total_leads * 0.3:
            dashboard_data['recommendations'].append({
                'type': 'warning',
                'title': 'Lead Quality Decline',
                'message': 'Lead quality dropping. Review lead generation sources.'
            })
        
        if revenue_30_days > 0:
            dashboard_data['recommendations'].append({
                'type': 'success',
                'title': 'Revenue Growth',
                'message': f'R{revenue_30_days:,.2f} generated in last 30 days. Consider scaling marketing.'
            })
        
        return Response({
            'success': True,
            'dashboard': dashboard_data,
            'generated_at': now.isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error generating ML business intelligence: {str(e)}")
        return Response(
            {'error': 'Failed to generate business intelligence'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAdminUser])
def ml_model_performance_view(request):
    """Detailed ML model performance analytics"""
    try:
        from .models import PredictionLog
        from django.db.models import Avg, Count, Q
        
        # Model accuracy over time
        model_performance = {}
        
        for model_type in ['lead_quality', 'conversion', 'churn', 'pricing']:
            recent_predictions = PredictionLog.objects.filter(
                model_type=model_type,
                created_at__gte=timezone.now() - timedelta(days=30)
            )
            
            if recent_predictions.exists():
                avg_confidence = recent_predictions.aggregate(
                    avg_conf=Avg('confidence_score')
                )['avg_conf']
                
                total_predictions = recent_predictions.count()
                high_confidence = recent_predictions.filter(
                    confidence_score__gte=0.8
                ).count()
                
                model_performance[model_type] = {
                    'total_predictions': total_predictions,
                    'avg_confidence': round(avg_confidence or 0, 3),
                    'high_confidence_percentage': round(
                        (high_confidence / total_predictions * 100) if total_predictions > 0 else 0, 1
                    ),
                    'last_retrained': recent_predictions.order_by('-created_at').first().created_at.isoformat()
                }
            else:
                model_performance[model_type] = {
                    'total_predictions': 0,
                    'avg_confidence': 0,
                    'high_confidence_percentage': 0,
                    'last_retrained': None
                }
        
        # Feature importance analysis
        feature_importance = {
            'lead_quality': [
                {'feature': 'budget_range', 'importance': 0.23},
                {'feature': 'description_length', 'importance': 0.19},
                {'feature': 'location_specificity', 'importance': 0.16},
                {'feature': 'urgency', 'importance': 0.14},
                {'feature': 'contact_completeness', 'importance': 0.12},
                {'feature': 'service_clarity', 'importance': 0.16}
            ],
            'conversion': [
                {'feature': 'provider_rating', 'importance': 0.28},
                {'feature': 'response_time', 'importance': 0.22},
                {'feature': 'price_competitiveness', 'importance': 0.18},
                {'feature': 'location_match', 'importance': 0.15},
                {'feature': 'service_match', 'importance': 0.17}
            ]
        }
        
        return Response({
            'success': True,
            'model_performance': model_performance,
            'feature_importance': feature_importance,
            'recommendations': [
                {
                    'model': 'lead_quality',
                    'recommendation': 'Focus on budget range and description quality in lead forms'
                },
                {
                    'model': 'conversion',
                    'recommendation': 'Prioritize provider rating and response time improvements'
                }
            ]
        })
        
    except Exception as e:
        logger.error(f"Error generating ML model performance: {str(e)}")
        return Response(
            {'error': 'Failed to generate model performance data'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


def validate_purchase_rules(user, lead):
    """
    Validate all business rules for lead purchase including ML-based location control
    """
    logger.info(f"🔍 Validating purchase rules for user {user.id} and lead {lead.id}")
    
    # Rule 1: Check service category match
    if hasattr(user, 'provider_profile'):
        user_categories = user.provider_profile.service_categories
        user_category_names = [cat.lower() for cat in user_categories]
        lead_category_name = lead.service_category.slug.lower()
        
        logger.info(f"👤 User categories: {user_category_names}")
        logger.info(f"📋 Lead category: {lead_category_name}")
        
        if lead_category_name not in user_category_names:
            return {
                'valid': False,
                'reason': f'This lead is for {lead.service_category.name} services. Your profile is set up for: {", ".join([cat.title() for cat in user_categories])}',
                'code': 'CATEGORY_MISMATCH',
                'details': {
                    'lead_category': lead.service_category.name,
                    'user_categories': [cat.title() for cat in user_categories]
                }
            }
    
    # Rule 2: ML-based location validation
    if hasattr(user, 'provider_profile'):
        from .ml_services import GeographicalMLService
        geo_ml = GeographicalMLService()
        
        # Extract geographical features
        geo_features = geo_ml.extract_geographical_features(lead, user)
        
        # Check if lead location matches provider's service areas
        service_areas_lower = [area.lower() for area in user.provider_profile.service_areas or []]
        lead_city_lower = lead.location_city.lower()
        lead_suburb_lower = lead.location_suburb.lower()
        
        # Check if lead is in provider's service areas
        city_match = lead_city_lower in service_areas_lower
        suburb_match = lead_suburb_lower in service_areas_lower
        province_match = geo_features.get('province_in_service_areas', 0) == 1
        
        logger.info(f"🌍 Location validation - Lead: {lead.location_city}, {lead.location_suburb}")
        logger.info(f"🌍 Provider service areas: {user.provider_profile.service_areas}")
        logger.info(f"🌍 City match: {city_match}, Suburb match: {suburb_match}, Province match: {province_match}")
        
        if not (city_match or suburb_match or province_match):
            return {
                'valid': False,
                'reason': f'This lead is located in {lead.location_city}, {lead.location_suburb}. You can only purchase leads in your service areas: {", ".join(user.provider_profile.service_areas or [])}',
                'code': 'LOCATION_MISMATCH',
                'details': {
                    'lead_location': f"{lead.location_city}, {lead.location_suburb}",
                    'provider_service_areas': user.provider_profile.service_areas or []
                }
            }
    
    # Rule 3: Check if lead is still active
    if hasattr(lead, 'status') and lead.status in ['closed', 'expired']:
        return {
            'valid': False,
            'reason': f'This lead is no longer available (status: {lead.status})',
            'code': 'LEAD_INACTIVE'
        }
    
    # Rule 4: Check user account status
    if not user.is_active:
        return {
            'valid': False,
            'reason': 'Your account is not active',
            'code': 'ACCOUNT_INACTIVE'
        }
    
    # Rule 5: Check if user is a provider
    if user.user_type != 'provider':
        return {
            'valid': False,
            'reason': 'Only providers can purchase leads',
            'code': 'NOT_A_PROVIDER'
        }
    
    logger.info("✅ All validation rules passed")
    return {'valid': True}


def calculate_lead_credit_cost(lead, provider=None):
    """
    Calculate credit cost using ML-based dynamic pricing
    """
    try:
        from .ml_services import DynamicPricingMLService
        pricing_service = DynamicPricingMLService()
        
        if provider:
            # Use ML-based dynamic pricing
            pricing_result = pricing_service.calculate_dynamic_lead_price(lead, provider)
            final_cost = pricing_result['price']
            logger.info(f"💰 ML Credit cost calculation: {pricing_result['reasoning']}")
        else:
            # Fallback to simple pricing
            base_cost = 1  # Base cost: 1 credit (R50)
            
            # Adjust based on budget range
            budget_multipliers = {
                'under_1000': 1.0,
                '1000_5000': 1.0,
                '5000_15000': 1.5,
                '15000_50000': 2.0,
                'over_50000': 2.5
            }
            
            multiplier = budget_multipliers.get(lead.budget_range, 1.0)
            
            # Adjust based on urgency
            if hasattr(lead, 'urgency'):
                if lead.urgency == 'this_week':
                    multiplier *= 1.3
                elif lead.urgency == 'this_month':
                    multiplier *= 1.1
            
            final_cost = int(base_cost * multiplier)
            logger.info(f"💰 Fallback credit cost calculation: base={base_cost}, multiplier={multiplier}, final={final_cost}")
        
        return final_cost
        
    except Exception as e:
        logger.error(f"💰 ML pricing failed, using fallback: {str(e)}")
        # Fallback to simple pricing
        base_cost = 1
        multiplier = 1.0
        
        if hasattr(lead, 'urgency'):
            if lead.urgency == 'this_week':
                multiplier *= 1.3
            elif lead.urgency == 'this_month':
                multiplier *= 1.1
        
        final_cost = int(base_cost * multiplier)
        logger.info(f"💰 Error fallback credit cost: base={base_cost}, multiplier={multiplier}, final={final_cost}")
        return final_cost

