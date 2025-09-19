from django.apps import AppConfig


class ReviewsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'backend.reviews'
    verbose_name = 'Reviews'
    
    def ready(self):
        """Import signal handlers when the app is ready"""
        try:
            import backend.reviews.signals  # noqa
        except ImportError:
            pass


