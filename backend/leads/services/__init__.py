# Lead routing services
from .lead_router import route_lead, match_providers, notify_providers

# Re-export existing services from parent services.py to maintain backward compatibility
# We need to import from the parent directory's services.py file
import os
import sys
import importlib.util

# Get path to parent services.py
_current_dir = os.path.dirname(os.path.abspath(__file__))
_parent_dir = os.path.dirname(_current_dir)
_services_py = os.path.join(_parent_dir, 'services.py')

# Load services.py as a module
_spec = importlib.util.spec_from_file_location("_leads_services_module", _services_py)
_leads_services = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_leads_services)

# Re-export classes
LeadAssignmentService = _leads_services.LeadAssignmentService
LeadFilteringService = _leads_services.LeadFilteringService

__all__ = ['route_lead', 'match_providers', 'notify_providers', 'LeadAssignmentService', 'LeadFilteringService']
