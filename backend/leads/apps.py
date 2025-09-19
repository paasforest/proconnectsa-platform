from django.apps import AppConfig


class LeadsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'backend.leads'
    verbose_name = 'Leads'
    
    def ready(self):
        """Import signal handlers when the app is ready"""
        try:
            import backend.leads.signals  # noqa
        except ImportError:
            pass


