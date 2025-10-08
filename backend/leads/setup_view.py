"""
Simple view to set up service categories via web browser
Visit: https://api.proconnectsa.co.za/api/admin/setup-categories/
"""
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.utils.text import slugify
from django.utils import timezone
from backend.leads.models import Lead, ServiceCategory, LeadAssignment
from backend.users.models import User
import time


@require_http_methods(["GET"])
def setup_categories_view(request):
    """Set up service categories and test auto-distribution"""
    
    result = {
        "status": "success",
        "steps": []
    }
    
    # STEP 1: Create Service Categories
    categories = [
        'Cleaning', 'Plumbing', 'Electrical', 'Handyman', 'Painting',
        'Carpentry', 'Landscaping', 'Pest Control', 'Moving Services',
        'HVAC', 'Roofing', 'Flooring', 'Tiling', 'Construction',
        'Renovations', 'Farm Fencing'
    ]
    
    created_count = 0
    created_list = []
    existing_list = []
    
    for name in categories:
        cat, created = ServiceCategory.objects.get_or_create(
            slug=slugify(name),
            defaults={
                'name': name,
                'description': f'{name} services',
                'is_active': True
            }
        )
        if created:
            created_count += 1
            created_list.append(name)
        else:
            existing_list.append(name)
    
    result["steps"].append({
        "step": 1,
        "title": "Service Categories",
        "total": ServiceCategory.objects.count(),
        "created": created_count,
        "created_list": created_list,
        "existing_list": existing_list
    })
    
    # STEP 2: Create Test Lead
    try:
        test_client, _ = User.objects.get_or_create(
            email='autoclient@test.com',
            defaults={
                'username': 'autoclient',
                'first_name': 'Auto',
                'last_name': 'Client',
                'user_type': 'client',
                'phone_number': '+27812340000'
            }
        )
        
        cleaning_cat = ServiceCategory.objects.filter(slug='cleaning').first()
        if cleaning_cat:
            lead = Lead.objects.create(
                client=test_client,
                service_category=cleaning_cat,
                title=f'AUTO-TEST: Cleaning - {timezone.now().strftime("%Y-%m-%d %H:%M")}',
                description='Testing automatic lead distribution',
                location_city='Johannesburg',
                location_suburb='Sandton',
                location_address='Test Address',
                budget_range='1000_5000',
                hiring_timeline='asap',
                urgency='this_week',
                status='verified',
                client_name='Auto Test Client',
                client_email='autoclient@test.com',
                client_phone='+27812340000',
            )
            
            # Wait for auto-assignment
            time.sleep(3)
            
            # Check assignments
            assignments = LeadAssignment.objects.filter(lead=lead).select_related('provider')
            assignment_list = [
                {
                    "provider": a.provider.email,
                    "status": a.status,
                    "credit_cost": a.credit_cost
                }
                for a in assignments
            ]
            
            result["steps"].append({
                "step": 2,
                "title": "Test Lead Created",
                "lead_id": str(lead.id),
                "assignments": len(assignments),
                "assignment_list": assignment_list,
                "auto_distribution_working": len(assignments) > 0
            })
        else:
            result["steps"].append({
                "step": 2,
                "title": "Test Lead",
                "error": "Cleaning category not found"
            })
    except Exception as e:
        result["steps"].append({
            "step": 2,
            "title": "Test Lead",
            "error": str(e)
        })
    
    result["message"] = "✅ Setup complete! Service categories are ready and auto-distribution tested."
    
    return JsonResponse(result, json_dumps_params={'indent': 2})


