from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from backend.leads.models import Lead, ServiceCategory
from django.utils import timezone
from datetime import timedelta
import random
from faker import Faker

User = get_user_model()
fake = Faker()  # Use default locale (en_US) - we'll use custom SA data


class Command(BaseCommand):
    help = 'Create realistic seed leads using Faker to populate the platform'

    def add_arguments(self, parser):
        parser.add_argument(
            '--count',
            type=int,
            default=20,
            help='Number of seed leads to create (default: 20)'
        )

    def handle(self, *args, **options):
        count = options['count']
        
        self.stdout.write(self.style.WARNING(f'\n🌱 Creating {count} realistic seed leads...\n'))
        
        # Get or create a client user for seed leads
        client, created = User.objects.get_or_create(
            email='seed@proconnectsa.co.za',
            defaults={
                'first_name': 'Seed',
                'last_name': 'Client',
                'user_type': 'client',
                'is_active': True
            }
        )
        
        if created:
            self.stdout.write(f'✅ Created seed client user: {client.email}')
        else:
            self.stdout.write(f'✅ Using existing seed client: {client.email}')
        
        # Get active service categories
        service_categories = ServiceCategory.objects.filter(is_active=True)
        
        if not service_categories.exists():
            self.stdout.write(self.style.ERROR(
                '❌ No active service categories found. Please create service categories first.'
            ))
            return
        
        # South African cities and suburbs
        cities_data = [
            {'city': 'Cape Town', 'suburbs': ['Camps Bay', 'Sea Point', 'Rondebosch', 'Newlands', 'Constantia', 'Hout Bay', 'Green Point', 'Claremont']},
            {'city': 'Johannesburg', 'suburbs': ['Sandton', 'Rosebank', 'Parktown', 'Melrose', 'Illovo', 'Bryanston', 'Randburg', 'Midrand']},
            {'city': 'Durban', 'suburbs': ['Umhlanga', 'Ballito', 'Westville', 'Berea', 'Glenwood', 'Morningside', 'Florida Road']},
            {'city': 'Pretoria', 'suburbs': ['Hatfield', 'Brooklyn', 'Menlyn', 'Centurion', 'Waterkloof', 'Arcadia']},
            {'city': 'Port Elizabeth', 'suburbs': ['Summerstrand', 'Richmond Hill', 'Humbleton', 'Greenacres', 'Mill Park']},
            {'city': 'Bloemfontein', 'suburbs': ['Westdene', 'Fichardt Park', 'Bayswater', 'Langenhoven Park']},
        ]
        
        # Realistic lead templates with variety
        lead_templates = [
            {
                'title_patterns': [
                    'Need {service} service in {suburb}',
                    'Looking for {service} professional',
                    '{service} work required urgently',
                    'Require experienced {service} contractor',
                    '{service} installation needed'
                ],
                'description_patterns': [
                    'I need a qualified {service} professional to help with my project. Looking for someone reliable and experienced.',
                    'Seeking a professional {service} service provider. The work needs to be done to a high standard.',
                    'I require {service} services for my property. Please provide a detailed quote.',
                    'Looking for an experienced {service} contractor who can complete the work efficiently.',
                    'Need {service} work done. Property is located in {suburb}, {city}. Please contact me to discuss details.'
                ],
                'budget_ranges': ['1000_5000', '5000_15000', '15000_50000'],
                'urgencies': ['this_week', 'this_month', 'flexible']
            }
        ]
        
        # Service-specific descriptions
        service_descriptions = {
            'plumbing': [
                'Bathroom renovation requiring new plumbing installation. Need hot and cold water connections.',
                'Kitchen sink leaking and needs repair. Also need new tap installation.',
                'Burst pipe in the garden. Need urgent repair and possibly pipe replacement.',
                'Toilet not flushing properly. Need diagnosis and repair.',
                'Water heater not working. Need inspection and possible replacement.'
            ],
            'electrical': [
                'Need new electrical outlets installed in home office. Requires qualified electrician.',
                'Circuit breaker keeps tripping. Need diagnosis and repair.',
                'Rewiring required for older property. Full electrical upgrade needed.',
                'New lighting installation for living room and kitchen areas.',
                'Electrical fault finding and repair needed. Safety certificate required.'
            ],
            'cleaning': [
                'Deep cleaning required for 3-bedroom house. Move-in cleaning service needed.',
                'Regular weekly cleaning service for office space. Looking for reliable cleaner.',
                'End of tenancy cleaning required. Property needs thorough cleaning.',
                'Carpet cleaning and upholstery cleaning needed for residential property.',
                'Window cleaning and exterior cleaning service required.'
            ],
            'painting': [
                'Interior house painting required. 4 bedrooms, living room, and kitchen.',
                'Exterior house painting needed. Property needs fresh coat of paint.',
                'Room painting service. Need professional painter for bedroom renovation.',
                'Commercial painting required for office space.',
                'Deck and fence painting needed. Weather-resistant paint required.'
            ],
            'gardening': [
                'Garden landscaping and design needed. Want to redesign front and back garden.',
                'Regular garden maintenance service required. Weekly or bi-weekly service.',
                'Tree removal and pruning needed. Large tree needs professional removal.',
                'Lawn mowing and garden cleanup service required.',
                'Garden irrigation system installation needed.'
            ],
            'handyman': [
                'Various handyman tasks needed. Shelving installation, door repairs, and general maintenance.',
                'General repairs and maintenance work required around the house.',
                'Furniture assembly and mounting work needed.',
                'Multiple small jobs requiring experienced handyman.',
                'Home improvement tasks including painting touch-ups and minor repairs.'
            ],
        }
        
        created_leads = []
        
        # Prioritize common categories that providers typically offer
        common_categories = ['Plumbing', 'Electrical', 'Cleaning', 'Renovations', 'Painting', 'Handyman']
        common_category_objs = [cat for cat in service_categories if cat.name in common_categories]
        
        for i in range(count):
            # Prioritize Johannesburg (40% chance) since most providers are there
            # Then distribute across other cities
            if random.random() < 0.4:
                # Force Johannesburg
                city_data = next((c for c in cities_data if c['city'] == 'Johannesburg'), cities_data[0])
            else:
                city_data = random.choice(cities_data)
            city = city_data['city']
            suburb = random.choice(city_data['suburbs'])
            
            # Prioritize common categories (70% chance), otherwise random
            if common_category_objs and random.random() < 0.7:
                service_category = random.choice(common_category_objs)
            else:
                service_category = random.choice(list(service_categories))
            service_name = service_category.name.lower()
            
            # Generate realistic title
            title_patterns = [
                f'Need {service_category.name} service in {suburb}',
                f'Looking for {service_category.name} professional',
                f'{service_category.name} work required',
                f'Require experienced {service_category.name} contractor',
                f'{service_category.name} installation needed in {suburb}'
            ]
            title = random.choice(title_patterns)
            
            # Generate realistic description
            if service_name in service_descriptions:
                description = random.choice(service_descriptions[service_name])
            else:
                description = f'I need a qualified {service_category.name} professional to help with my project in {suburb}, {city}. Looking for someone reliable and experienced. Please provide a detailed quote.'
            
            # Add some variation to descriptions
            if random.random() > 0.5:
                description += f' Property is located in {suburb}, {city}.'
            
            # Generate realistic address
            street_number = fake.building_number()
            street_name = fake.street_name()
            location_address = f'{street_number} {street_name}, {suburb}, {city}'
            
            # Select budget and urgency
            budget_range = random.choice(['1000_5000', '5000_15000', '15000_50000', 'no_budget'])
            urgency = random.choice(['this_week', 'this_month', 'flexible'])
            
            # Set expiration (7-30 days from now)
            expires_at = timezone.now() + timedelta(days=random.randint(7, 30))
            
            # Create the lead
            lead = Lead.objects.create(
                client=client,
                service_category=service_category,
                title=title,
                description=description,
                location_address=location_address,
                location_suburb=suburb,
                location_city=city,
                latitude=None,  # Can be geocoded later if needed
                longitude=None,
                budget_range=budget_range,
                urgency=urgency,
                preferred_contact_time='Anytime',
                additional_requirements='',
                property_type=random.choice(['residential', 'commercial', 'residential', 'residential']),  # Mostly residential
                hiring_intent=random.choice(['ready_to_hire', 'planning_to_hire', 'comparing_quotes']),
                hiring_timeline=random.choice(['asap', 'this_month', 'next_month']),
                verification_score=random.randint(75, 95),  # High verification score
                is_sms_verified=True,  # Mark as verified
                status='verified',  # Ready for providers
                source='seed',  # Mark as seed lead
                is_available=True,
                max_providers=random.randint(3, 5),
                expires_at=expires_at
            )
            
            created_leads.append(lead)
            self.stdout.write(f'  ✅ Created: {lead.title} ({suburb}, {city})')
        
        self.stdout.write(self.style.SUCCESS(
            f'\n🎉 Successfully created {len(created_leads)} realistic seed leads!'
        ))
        self.stdout.write(f'   • All leads marked with source="seed"')
        self.stdout.write(f'   • All leads are verified and available to providers')
        self.stdout.write(f'   • Leads distributed across {len(cities_data)} cities')
        self.stdout.write(f'\n💡 These leads are visible to providers and make the platform look active.')
        self.stdout.write(f'   You can filter them later using source="seed" if needed.')
