from django.apps import AppConfig


class LeadsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'backend.leads'
    
    def ready(self):
        """Import signals when Django starts"""
        import backend.leads.signals  # noqa
