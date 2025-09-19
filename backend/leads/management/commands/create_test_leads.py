from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from backend.leads.models import Lead, ServiceCategory
from django.utils import timezone
from datetime import timedelta
import random

User = get_user_model()

class Command(BaseCommand):
    help = 'Create test leads for the wallet dashboard'

    def add_arguments(self, parser):
        parser.add_argument('--count', type=int, default=5, help='Number of test leads to create')

    def handle(self, *args, **options):
        count = options['count']
        
        # Get an existing client
        client = User.objects.filter(user_type='client').first()
        if not client:
            self.stdout.write(self.style.ERROR('No client users found. Please create a client user first.'))
            return
        
        # Get or create service categories
        categories = [
            ('Cleaning Services', 'cleaning'),
            ('Plumbing', 'plumbing'),
            ('Electrical', 'electrical'),
            ('Gardening', 'gardening'),
            ('Painting', 'painting')
        ]
        
        service_categories = []
        for name, slug in categories:
            cat, created = ServiceCategory.objects.get_or_create(
                slug=slug,
                defaults={'name': name, 'is_active': True}
            )
            service_categories.append(cat)
        
        # Sample lead data
        lead_templates = [
            {
                'title': 'House Cleaning Service Needed',
                'description': 'Looking for a reliable cleaning service for my 3-bedroom house. Need deep cleaning including kitchen and bathrooms.',
                'location_address': '123 Oak Street, Sandton',
                'location_suburb': 'Sandton',
                'location_city': 'Johannesburg',
                'budget_range': '1000_5000',
                'urgency': 'this_week',
                'service_category': service_categories[0]
            },
            {
                'title': 'Kitchen Plumbing Repair',
                'description': 'Kitchen sink is leaking and needs urgent repair. Water is dripping under the cabinet.',
                'location_address': '456 Pine Avenue, Cape Town',
                'location_suburb': 'Cape Town',
                'location_city': 'Cape Town',
                'budget_range': 'under_1000',
                'urgency': 'urgent',
                'service_category': service_categories[1]
            },
            {
                'title': 'Electrical Installation for New Room',
                'description': 'Need to install electrical outlets and lighting for a new home office. Room is already built, just needs wiring.',
                'location_address': '789 Maple Drive, Durban',
                'location_suburb': 'Durban',
                'location_city': 'Durban',
                'budget_range': '5000_15000',
                'urgency': 'this_month',
                'service_category': service_categories[2]
            },
            {
                'title': 'Garden Landscaping Project',
                'description': 'Want to redesign the front garden with native plants and a small water feature. Looking for creative ideas.',
                'location_address': '321 Elm Street, Pretoria',
                'location_suburb': 'Pretoria',
                'location_city': 'Pretoria',
                'budget_range': '15000_50000',
                'urgency': 'flexible',
                'service_category': service_categories[3]
            },
            {
                'title': 'Interior House Painting',
                'description': 'Need to paint the entire interior of my house. 4 bedrooms, living room, kitchen, and 2 bathrooms.',
                'location_address': '654 Cedar Lane, Port Elizabeth',
                'location_suburb': 'Port Elizabeth',
                'location_city': 'Port Elizabeth',
                'budget_range': '5000_15000',
                'urgency': 'this_month',
                'service_category': service_categories[4]
            }
        ]
        
        created_leads = []
        for i in range(count):
            template = random.choice(lead_templates)
            
            # Add some variation to make leads unique
            template_copy = template.copy()
            template_copy['title'] = f"{template['title']} #{i+1}"
            template_copy['description'] = f"{template['description']} This is test lead number {i+1}."
            
            # Set expiration date (1-7 days from now)
            expires_at = timezone.now() + timedelta(days=random.randint(1, 7))
            
            lead = Lead.objects.create(
                client=client,
                title=template_copy['title'],
                description=template_copy['description'],
                location_address=template_copy['location_address'],
                location_suburb=template_copy['location_suburb'],
                location_city=template_copy['location_city'],
                budget_range=template_copy['budget_range'],
                urgency=template_copy['urgency'],
                service_category=template_copy['service_category'],
                status='active',
                expires_at=expires_at,
                verification_score=random.randint(70, 95),
                is_sms_verified=True,
                max_providers=random.randint(2, 5)
            )
            
            created_leads.append(lead)
            self.stdout.write(f'Created lead: {lead.title}')
        
        self.stdout.write(
            self.style.SUCCESS(f'Successfully created {len(created_leads)} test leads')
        )
