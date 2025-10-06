from django.apps import AppConfig


class LeadsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'backend.leads'
    
    def ready(self):
        """Import signals when Django starts"""
        import backend.leads.signals  # noqa
        
        # Auto-create service categories if they don't exist
        self.ensure_service_categories()
    
    def ensure_service_categories(self):
        """Create service categories automatically on app startup"""
        try:
            from backend.leads.models import ServiceCategory
            from django.utils.text import slugify
            
            # Only run if categories table exists and is empty
            if ServiceCategory.objects.count() == 0:
                categories = [
                    'Cleaning', 'Plumbing', 'Electrical', 'Handyman', 'Painting',
                    'Carpentry', 'Landscaping', 'Pest Control', 'Moving Services',
                    'HVAC', 'Roofing', 'Flooring', 'Tiling', 'Construction',
                    'Renovations', 'Farm Fencing'
                ]
                
                for name in categories:
                    ServiceCategory.objects.get_or_create(
                        slug=slugify(name),
                        defaults={
                            'name': name,
                            'description': f'{name} services',
                            'is_active': True
                        }
                    )
                
                print(f"✅ Auto-created {len(categories)} service categories on startup")
        except Exception as e:
            # Fail silently during migrations or if table doesn't exist yet
            pass