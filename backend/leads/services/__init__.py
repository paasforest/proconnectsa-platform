# Lead routing services
from .lead_router import route_lead, match_providers, notify_providers
from .lead_auto_verifier import (
    auto_verify_lead,
    calculate_lead_verification_score,
    auto_verify_pending_leads,
    notify_admin_review_needed
)

# Re-export existing services from parent services.py to maintain backward compatibility
# Import using absolute import to avoid package context issues
import sys
import importlib

# Import the parent services module using absolute path
_parent_module = importlib.import_module('backend.leads.services')
# But wait, that would cause a circular import since we ARE backend.leads.services
# So we need to import it differently - use the file directly but with proper package context

# Alternative: Import from the parent package's services module
# Since we're in backend/leads/services/__init__.py, we need to import from backend.leads
# But the module is named 'services' which conflicts with our package name
# Solution: Import it with a different approach

# Use importlib to load the services.py file with proper package context
import os
import importlib.util

_current_file = __file__
_current_dir = os.path.dirname(os.path.abspath(_current_file))
_parent_dir = os.path.dirname(_current_dir)
_services_py_path = os.path.join(_parent_dir, 'services.py')

# Create a spec and load with proper package context
_spec = importlib.util.spec_from_file_location("backend.leads._services_module", _services_py_path)
_leads_services = importlib.util.module_from_spec(_spec)

# Set package context so relative imports work
_leads_services.__package__ = 'backend.leads'
_leads_services.__name__ = 'backend.leads._services_module'

# Now execute the module
_spec.loader.exec_module(_leads_services)

# Re-export classes
LeadAssignmentService = _leads_services.LeadAssignmentService
LeadFilteringService = _leads_services.LeadFilteringService

__all__ = [
    'route_lead', 'match_providers', 'notify_providers',
    'LeadAssignmentService', 'LeadFilteringService',
    'auto_verify_lead', 'calculate_lead_verification_score',
    'auto_verify_pending_leads', 'notify_admin_review_needed'
]
