"""
Django management command to train provider behavior ML models
"""

from django.core.management.base import BaseCommand
from django.utils import timezone
from backend.leads.provider_behavior_ml import ProviderBehaviorML
from backend.leads.provider_behavior_tasks import (
    train_provider_behavior_ml_model,
    analyze_provider_risk_scores,
    update_provider_quality_scores,
    generate_provider_behavior_insights
)

class Command(BaseCommand):
    help = 'Train provider behavior ML models and generate insights'

    def add_arguments(self, parser):
        parser.add_argument(
            '--action',
            type=str,
            choices=['train', 'analyze', 'update', 'insights', 'all'],
            default='all',
            help='Action to perform (default: all)'
        )
        parser.add_argument(
            '--days',
            type=int,
            default=90,
            help='Number of days of data to use for training (default: 90)'
        )
        parser.add_argument(
            '--async',
            action='store_true',
            help='Run tasks asynchronously using Celery'
        )

    def handle(self, *args, **options):
        action = options['action']
        days = options['days']
        use_async = options['async']
        
        self.stdout.write(
            self.style.SUCCESS(f'🤖 Starting Provider Behavior ML Training - Action: {action}')
        )
        
        if action in ['train', 'all']:
            self.train_models(days, use_async)
        
        if action in ['analyze', 'all']:
            self.analyze_risks(use_async)
        
        if action in ['update', 'all']:
            self.update_scores(use_async)
        
        if action in ['insights', 'all']:
            self.generate_insights(use_async)
        
        self.stdout.write(
            self.style.SUCCESS('✅ Provider Behavior ML training completed!')
        )

    def train_models(self, days, use_async):
        """Train provider behavior ML models"""
        self.stdout.write('\n🧠 Training Provider Behavior ML Models...')
        
        if use_async:
            # Run asynchronously using Celery
            task = train_provider_behavior_ml_model.delay()
            self.stdout.write(f'   📋 Task queued: {task.id}')
            self.stdout.write('   ⏳ Check Celery logs for progress')
        else:
            # Run synchronously
            ml_service = ProviderBehaviorML()
            result = ml_service.train_all_models(days_back=days)
            
            if 'error' in result:
                self.stdout.write(
                    self.style.ERROR(f'   ❌ Training failed: {result["error"]}')
                )
            else:
                self.stdout.write(f'   ✅ Models trained successfully!')
                self.stdout.write(f'   📊 Samples used: {result["samples_used"]}')
                self.stdout.write(
                    f'   🎯 Follow-through accuracy: {result["follow_through_model"]["accuracy"]:.3f}'
                )
                self.stdout.write(
                    f'   🏆 Quality accuracy: {result["quality_model"]["accuracy"]:.3f}'
                )

    def analyze_risks(self, use_async):
        """Analyze provider risk scores"""
        self.stdout.write('\n🔍 Analyzing Provider Risk Scores...')
        
        if use_async:
            task = analyze_provider_risk_scores.delay()
            self.stdout.write(f'   📋 Task queued: {task.id}')
            self.stdout.write('   ⏳ Check Celery logs for progress')
        else:
            ml_service = ProviderBehaviorML()
            ml_service.load_models()
            
            if not ml_service.is_trained:
                self.stdout.write(
                    self.style.WARNING('   ⚠️  Models not trained - skipping risk analysis')
                )
                return
            
            problematic_providers = ml_service.get_problematic_providers(
                min_assignments=3,
                risk_threshold=60.0
            )
            
            self.stdout.write(f'   📊 Total providers analyzed: {len(problematic_providers)}')
            
            high_risk = [p for p in problematic_providers if p['risk_score'] >= 80]
            if high_risk:
                self.stdout.write(
                    self.style.WARNING(f'   🚨 High-risk providers: {len(high_risk)}')
                )
                for provider in high_risk[:3]:
                    self.stdout.write(
                        f'      - {provider["provider_email"]}: '
                        f'{provider["risk_score"]:.1f}% risk, '
                        f'{provider["follow_through_rate"]:.1f}% follow-through'
                    )
            else:
                self.stdout.write('   ✅ No high-risk providers detected')

    def update_scores(self, use_async):
        """Update provider quality scores"""
        self.stdout.write('\n📈 Updating Provider Quality Scores...')
        
        if use_async:
            task = update_provider_quality_scores.delay()
            self.stdout.write(f'   📋 Task queued: {task.id}')
            self.stdout.write('   ⏳ Check Celery logs for progress')
        else:
            from backend.leads.provider_behavior_ml import ProviderBehaviorML
            from django.contrib.auth import get_user_model
            from backend.users.models import ProviderProfile
            
            User = get_user_model()
            
            ml_service = ProviderBehaviorML()
            ml_service.load_models()
            
            if not ml_service.is_trained:
                self.stdout.write(
                    self.style.WARNING('   ⚠️  Models not trained - skipping score updates')
                )
                return
            
            providers = User.objects.filter(
                user_type='provider'
            ).select_related('provider_profile')
            
            updated_count = 0
            
            for provider in providers:
                try:
                    prediction = ml_service.predict_provider_risk(str(provider.id))
                    
                    if 'error' not in prediction and provider.provider_profile:
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
                    self.stdout.write(
                        self.style.WARNING(f'   ⚠️  Failed to update {provider.email}: {str(e)}')
                    )
                    continue
            
            self.stdout.write(f'   ✅ Updated ML scores for {updated_count} providers')

    def generate_insights(self, use_async):
        """Generate provider behavior insights"""
        self.stdout.write('\n💡 Generating Provider Behavior Insights...')
        
        if use_async:
            task = generate_provider_behavior_insights.delay()
            self.stdout.write(f'   📋 Task queued: {task.id}')
            self.stdout.write('   ⏳ Check Celery logs for progress')
        else:
            ml_service = ProviderBehaviorML()
            ml_service.load_models()
            
            if not ml_service.is_trained:
                self.stdout.write(
                    self.style.WARNING('   ⚠️  Models not trained - skipping insights')
                )
                return
            
            recent_data = ml_service.collect_provider_behavior_data(days_back=30)
            
            if len(recent_data) == 0:
                self.stdout.write(
                    self.style.WARNING('   ⚠️  No recent provider data available')
                )
                return
            
            insights = {
                'total_active_providers': len(recent_data),
                'avg_follow_through_rate': recent_data['follow_through_rate'].mean(),
                'avg_abandonment_rate': recent_data['abandonment_rate'].mean(),
                'avg_quality_score': recent_data['quality_score'].mean(),
                'high_risk_providers_count': len(recent_data[recent_data['abandonment_rate'] > 50]),
                'top_performers_count': len(recent_data[recent_data['follow_through_rate'] > 80]),
            }
            
            self.stdout.write(f'   📊 Active providers: {insights["total_active_providers"]}')
            self.stdout.write(f'   📈 Avg follow-through: {insights["avg_follow_through_rate"]:.1f}%')
            self.stdout.write(f'   📉 Avg abandonment: {insights["avg_abandonment_rate"]:.1f}%')
            self.stdout.write(f'   🏆 Avg quality score: {insights["avg_quality_score"]:.1f}')
            self.stdout.write(f'   🚨 High-risk providers: {insights["high_risk_providers_count"]}')
            self.stdout.write(f'   ⭐ Top performers: {insights["top_performers_count"]}')
            
            # Generate recommendations
            recommendations = []
            
            if insights['avg_abandonment_rate'] > 40:
                recommendations.append('Consider implementing unlock cooldown periods')
            
            if insights['avg_follow_through_rate'] < 50:
                recommendations.append('Send reminder notifications for unused unlocks')
            
            if insights['high_risk_providers_count'] > len(recent_data) * 0.2:
                recommendations.append('Review provider onboarding processes')
            
            if recommendations:
                self.stdout.write('\n   💡 Recommendations:')
                for rec in recommendations:
                    self.stdout.write(f'      - {rec}')
            else:
                self.stdout.write('\n   ✅ No specific recommendations needed')
