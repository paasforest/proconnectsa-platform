import hashlib
import logging
from django.conf import settings
from django.db import models
from django.utils import timezone
from datetime import timedelta

logger = logging.getLogger(__name__)

class ABTestGroup(models.Model):
    """Track which users are in which test groups"""
    user_id = models.CharField(max_length=100)
    test_name = models.CharField(max_length=100)
    group = models.CharField(max_length=50)  # 'control', 'treatment_a', etc.
    assigned_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('user_id', 'test_name')
        db_table = 'ab_test_groups'
    
    def __str__(self):
        return f"{self.user_id} - {self.test_name} - {self.group}"

class ABTestResult(models.Model):
    """Track test results and conversions"""
    user_id = models.CharField(max_length=100)
    test_name = models.CharField(max_length=100)
    group = models.CharField(max_length=50)
    event_type = models.CharField(max_length=100)  # 'lead_view', 'credit_purchase', 'job_completion'
    event_value = models.FloatField(null=True, blank=True)  # Revenue, score, etc.
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'ab_test_results'
        indexes = [
            models.Index(fields=['test_name', 'group', 'event_type']),
            models.Index(fields=['user_id', 'test_name']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"{self.user_id} - {self.event_type} - {self.event_value}"

class ABTestFramework:
    """Framework for testing ML vs rule-based systems"""
    
    ACTIVE_TESTS = {
        'lead_scoring_ml_vs_rules': {
            'name': 'ML vs Rule-based Lead Scoring',
            'groups': {
                'control': 0.8,  # 80% get rule-based
                'ml_treatment': 0.2  # 20% get ML
            },
            'min_data_required': 100,  # Reduced for early testing
            'active': True
        },
        'dynamic_pricing_test': {
            'name': 'Dynamic vs Fixed Credit Pricing',
            'groups': {
                'fixed_pricing': 0.7,
                'dynamic_pricing': 0.3
            },
            'min_data_required': 50,
            'active': False  # Enable when ready
        },
        'lead_allocation_test': {
            'name': 'Enhanced vs Basic Lead Allocation',
            'groups': {
                'basic_allocation': 0.6,
                'enhanced_allocation': 0.4
            },
            'min_data_required': 200,
            'active': False  # Enable when ready
        }
    }
    
    @classmethod
    def assign_user_to_group(cls, user_id, test_name):
        """Consistently assign user to test group based on hash"""
        if test_name not in cls.ACTIVE_TESTS:
            return 'control'
        
        test_config = cls.ACTIVE_TESTS[test_name]
        if not test_config.get('active', False):
            return 'control'
        
        # Check if we have enough data to run the test
        if not cls._has_sufficient_data(test_name):
            return 'control'
        
        # Check if user already assigned
        existing = ABTestGroup.objects.filter(user_id=user_id, test_name=test_name).first()
        if existing:
            return existing.group
        
        # Assign based on consistent hash
        hash_input = f"{user_id}_{test_name}_{settings.SECRET_KEY[:10]}"
        hash_value = int(hashlib.md5(hash_input.encode()).hexdigest(), 16)
        random_value = (hash_value % 100) / 100.0
        
        # Determine group based on cumulative probabilities
        cumulative = 0
        groups = test_config['groups']
        
        for group, probability in groups.items():
            cumulative += probability
            if random_value <= cumulative:
                # Save assignment
                ABTestGroup.objects.create(
                    user_id=user_id,
                    test_name=test_name,
                    group=group
                )
                logger.info(f"User {user_id} assigned to {group} group for test {test_name}")
                return group
        
        return 'control'  # Fallback
    
    @classmethod
    def _has_sufficient_data(cls, test_name):
        """Check if we have enough data to run meaningful tests"""
        from .models import Lead
        from backend.users.models import User
        
        test_config = cls.ACTIVE_TESTS.get(test_name, {})
        min_required = test_config.get('min_data_required', 100)
        
        if test_name == 'lead_scoring_ml_vs_rules':
            current_leads = Lead.objects.count()
            return current_leads >= min_required
        elif test_name == 'dynamic_pricing_test':
            from backend.payments.models import Transaction
            transactions = Transaction.objects.filter(
                transaction_type='lead_purchase'
            ).count()
            return transactions >= min_required
        elif test_name == 'lead_allocation_test':
            assignments = LeadAssignment.objects.count()
            return assignments >= min_required
        
        return False
    
    @classmethod
    def should_use_ml_for_user(cls, user_id):
        """Determine if specific user should get ML treatment"""
        group = cls.assign_user_to_group(user_id, 'lead_scoring_ml_vs_rules')
        return group == 'ml_treatment'
    
    @classmethod
    def should_use_dynamic_pricing(cls, user_id):
        """Determine if user should get dynamic pricing"""
        group = cls.assign_user_to_group(user_id, 'dynamic_pricing_test')
        return group == 'dynamic_pricing'
    
    @classmethod
    def should_use_enhanced_allocation(cls, user_id):
        """Determine if user should get enhanced lead allocation"""
        group = cls.assign_user_to_group(user_id, 'lead_allocation_test')
        return group == 'enhanced_allocation'
    
    @classmethod
    def track_event(cls, user_id, test_name, event_type, event_value=None):
        """Track conversion events for analysis"""
        try:
            group_obj = ABTestGroup.objects.filter(user_id=user_id, test_name=test_name).first()
            if not group_obj:
                return  # User not in test
            
            ABTestResult.objects.create(
                user_id=user_id,
                test_name=test_name,
                group=group_obj.group,
                event_type=event_type,
                event_value=event_value
            )
            
            logger.debug(f"Tracked event: {user_id} - {event_type} - {event_value}")
            
        except Exception as e:
            logger.error(f"Error tracking AB test event: {e}")
    
    @classmethod
    def get_test_results(cls, test_name, days_back=30):
        """Get test results for analysis"""
        cutoff_date = timezone.now() - timedelta(days=days_back)
        
        results = ABTestResult.objects.filter(
            test_name=test_name,
            created_at__gte=cutoff_date
        ).values('group', 'event_type').annotate(
            count=models.Count('id'),
            avg_value=models.Avg('event_value'),
            unique_users=models.Count('user_id', distinct=True)
        )
        
        # Group by test group
        grouped_results = {}
        for result in results:
            group = result['group']
            if group not in grouped_results:
                grouped_results[group] = {}
            
            grouped_results[group][result['event_type']] = {
                'count': result['count'],
                'avg_value': result['avg_value'],
                'unique_users': result['unique_users']
            }
        
        # Calculate conversion rates
        analysis = cls._analyze_conversion_rates(grouped_results)
        
        return {
            'raw_data': grouped_results,
            'analysis': analysis,
            'test_config': cls.ACTIVE_TESTS.get(test_name, {}),
            'days_analyzed': days_back
        }
    
    @classmethod
    def _analyze_conversion_rates(cls, grouped_results):
        """Calculate key conversion metrics"""
        analysis = {}
        
        for group, events in grouped_results.items():
            lead_views = events.get('lead_view', {}).get('count', 0)
            credit_purchases = events.get('credit_purchase', {}).get('count', 0)
            job_completions = events.get('job_completion', {}).get('count', 0)
            
            analysis[group] = {
                'lead_view_to_purchase_rate': (credit_purchases / lead_views * 100) if lead_views > 0 else 0,
                'purchase_to_completion_rate': (job_completions / credit_purchases * 100) if credit_purchases > 0 else 0,
                'overall_conversion_rate': (job_completions / lead_views * 100) if lead_views > 0 else 0,
                'total_revenue': events.get('credit_purchase', {}).get('avg_value', 0) * credit_purchases,
                'avg_lead_quality': events.get('lead_quality_score', {}).get('avg_value', 0)
            }
        
        return analysis
    
    @classmethod
    def get_user_test_groups(cls, user_id):
        """Get all test groups for a specific user"""
        groups = ABTestGroup.objects.filter(user_id=user_id).values('test_name', 'group')
        return {group['test_name']: group['group'] for group in groups}
    
    @classmethod
    def is_test_active(cls, test_name):
        """Check if a specific test is currently active"""
        return cls.ACTIVE_TESTS.get(test_name, {}).get('active', False)

# Enhanced Lead Scorer with A/B Testing
class EnhancedLeadScorer:
    """Lead scorer enhanced with A/B testing"""
    
    def __init__(self):
        from .hybrid_scoring import HybridLeadScorer
        self.hybrid_scorer = HybridLeadScorer()
    
    def get_lead_score(self, lead, user_id):
        """Get score with A/B testing logic"""
        # Track that user viewed a lead
        ABTestFramework.track_event(user_id, 'lead_scoring_ml_vs_rules', 'lead_view')
        
        # Determine scoring method based on test group
        if ABTestFramework.should_use_ml_for_user(user_id):
            # Force ML scoring for this user
            score = self.hybrid_scorer.get_lead_quality_score(lead)
            logger.info(f"User {user_id} in ML test group, score: {score}")
        else:
            # Force rule-based scoring
            score = self.hybrid_scorer._rule_based_quality_score(lead)
            logger.info(f"User {user_id} in control group, rule-based score: {score}")
        
        # Track the quality score
        ABTestFramework.track_event(
            user_id, 
            'lead_scoring_ml_vs_rules', 
            'lead_quality_score', 
            score
        )
        
        return score
    
    def get_credit_price(self, lead, provider, user_id=None):
        """Get credit price with A/B testing"""
        if user_id and ABTestFramework.should_use_dynamic_pricing(user_id):
            # Use dynamic pricing
            price = self.hybrid_scorer.get_credit_price(lead, provider)
            logger.info(f"User {user_id} in dynamic pricing group, price: {price}")
        else:
            # Use fixed pricing
            price = self.hybrid_scorer._rule_based_credit_calculation(lead, provider)
            logger.info(f"User {user_id} in fixed pricing group, price: {price}")
        
        return price
    
    def track_credit_purchase(self, user_id, credits_spent, amount_paid):
        """Track when user purchases credits"""
        ABTestFramework.track_event(
            user_id, 
            'lead_scoring_ml_vs_rules', 
            'credit_purchase', 
            amount_paid
        )
        ABTestFramework.track_event(
            user_id,
            'dynamic_pricing_test',
            'credit_purchase',
            amount_paid
        )
    
    def track_job_completion(self, user_id, job_value=None):
        """Track successful job completion"""
        ABTestFramework.track_event(
            user_id,
            'lead_scoring_ml_vs_rules',
            'job_completion',
            job_value
        )
    
    def track_lead_assignment(self, user_id, lead_id, assignment_quality=None):
        """Track lead assignment with quality metrics"""
        ABTestFramework.track_event(
            user_id,
            'lead_allocation_test',
            'lead_assigned',
            assignment_quality
        )



