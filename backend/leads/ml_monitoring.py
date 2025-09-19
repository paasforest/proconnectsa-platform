from django.conf import settings
from django.db.models import Count, Q
from django.utils import timezone
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

class MLReadinessMonitor:
    """Monitor when each ML service has enough data to be effective"""
    
    ML_REQUIREMENTS = {
        'LeadQualityMLService': {
            'min_leads': 100,  # Reduced from 1000 for early stage
            'min_outcomes': 50,  # leads with known outcomes
            'model': 'Lead',
            'description': 'Lead quality prediction and scoring'
        },
        'DynamicPricingMLService': {
            'min_transactions': 100,  # Reduced from 500
            'min_completed_jobs': 50,  # Reduced from 200
            'model': 'CreditTransaction',
            'description': 'Dynamic credit pricing optimization'
        },
        'LeadConversionMLService': {
            'min_conversions': 50,  # Reduced from 300
            'min_providers': 20,  # Reduced from 50
            'model': 'LeadAssignment',
            'description': 'Lead conversion probability prediction'
        },
        'ClientBehaviorML': {
            'min_user_actions': 500,  # Reduced from 2000
            'min_active_users': 25,  # Reduced from 100
            'model': 'User',
            'description': 'Client behavior analysis and prediction'
        },
        'GeographicalMLService': {
            'min_locations': 50,  # Reduced from 200
            'min_job_completions': 30,  # Reduced from 150
            'model': 'LeadAssignment',
            'description': 'Geographical lead matching optimization'
        },
        'LeadAccessControlMLService': {
            'min_access_events': 200,  # Reduced from 1000
            'min_providers': 30,  # Reduced from 80
            'model': 'LeadAssignment',
            'description': 'Lead access control and provider matching'
        },
        'SupportTicketMLService': {
            'min_tickets': 50,  # Reduced from 200
            'min_resolutions': 25,  # Reduced from 100
            'model': 'SupportTicket',
            'description': 'Support ticket classification and routing'
        }
    }
    
    @classmethod
    def get_ml_readiness_status(cls):
        """Get current readiness status for all ML services"""
        from .models import Lead, LeadAssignment
        from backend.users.models import User, ProviderProfile
        from backend.payments.models import Transaction
        from backend.support.models import SupportTicket
        
        status = {}
        
        # Lead Quality ML
        total_leads = Lead.objects.count()
        completed_leads = Lead.objects.filter(
            status__in=['completed', 'assigned']
        ).count()
        
        status['LeadQualityMLService'] = {
            'ready': total_leads >= cls.ML_REQUIREMENTS['LeadQualityMLService']['min_leads'],
            'progress': f"{total_leads}/{cls.ML_REQUIREMENTS['LeadQualityMLService']['min_leads']} leads",
            'completion_rate': min(total_leads / cls.ML_REQUIREMENTS['LeadQualityMLService']['min_leads'], 1.0),
            'data_quality': f"{completed_leads} leads with outcomes",
            'description': cls.ML_REQUIREMENTS['LeadQualityMLService']['description'],
            'priority': 'high'
        }
        
        # Dynamic Pricing ML
        total_transactions = Transaction.objects.filter(
            transaction_type='lead_purchase'
        ).count()
        completed_assignments = LeadAssignment.objects.filter(
            status__in=['won', 'completed']
        ).count()
        
        status['DynamicPricingMLService'] = {
            'ready': total_transactions >= cls.ML_REQUIREMENTS['DynamicPricingMLService']['min_transactions'],
            'progress': f"{total_transactions}/{cls.ML_REQUIREMENTS['DynamicPricingMLService']['min_transactions']} transactions",
            'completion_rate': min(total_transactions / cls.ML_REQUIREMENTS['DynamicPricingMLService']['min_transactions'], 1.0),
            'data_quality': f"{completed_assignments} completed jobs",
            'description': cls.ML_REQUIREMENTS['DynamicPricingMLService']['description'],
            'priority': 'medium'
        }
        
        # Lead Conversion ML
        total_assignments = LeadAssignment.objects.count()
        conversion_assignments = LeadAssignment.objects.filter(
            status__in=['won', 'lost', 'no_response']
        ).count()
        active_providers = ProviderProfile.objects.filter(
            verification_status='verified'
        ).count()
        
        status['LeadConversionMLService'] = {
            'ready': (conversion_assignments >= cls.ML_REQUIREMENTS['LeadConversionMLService']['min_conversions'] and
                     active_providers >= cls.ML_REQUIREMENTS['LeadConversionMLService']['min_providers']),
            'progress': f"{conversion_assignments}/{cls.ML_REQUIREMENTS['LeadConversionMLService']['min_conversions']} conversions",
            'completion_rate': min(conversion_assignments / cls.ML_REQUIREMENTS['LeadConversionMLService']['min_conversions'], 1.0),
            'data_quality': f"{active_providers} active providers",
            'description': cls.ML_REQUIREMENTS['LeadConversionMLService']['description'],
            'priority': 'high'
        }
        
        # Client Behavior ML
        active_users = User.objects.filter(
            last_active__gte=timezone.now() - timedelta(days=30)
        ).count()
        total_users = User.objects.count()
        
        status['ClientBehaviorML'] = {
            'ready': (total_users >= cls.ML_REQUIREMENTS['ClientBehaviorML']['min_active_users'] and
                     total_users >= cls.ML_REQUIREMENTS['ClientBehaviorML']['min_user_actions']),
            'progress': f"{active_users}/{cls.ML_REQUIREMENTS['ClientBehaviorML']['min_active_users']} active users",
            'completion_rate': min(active_users / cls.ML_REQUIREMENTS['ClientBehaviorML']['min_active_users'], 1.0),
            'data_quality': f"{total_users} total users",
            'description': cls.ML_REQUIREMENTS['ClientBehaviorML']['description'],
            'priority': 'low'
        }
        
        # Geographical ML
        unique_locations = Lead.objects.filter(
            location_city__isnull=False
        ).values('location_city').distinct().count()
        completed_jobs = LeadAssignment.objects.filter(
            status='completed'
        ).count()
        
        status['GeographicalMLService'] = {
            'ready': (unique_locations >= cls.ML_REQUIREMENTS['GeographicalMLService']['min_locations'] and
                     completed_jobs >= cls.ML_REQUIREMENTS['GeographicalMLService']['min_job_completions']),
            'progress': f"{unique_locations}/{cls.ML_REQUIREMENTS['GeographicalMLService']['min_locations']} locations",
            'completion_rate': min(unique_locations / cls.ML_REQUIREMENTS['GeographicalMLService']['min_locations'], 1.0),
            'data_quality': f"{completed_jobs} completed jobs",
            'description': cls.ML_REQUIREMENTS['GeographicalMLService']['description'],
            'priority': 'medium'
        }
        
        # Lead Access Control ML
        access_events = LeadAssignment.objects.count()
        verified_providers = ProviderProfile.objects.filter(
            verification_status='verified'
        ).count()
        
        status['LeadAccessControlMLService'] = {
            'ready': (access_events >= cls.ML_REQUIREMENTS['LeadAccessControlMLService']['min_access_events'] and
                     verified_providers >= cls.ML_REQUIREMENTS['LeadAccessControlMLService']['min_providers']),
            'progress': f"{access_events}/{cls.ML_REQUIREMENTS['LeadAccessControlMLService']['min_access_events']} access events",
            'completion_rate': min(access_events / cls.ML_REQUIREMENTS['LeadAccessControlMLService']['min_access_events'], 1.0),
            'data_quality': f"{verified_providers} verified providers",
            'description': cls.ML_REQUIREMENTS['LeadAccessControlMLService']['description'],
            'priority': 'high'
        }
        
        # Support Ticket ML
        try:
            total_tickets = SupportTicket.objects.count()
            resolved_tickets = SupportTicket.objects.filter(
                status='resolved'
            ).count()
            
            status['SupportTicketMLService'] = {
                'ready': (total_tickets >= cls.ML_REQUIREMENTS['SupportTicketMLService']['min_tickets'] and
                         resolved_tickets >= cls.ML_REQUIREMENTS['SupportTicketMLService']['min_resolutions']),
                'progress': f"{total_tickets}/{cls.ML_REQUIREMENTS['SupportTicketMLService']['min_tickets']} tickets",
                'completion_rate': min(total_tickets / cls.ML_REQUIREMENTS['SupportTicketMLService']['min_tickets'], 1.0),
                'data_quality': f"{resolved_tickets} resolved tickets",
                'description': cls.ML_REQUIREMENTS['SupportTicketMLService']['description'],
                'priority': 'low'
            }
        except Exception as e:
            logger.warning(f"Support ticket ML monitoring failed: {e}")
            status['SupportTicketMLService'] = {
                'ready': False,
                'progress': "0/50 tickets",
                'completion_rate': 0.0,
                'data_quality': "Support system not available",
                'description': cls.ML_REQUIREMENTS['SupportTicketMLService']['description'],
                'priority': 'low'
            }
        
        return status
    
    @classmethod
    def should_enable_ml_service(cls, service_name):
        """Check if specific ML service should be enabled"""
        status = cls.get_ml_readiness_status()
        return status.get(service_name, {}).get('ready', False)
    
    @classmethod
    def get_dashboard_data(cls):
        """Get formatted data for admin dashboard"""
        status = cls.get_ml_readiness_status()
        
        # Calculate overall readiness
        completion_rates = [s.get('completion_rate', 0) for s in status.values()]
        overall_readiness = sum(completion_rates) / len(completion_rates) if completion_rates else 0
        
        # Count ready services
        services_ready = sum(1 for s in status.values() if s.get('ready', False))
        
        dashboard_data = {
            'overall_readiness': round(overall_readiness * 100, 1),
            'services_ready': services_ready,
            'total_services': len(status),
            'services': status,
            'recommendations': cls._get_recommendations(status),
            'next_priorities': cls._get_next_priorities(status)
        }
        
        return dashboard_data
    
    @classmethod
    def _get_recommendations(cls, status):
        """Generate recommendations for improving ML readiness"""
        recommendations = []
        
        # High priority services that aren't ready
        high_priority_services = [
            name for name, data in status.items() 
            if data.get('priority') == 'high' and not data.get('ready', False)
        ]
        
        if high_priority_services:
            recommendations.append(
                f"Focus on high-priority ML services: {', '.join(high_priority_services)}"
            )
        
        # Services close to being ready
        almost_ready = [
            name for name, data in status.items() 
            if 0.7 <= data.get('completion_rate', 0) < 1.0 and not data.get('ready', False)
        ]
        
        if almost_ready:
            recommendations.append(
                f"Almost ready for ML: {', '.join(almost_ready)} - push for completion!"
            )
        
        # Data collection recommendations
        for service_name, service_status in status.items():
            if not service_status.get('ready', False):
                completion = service_status.get('completion_rate', 0)
                if completion < 0.3:
                    recommendations.append(
                        f"Focus on data collection for {service_name} - only {completion:.1%} ready"
                    )
                elif completion < 0.8:
                    recommendations.append(
                        f"{service_name} is {completion:.1%} ready - almost there!"
                    )
        
        return recommendations
    
    @classmethod
    def _get_next_priorities(cls, status):
        """Get next priority services to focus on"""
        priorities = []
        
        # Sort by priority and completion rate
        sorted_services = sorted(
            status.items(),
            key=lambda x: (
                {'high': 1, 'medium': 2, 'low': 3}[x[1].get('priority', 'low')],
                -x[1].get('completion_rate', 0)
            )
        )
        
        for service_name, service_data in sorted_services:
            if not service_data.get('ready', False):
                priorities.append({
                    'service': service_name,
                    'priority': service_data.get('priority', 'low'),
                    'completion': service_data.get('completion_rate', 0),
                    'description': service_data.get('description', ''),
                    'progress': service_data.get('progress', '')
                })
        
        return priorities[:3]  # Top 3 priorities
    
    @classmethod
    def get_ml_health_score(cls):
        """Get overall ML health score (0-100)"""
        status = cls.get_ml_readiness_status()
        
        # Weight by priority
        priority_weights = {'high': 3, 'medium': 2, 'low': 1}
        
        weighted_score = 0
        total_weight = 0
        
        for service_name, service_data in status.items():
            weight = priority_weights.get(service_data.get('priority', 'low'), 1)
            completion = service_data.get('completion_rate', 0)
            
            weighted_score += completion * weight
            total_weight += weight
        
        if total_weight == 0:
            return 0
        
        return round((weighted_score / total_weight) * 100, 1)
