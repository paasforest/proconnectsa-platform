from django.apps import AppConfig


class UsersConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'backend.users'
    verbose_name = 'Users'
    
    def ready(self):
        """Import signal handlers when the app is ready"""
        try:
            import backend.users.signals  # noqa
            import backend.users.monitoring_signals  # noqa - Real-time monitoring
        except ImportError:
            pass


