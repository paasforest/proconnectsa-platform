from django.apps import AppConfig


class PaymentsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'backend.payments'
    verbose_name = 'Payments'
    
    def ready(self):
        """Import signal handlers when the app is ready"""
        try:
            import backend.payments.signals  # noqa
        except ImportError:
            pass


