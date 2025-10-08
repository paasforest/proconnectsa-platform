"""
Emergency restart trigger - pulls latest code and restarts service
Visit: https://api.proconnectsa.co.za/api/leads/emergency-update/
"""
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
import subprocess
import os


@require_http_methods(["GET"])
def emergency_update_view(request):
    """Pull latest code and restart service"""
    
    result = {
        "status": "attempting",
        "steps": []
    }
    
    try:
        # Step 1: Pull latest code
        os.chdir('/home/paas/proconnectsa-platform')
        pull_result = subprocess.run(
            ['git', 'pull', 'origin', 'main'],
            capture_output=True,
            text=True,
            timeout=10
        )
        
        result["steps"].append({
            "step": "git pull",
            "success": pull_result.returncode == 0,
            "output": pull_result.stdout[:200]
        })
        
        # Step 2: Restart backend service
        restart_result = subprocess.run(
            ['sudo', 'systemctl', 'restart', 'procompare-backend'],
            capture_output=True,
            text=True,
            timeout=10
        )
        
        result["steps"].append({
            "step": "restart service",
            "success": restart_result.returncode == 0,
            "output": restart_result.stdout[:200] if restart_result.returncode == 0 else restart_result.stderr[:200]
        })
        
        result["status"] = "success" if restart_result.returncode == 0 else "partial"
        result["message"] = "✅ Service restarted! Categories will be created automatically."
        
    except Exception as e:
        result["status"] = "error"
        result["error"] = str(e)
        result["message"] = "❌ Could not restart service. May need manual intervention."
    
    return JsonResponse(result, json_dumps_params={'indent': 2})


