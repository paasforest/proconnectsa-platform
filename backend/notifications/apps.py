from django.apps import AppConfig


class NotificationsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'backend.notifications'
    verbose_name = 'Notifications'
    
    def ready(self):
        """Import signal handlers when the app is ready"""
        try:
            import backend.notifications.signals  # noqa
        except ImportError:
            pass


