"""
Django management command to load test data
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from leads.models import Lead, ServiceCategory, LeadAssignment
from users.models import User, ProviderProfile, Wallet
from leads.ml_services import DynamicPricingMLService
from datetime import datetime, timedelta
from decimal import Decimal

User = get_user_model()

class Command(BaseCommand):
    help = 'Load test data for the ProCompare platform'

    def handle(self, *args, **options):
        self.stdout.write("🚀 Loading test data for ProCompare platform...")
        
        # Create service categories
        self.stdout.write("\n1. Creating service categories...")
        categories = self.create_service_categories()
        
        # Create test providers
        self.stdout.write("\n2. Creating test providers...")
        providers = self.create_test_providers()
        
        # Create test leads
        self.stdout.write("\n3. Creating test leads...")
        leads = self.create_test_leads()
        
        # Test ML pricing
        self.stdout.write("\n4. Testing ML pricing system...")
        self.test_ml_pricing()
        
        self.stdout.write(
            self.style.SUCCESS(
                f"\n✅ Test data loaded successfully!\n"
                f"   - {len(categories)} service categories\n"
                f"   - {len(providers)} providers\n"
                f"   - {len(leads)} leads\n"
                f"\n🌐 Django server should be running at: http://localhost:8000\n"
                f"   - Admin: http://localhost:8000/admin (admin/admin123)\n"
                f"   - API: http://localhost:8000/api/"
            )
        )

    def create_service_categories(self):
        """Create service categories"""
        categories = [
            {'name': 'Cleaning Services', 'slug': 'cleaning', 'description': 'House and office cleaning services'},
            {'name': 'Plumbing', 'slug': 'plumbing', 'description': 'Plumbing repairs and installations'},
            {'name': 'Electrical', 'slug': 'electrical', 'description': 'Electrical work and repairs'},
            {'name': 'Handyman', 'slug': 'handyman', 'description': 'General handyman services'},
            {'name': 'Painting', 'slug': 'painting', 'description': 'Interior and exterior painting'},
            {'name': 'Landscaping', 'slug': 'landscaping', 'description': 'Garden and landscaping services'},
            {'name': 'Building & Construction', 'slug': 'building', 'description': 'Construction and building work'},
        ]
        
        created_categories = []
        for cat_data in categories:
            category, created = ServiceCategory.objects.get_or_create(
                slug=cat_data['slug'],
                defaults=cat_data
            )
            created_categories.append(category)
            self.stdout.write(f"{'Created' if created else 'Found'} category: {category.name}")
        
        return created_categories

    def create_test_providers(self):
        """Create test providers with different subscription tiers"""
        providers = [
            {
                'username': 'john_cleaner',
                'email': 'john@cleanpro.co.za',
                'first_name': 'John',
                'last_name': 'Smith',
                'phone': '+27821234567',
                'city': 'Cape Town',
                'suburb': 'Sea Point',
                'business_name': 'Clean Pro Services',
                'subscription_tier': 'basic',
                'service_categories': ['cleaning'],
                'service_areas': ['Cape Town', 'Sea Point', 'Green Point'],
            },
            {
                'username': 'sarah_electric',
                'email': 'sarah@electricfix.co.za',
                'first_name': 'Sarah',
                'last_name': 'Johnson',
                'phone': '+27831234567',
                'city': 'Cape Town',
                'suburb': 'Claremont',
                'business_name': 'Electric Fix Solutions',
                'subscription_tier': 'pro',
                'service_categories': ['electrical'],
                'service_areas': ['Cape Town', 'Claremont', 'Rondebosch', 'Newlands'],
            },
            {
                'username': 'mike_plumber',
                'email': 'mike@plumbpro.co.za',
                'first_name': 'Mike',
                'last_name': 'Wilson',
                'phone': '+27841234567',
                'city': 'Cape Town',
                'suburb': 'Observatory',
                'business_name': 'Plumb Pro',
                'subscription_tier': 'advanced',
                'service_categories': ['plumbing'],
                'service_areas': ['Cape Town', 'Observatory', 'Mowbray', 'Woodstock'],
            },
            {
                'username': 'lisa_handyman',
                'email': 'lisa@fixitall.co.za',
                'first_name': 'Lisa',
                'last_name': 'Brown',
                'phone': '+27851234567',
                'city': 'Cape Town',
                'suburb': 'Constantia',
                'business_name': 'Fix It All',
                'subscription_tier': 'enterprise',
                'service_categories': ['handyman', 'painting'],
                'service_areas': ['Cape Town', 'Constantia', 'Wynberg', 'Bishopscourt'],
            }
        ]
        
        created_providers = []
        for provider_data in providers:
            # Create user
            user, created = User.objects.get_or_create(
                username=provider_data['username'],
                defaults={
                    'email': provider_data['email'],
                    'first_name': provider_data['first_name'],
                    'last_name': provider_data['last_name'],
                    'phone': provider_data['phone'],
                    'city': provider_data['city'],
                    'suburb': provider_data['suburb'],
                    'user_type': 'provider',
                    'is_phone_verified': True,
                    'is_email_verified': True,
                }
            )
            
            if created:
                user.set_password('testpass123')
                user.save()
            
            # Create provider profile
            profile, profile_created = ProviderProfile.objects.get_or_create(
                user=user,
                defaults={
                    'business_name': provider_data['business_name'],
                    'business_address': f"123 Main St, {provider_data['suburb']}, Cape Town",
                    'service_areas': provider_data['service_areas'],
                    'service_categories': provider_data['service_categories'],
                    'subscription_tier': provider_data['subscription_tier'],
                    'verification_status': 'verified',
                    'subscription_start_date': datetime.now(),
                    'subscription_end_date': datetime.now() + timedelta(days=30),
                    'credit_balance': 10,  # Give them some credits
                    'average_rating': 4.5,
                    'total_reviews': 25,
                    'response_time_hours': 2.5,
                    'job_completion_rate': Decimal('95.5'),
                    'years_experience': 5,
                    'bio': f"Professional {provider_data['service_categories'][0]} services with {5} years experience",
                }
            )
            
            # Create wallet
            wallet, wallet_created = Wallet.objects.get_or_create(
                user=user,
                defaults={
                    'credits': 10,
                    'balance': Decimal('500.00'),  # R500 = 10 credits
                }
            )
            
            created_providers.append(user)
            self.stdout.write(f"{'Created' if created else 'Found'} provider: {user.get_full_name()} ({profile.subscription_tier})")
        
        return created_providers

    def create_test_leads(self):
        """Create test leads with different characteristics"""
        categories = ServiceCategory.objects.all()
        if not categories.exists():
            self.stdout.write("No service categories found. Creating them first...")
            categories = self.create_service_categories()
        
        # Create a test client
        client, created = User.objects.get_or_create(
            username='test_client',
            defaults={
                'email': 'client@example.com',
                'first_name': 'Test',
                'last_name': 'Client',
                'phone': '+27861234567',
                'city': 'Cape Town',
                'suburb': 'Sea Point',
                'user_type': 'client',
                'is_phone_verified': True,
                'is_email_verified': True,
            }
        )
        
        if created:
            client.set_password('testpass123')
            client.save()
        
        leads_data = [
            {
                'title': 'Urgent House Cleaning Needed - 5 Bedroom House',
                'description': 'Need immediate cleaning for a 5-bedroom house in Sea Point. Moving out this weekend and need everything spotless. Prefer eco-friendly products.',
                'category_slug': 'cleaning',
                'location_address': '45 Beach Road, Sea Point, Cape Town',
                'location_suburb': 'Sea Point',
                'location_city': 'Cape Town',
                'budget_range': '1000_5000',
                'urgency': 'urgent',
                'hiring_intent': 'ready_to_hire',
                'hiring_timeline': 'asap',
                'verification_score': 85,
                'is_sms_verified': True,
            },
            {
                'title': 'Electrical Panel Upgrade - Commercial Building',
                'description': 'Need to upgrade electrical panel in commercial building. Must be certified electrician. Project starts next month.',
                'category_slug': 'electrical',
                'location_address': '123 Main Street, Claremont, Cape Town',
                'location_suburb': 'Claremont',
                'location_city': 'Cape Town',
                'budget_range': '15000_50000',
                'urgency': 'this_month',
                'hiring_intent': 'planning_to_hire',
                'hiring_timeline': 'next_month',
                'verification_score': 92,
                'is_sms_verified': True,
            },
            {
                'title': 'Bathroom Renovation - Plumbing Work',
                'description': 'Complete bathroom renovation including new plumbing, fixtures, and tiling. Looking for experienced plumber.',
                'category_slug': 'plumbing',
                'location_address': '78 Oak Avenue, Observatory, Cape Town',
                'location_suburb': 'Observatory',
                'location_city': 'Cape Town',
                'budget_range': '5000_15000',
                'urgency': 'this_week',
                'hiring_intent': 'ready_to_hire',
                'hiring_timeline': 'this_month',
                'verification_score': 78,
                'is_sms_verified': False,
            },
            {
                'title': 'Garden Landscaping - Large Property',
                'description': 'Need complete garden landscaping for large property in Constantia. Includes lawn, plants, irrigation system.',
                'category_slug': 'landscaping',
                'location_address': '456 Pine Street, Constantia, Cape Town',
                'location_suburb': 'Constantia',
                'location_city': 'Cape Town',
                'budget_range': 'over_50000',
                'urgency': 'flexible',
                'hiring_intent': 'researching',
                'hiring_timeline': 'flexible',
                'verification_score': 65,
                'is_sms_verified': True,
            },
            {
                'title': 'Handyman Services - Multiple Small Jobs',
                'description': 'Need handyman for various small jobs around the house: fixing doors, hanging pictures, small repairs.',
                'category_slug': 'handyman',
                'location_address': '789 Cedar Road, Wynberg, Cape Town',
                'location_suburb': 'Wynberg',
                'location_city': 'Cape Town',
                'budget_range': '1000_5000',
                'urgency': 'this_week',
                'hiring_intent': 'comparing_quotes',
                'hiring_timeline': 'this_month',
                'verification_score': 70,
                'is_sms_verified': True,
            }
        ]
        
        created_leads = []
        for lead_data in leads_data:
            category = ServiceCategory.objects.get(slug=lead_data['category_slug'])
            
            lead = Lead.objects.create(
                client=client,
                service_category=category,
                title=lead_data['title'],
                description=lead_data['description'],
                location_address=lead_data['location_address'],
                location_suburb=lead_data['location_suburb'],
                location_city=lead_data['location_city'],
                budget_range=lead_data['budget_range'],
                urgency=lead_data['urgency'],
                hiring_intent=lead_data['hiring_intent'],
                hiring_timeline=lead_data['hiring_timeline'],
                verification_score=lead_data['verification_score'],
                is_sms_verified=lead_data['is_sms_verified'],
                status='verified',
                max_providers=3,
                is_available=True,
            )
            
            created_leads.append(lead)
            self.stdout.write(f"Created lead: {lead.title} (R{lead.verification_score} quality score)")
        
        return created_leads

    def test_ml_pricing(self):
        """Test the ML pricing system"""
        self.stdout.write("\n=== Testing ML Pricing System ===")
        
        leads = Lead.objects.filter(status='verified')[:3]
        providers = User.objects.filter(user_type='provider')[:2]
        
        pricing_service = DynamicPricingMLService()
        
        for lead in leads:
            self.stdout.write(f"\nLead: {lead.title}")
            self.stdout.write(f"Quality Score: {lead.verification_score}")
            self.stdout.write(f"Urgency: {lead.urgency}")
            self.stdout.write(f"Budget: {lead.get_budget_display_range()}")
            
            for provider in providers:
                pricing = pricing_service.calculate_dynamic_lead_price(lead, provider)
                self.stdout.write(f"  Provider: {provider.get_full_name()}")
                self.stdout.write(f"  Price: R{pricing['price']} ({pricing['credits']:.1f} credits)")
                self.stdout.write(f"  Reasoning: {pricing['reasoning']}")



