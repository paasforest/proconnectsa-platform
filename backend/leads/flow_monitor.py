"""
Lead Flow Monitor - Ensures bulletproof operation from client to provider unlock.
This system monitors every step and alerts on failures.
"""
from django.core.cache import cache
from django.db import transaction
from django.utils import timezone
from datetime import timedelta
from backend.leads.models import Lead, LeadAssignment, ServiceCategory
from backend.users.models import User, ProviderProfile
import logging
import json

logger = logging.getLogger(__name__)


class LeadFlowMonitor:
    """
    Monitors the complete lead flow and ensures bulletproof operation
    """
    
    def __init__(self):
        self.alerts = []
        self.metrics = {
            'leads_created': 0,
            'leads_assigned': 0,
            'leads_unlocked': 0,
            'failed_assignments': 0,
            'failed_unlocks': 0,
        }

    def monitor_lead_creation(self, lead):
        """Monitor lead creation step"""
        try:
            # Check required fields
            required_fields = ['name', 'phone', 'email', 'title', 'service_category', 'location_city']
            missing_fields = []
            
            for field in required_fields:
                if not getattr(lead, field, None):
                    missing_fields.append(field)
            
            if missing_fields:
                self.alert(
                    level='ERROR',
                    message=f"Lead {lead.id} missing required fields: {missing_fields}",
                    lead_id=lead.id
                )
                return False
            
            # Check service category exists and is active
            if not lead.service_category.is_active:
                self.alert(
                    level='ERROR',
                    message=f"Lead {lead.id} uses inactive service category: {lead.service_category.name}",
                    lead_id=lead.id
                )
                return False
            
            # Log successful creation
            self.metrics['leads_created'] += 1
            logger.info(f"✅ Lead creation monitored: {lead.id}")
            return True
            
        except Exception as e:
            self.alert(
                level='CRITICAL',
                message=f"Lead creation monitoring failed: {str(e)}",
                lead_id=getattr(lead, 'id', 'unknown')
            )
            return False

    def monitor_lead_assignment(self, lead):
        """Monitor lead assignment step"""
        try:
            # Check if lead should be assigned
            if lead.status != 'verified':
                logger.info(f"Lead {lead.id} not verified, skipping assignment check")
                return True
            
            # Check for assignments
            assignments = LeadAssignment.objects.filter(lead=lead)
            assignment_count = assignments.count()
            
            if assignment_count == 0:
                # Check if there are eligible providers
                eligible_providers = self._get_eligible_providers(lead)
                
                if eligible_providers > 0:
                    self.alert(
                        level='ERROR',
                        message=f"Lead {lead.id} has {eligible_providers} eligible providers but 0 assignments",
                        lead_id=lead.id
                    )
                    self.metrics['failed_assignments'] += 1
                    return False
                else:
                    logger.info(f"Lead {lead.id} has no eligible providers (geographic/service mismatch)")
                    return True
            
            # Check assignment quality
            for assignment in assignments:
                if not self._validate_assignment(assignment):
                    self.alert(
                        level='ERROR',
                        message=f"Invalid assignment: Lead {lead.id} to Provider {assignment.provider.email}",
                        lead_id=lead.id
                    )
                    return False
            
            self.metrics['leads_assigned'] += 1
            logger.info(f"✅ Lead assignment monitored: {lead.id} → {assignment_count} providers")
            return True
            
        except Exception as e:
            self.alert(
                level='CRITICAL',
                message=f"Assignment monitoring failed for lead {lead.id}: {str(e)}",
                lead_id=lead.id
            )
            return False

    def monitor_lead_unlock(self, lead, provider, success=True):
        """Monitor lead unlock attempt"""
        try:
            assignment = LeadAssignment.objects.filter(lead=lead, provider=provider).first()
            
            if not assignment:
                self.alert(
                    level='ERROR',
                    message=f"Unlock attempted without assignment: Lead {lead.id}, Provider {provider.email}",
                    lead_id=lead.id
                )
                self.metrics['failed_unlocks'] += 1
                return False
            
            if success:
                self.metrics['leads_unlocked'] += 1
                logger.info(f"✅ Lead unlock monitored: {lead.id} by {provider.email}")
                
                # Check credit deduction
                profile = provider.provider_profile
                if profile.credit_balance < 0:
                    self.alert(
                        level='WARNING',
                        message=f"Provider {provider.email} has negative credit balance: {profile.credit_balance}",
                        lead_id=lead.id
                    )
            else:
                self.metrics['failed_unlocks'] += 1
                self.alert(
                    level='WARNING',
                    message=f"Failed unlock attempt: Lead {lead.id}, Provider {provider.email}",
                    lead_id=lead.id
                )
            
            return success
            
        except Exception as e:
            self.alert(
                level='CRITICAL',
                message=f"Unlock monitoring failed: {str(e)}",
                lead_id=lead.id
            )
            return False

    def monitor_system_health(self):
        """Monitor overall system health"""
        try:
            health_report = {
                'timestamp': timezone.now().isoformat(),
                'metrics': self.metrics.copy(),
                'alerts': self.alerts.copy(),
                'checks': {}
            }
            
            # Check for unassigned leads (older than 5 minutes)
            cutoff_time = timezone.now() - timedelta(minutes=5)
            unassigned_leads = Lead.objects.filter(
                status='verified',
                created_at__lt=cutoff_time,
                assignments__isnull=True
            ).count()
            
            health_report['checks']['unassigned_leads'] = unassigned_leads
            
            if unassigned_leads > 0:
                self.alert(
                    level='WARNING',
                    message=f"Found {unassigned_leads} unassigned leads older than 5 minutes"
                )
            
            # Check for providers without credits
            broke_providers = ProviderProfile.objects.filter(
                credit_balance__lte=0,
                verification_status='verified'
            ).count()
            
            health_report['checks']['broke_providers'] = broke_providers
            
            # Check for orphaned assignments
            orphaned_assignments = LeadAssignment.objects.filter(
                lead__isnull=True
            ).count()
            
            health_report['checks']['orphaned_assignments'] = orphaned_assignments
            
            if orphaned_assignments > 0:
                self.alert(
                    level='ERROR',
                    message=f"Found {orphaned_assignments} orphaned assignments"
                )
            
            # Store health report in cache
            cache.set('lead_flow_health', health_report, timeout=3600)
            
            logger.info(f"📊 System health monitored: {json.dumps(health_report, indent=2)}")
            return health_report
            
        except Exception as e:
            self.alert(
                level='CRITICAL',
                message=f"System health monitoring failed: {str(e)}"
            )
            return None

    def _get_eligible_providers(self, lead):
        """Count providers eligible for this lead"""
        try:
            eligible_count = 0
            
            # Get providers with matching service
            matching_providers = ProviderProfile.objects.filter(
                services__category=lead.service_category,
                verification_status='verified'
            ).distinct()
            
            for profile in matching_providers:
                # Check geographic match
                provider_areas = [area.name for area in profile.service_areas.all()]
                if lead.location_city in provider_areas:
                    eligible_count += 1
            
            return eligible_count
            
        except Exception as e:
            logger.error(f"Error counting eligible providers: {str(e)}")
            return 0

    def _validate_assignment(self, assignment):
        """Validate an assignment is correct"""
        try:
            lead = assignment.lead
            provider = assignment.provider
            profile = provider.provider_profile
            
            # Check service match
            provider_services = [s.category.slug for s in profile.services.all()]
            if lead.service_category.slug not in provider_services:
                logger.error(f"Service mismatch: {provider.email} doesn't offer {lead.service_category.slug}")
                return False
            
            # Check geographic match
            provider_areas = [area.name for area in profile.service_areas.all()]
            if lead.location_city not in provider_areas:
                logger.error(f"Geographic mismatch: {provider.email} doesn't serve {lead.location_city}")
                return False
            
            # Check provider is verified
            if profile.verification_status != 'verified':
                logger.error(f"Provider not verified: {provider.email}")
                return False
            
            return True
            
        except Exception as e:
            logger.error(f"Assignment validation error: {str(e)}")
            return False

    def alert(self, level, message, lead_id=None):
        """Create an alert"""
        alert = {
            'timestamp': timezone.now().isoformat(),
            'level': level,
            'message': message,
            'lead_id': lead_id
        }
        
        self.alerts.append(alert)
        
        # Log based on level
        if level == 'CRITICAL':
            logger.critical(f"🚨 {message}")
        elif level == 'ERROR':
            logger.error(f"❌ {message}")
        elif level == 'WARNING':
            logger.warning(f"⚠️  {message}")
        else:
            logger.info(f"ℹ️  {message}")

    def get_metrics(self):
        """Get current metrics"""
        return self.metrics.copy()

    def get_alerts(self):
        """Get current alerts"""
        return self.alerts.copy()

    def clear_alerts(self):
        """Clear alerts"""
        self.alerts = []


# Global monitor instance
flow_monitor = LeadFlowMonitor()



