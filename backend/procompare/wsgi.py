"""
WSGI config for ProCompare project.
"""

import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.procompare.settings')

application = get_wsgi_application()


