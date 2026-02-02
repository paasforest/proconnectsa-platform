from django.core.management.base import BaseCommand
from backend.users.models import ProviderProfile
from backend.leads.models import ServiceCategory


class Command(BaseCommand):
    help = "Fix providers with empty service categories by prompting or using default categories based on business name"

    def add_arguments(self, parser):
        parser.add_argument(
            '--auto-fix',
            action='store_true',
            help='Automatically assign categories based on business name keywords (default: False, will prompt)',
        )
        parser.add_argument(
            '--default-category',
            type=str,
            help='Assign a default category slug to all providers with empty categories',
        )
        parser.add_argument(
            '--list-only',
            action='store_true',
            help='Only list providers with empty categories, do not fix them',
        )

    def handle(self, *args, **options):
        # Find providers with empty categories
        empty_cat_providers = ProviderProfile.objects.filter(
            service_categories__isnull=True
        ) | ProviderProfile.objects.filter(service_categories=[])
        
        count = empty_cat_providers.count()
        
        if count == 0:
            self.stdout.write(self.style.SUCCESS("✅ No providers with empty categories found"))
            return
        
        self.stdout.write(self.style.WARNING(f"Found {count} provider(s) with empty service categories:"))
        
        for provider in empty_cat_providers:
            self.stdout.write(f"  - {provider.business_name} ({provider.user.email})")
            self.stdout.write(f"    Verified: {provider.verification_status}")
            self.stdout.write(f"    Created: {provider.created_at}")
        
        if options['list_only']:
            return
        
        # Get all available categories
        all_categories = {cat.slug: cat.name for cat in ServiceCategory.objects.filter(is_active=True)}
        self.stdout.write(f"\nAvailable categories: {', '.join(all_categories.keys())}")
        
        if options['default_category']:
            # Assign default category
            default_slug = options['default_category']
            if default_slug not in all_categories:
                self.stdout.write(self.style.ERROR(f"❌ Category '{default_slug}' not found"))
                return
            
            updated = 0
            for provider in empty_cat_providers:
                provider.service_categories = [default_slug]
                provider.save(update_fields=['service_categories'])
                updated += 1
                self.stdout.write(f"✅ Assigned '{default_slug}' to {provider.business_name}")
            
            self.stdout.write(self.style.SUCCESS(f"\n✅ Fixed {updated} provider(s) with default category '{default_slug}'"))
            return
        
        if options['auto_fix']:
            # Auto-fix based on business name keywords
            category_keywords = {
                'electrical': ['electrical', 'electric', 'electrician', 'wiring'],
                'plumbing': ['plumbing', 'plumber', 'pipe', 'drain'],
                'handyman': ['handyman', 'general', 'repair', 'maintenance'],
                'cleaning': ['cleaning', 'cleaner', 'clean'],
                'painting': ['painting', 'paint', 'painter'],
                'carpentry': ['carpentry', 'carpenter', 'wood', 'cabinet'],
                'construction': ['construction', 'builder', 'build'],
                'renovations': ['renovation', 'renovate', 'remodel'],
            }
            
            updated = 0
            for provider in empty_cat_providers:
                business_name_lower = (provider.business_name or '').lower()
                matched_categories = []
                
                for category_slug, keywords in category_keywords.items():
                    if category_slug in all_categories:
                        if any(keyword in business_name_lower for keyword in keywords):
                            matched_categories.append(category_slug)
                
                if matched_categories:
                    provider.service_categories = matched_categories[:3]  # Max 3 categories
                    provider.save(update_fields=['service_categories'])
                    updated += 1
                    self.stdout.write(f"✅ Auto-assigned {matched_categories} to {provider.business_name}")
                else:
                    # Default to handyman if no match
                    provider.service_categories = ['handyman']
                    provider.save(update_fields=['service_categories'])
                    updated += 1
                    self.stdout.write(f"✅ Auto-assigned ['handyman'] to {provider.business_name} (no keyword match)")
            
            self.stdout.write(self.style.SUCCESS(f"\n✅ Auto-fixed {updated} provider(s)"))
            return
        
        # Interactive mode - prompt user
        self.stdout.write(self.style.WARNING("\n⚠️  Run with --auto-fix to automatically assign categories based on business name"))
        self.stdout.write(self.style.WARNING("   OR use --default-category=handyman to assign a default category to all"))
