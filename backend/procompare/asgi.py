"""
ASGI config for procompare project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/howto/deployment/asgi/
"""

import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from django.urls import path
import logging

logger = logging.getLogger(__name__)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.procompare.settings')

# Initialize Django first
django_asgi_app = get_asgi_application()

# Try to import WebSocket routing with fallback
websocket_urlpatterns = []

try:
    import backend.leads.routing
    websocket_urlpatterns.extend(backend.leads.routing.websocket_urlpatterns)
    logger.info("Successfully loaded leads WebSocket routing")
except Exception as e:
    logger.warning(f"Failed to load leads WebSocket routing: {e}")

try:
    import backend.users.routing
    websocket_urlpatterns.extend(backend.users.routing.websocket_urlpatterns)
    logger.info("Successfully loaded users WebSocket routing")
except Exception as e:
    logger.warning(f"Failed to load users WebSocket routing: {e}")

try:
    import backend.notifications.routing
    websocket_urlpatterns.extend(backend.notifications.routing.websocket_urlpatterns)
    logger.info("Successfully loaded notifications WebSocket routing")
except Exception as e:
    logger.warning(f"Failed to load notifications WebSocket routing: {e}")

try:
    import backend.chat.routing
    websocket_urlpatterns.extend(backend.chat.routing.websocket_urlpatterns)
    logger.info("Successfully loaded chat WebSocket routing")
except Exception as e:
    logger.warning(f"Failed to load chat WebSocket routing: {e}")

# Create application with fallback
if websocket_urlpatterns:
    application = ProtocolTypeRouter({
        "http": django_asgi_app,
        "websocket": AuthMiddlewareStack(
            URLRouter(websocket_urlpatterns)
        ),
    })
else:
    # Fallback: HTTP only if WebSocket routing fails
    logger.warning("No WebSocket routing available, running HTTP-only mode")
    application = django_asgi_app